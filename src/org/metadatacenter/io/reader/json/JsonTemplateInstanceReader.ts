import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { ComparisonError } from '../../../model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../model/cedar/util/compare/ComparisonErrorType';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonAbstractInstanceArtifactReader } from './JsonAbstractInstanceArtifactReader';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';
import { JsonTemplateInstanceReaderResult } from './JsonTemplateInstanceReaderResult';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { InstanceDataContainer } from '../../../model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataStringAtom } from '../../../model/cedar/template-instance/InstanceDataStringAtom';
import { InstanceDataAtomList } from '../../../model/cedar/template-instance/InstanceDataAtomList';
import { InstanceDataLinkAtom } from '../../../model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataAtomType } from '../../../model/cedar/template-instance/InstanceDataAtomType';
import { InstanceDataEmptyAtom } from '../../../model/cedar/template-instance/InstanceDataEmptyAtom';
import { InstanceDataControlledAtom } from '../../../model/cedar/template-instance/InstanceDataControlledAtom';
import { InstanceDataTypedAtom } from '../../../model/cedar/template-instance/InstanceDataTypedAtom';
import { InstanceDataEmptyNode } from '../../../model/cedar/template-instance/InstanceDataEmptyNode';
import { InstanceDataAttributeValueFieldName } from '../../../model/cedar/template-instance/InstanceDataAttributeValueFieldName';
import { InstanceDataAttributeValueField } from '../../../model/cedar/template-instance/InstanceDataAttributeValueField';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { JsonTemplateInstanceContent } from '../../../model/cedar/util/serialization/JsonTemplateInstanceContent';
import { AttributeValueNamePolicy } from '../../../model/cedar/template-instance/AttributeValueNamePolicy';

export class JsonTemplateInstanceReader extends JsonAbstractInstanceArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_INSTANCE;
  protected knownKeys: Record<string, boolean> = {
    [JsonSchema.atId]: true,
    [JsonSchema.oslcModifiedBy]: true,
    [JsonSchema.pavLastUpdatedOn]: true,
    [JsonSchema.pavCreatedBy]: true,
    [JsonSchema.pavCreatedOn]: true,
    [JsonSchema.schemaDescription]: true,
    [JsonSchema.schemaName]: true,
    [JsonSchema.schemaIsBasedOn]: true,
    [JsonSchema.atContext]: true,
    [CedarModel.annotations]: true,
  };

  private constructor(behavior: JsonReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): JsonTemplateInstanceReader {
    return new JsonTemplateInstanceReader(JsonReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JsonTemplateInstanceReader {
    return new JsonTemplateInstanceReader(JsonReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JsonReaderBehavior): JsonTemplateInstanceReader {
    return new JsonTemplateInstanceReader(behavior);
  }

  public readFromString(instanceSourceString: string): JsonTemplateInstanceReaderResult {
    let instanceObject;
    try {
      instanceObject = JSON.parse(instanceSourceString);
    } catch {
      instanceObject = {};
    }
    return this.readFromObject(instanceObject, new JsonPath());
  }

  public readFromObject(instanceSourceObject: JsonNode, topPath?: JsonPath): JsonTemplateInstanceReaderResult {
    const parsingResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
    const instance = TemplateInstance.buildEmptyWithNullValues();

    this.readNonReportableAttributes(instance, instanceSourceObject);

    // The caller's path was accepted and then discarded in favour of a fresh
    // one, so anything reported here was rooted at the document rather than
    // where the document actually sits. It mattered for nothing while nothing
    // was reported; it does now.
    const path = topPath ?? new JsonPath();
    this.readInstanceData(instanceSourceObject, instance, path, parsingResult);
    JsonTemplateInstanceReader.reportEnvelope(instanceSourceObject, path, parsingResult);

    return new JsonTemplateInstanceReaderResult(instance, parsingResult, instanceSourceObject);
  }

  /**
   * The keys a saved instance carries around its data.
   *
   * `@context` binds every child name to an IRI, `schema:isBasedOn` identifies
   * the template the document claims to instantiate, `@id` names the document
   * itself, and the four provenance keys record who wrote it and when. Together
   * they are the difference between an instance and a bag of values.
   */
  private static readonly ENVELOPE_KEYS: ReadonlyArray<string> = [
    JsonSchema.atContext,
    JsonSchema.atId,
    JsonSchema.schemaIsBasedOn,
    JsonSchema.pavCreatedOn,
    JsonSchema.pavCreatedBy,
    JsonSchema.oslcModifiedBy,
    JsonSchema.pavLastUpdatedOn,
  ];

  /**
   * What the envelope is missing, as warnings.
   *
   * `knownKeys` listed the envelope and nothing consulted it, so an instance
   * with no `@id`, no `schema:isBasedOn`, no provenance and an empty `@context`
   * read as clean — the reader skipped those keys as "known" and never asked
   * whether they were there. That is the whole of
   * https://github.com/metadatacenter/cedar-model-typescript-library/issues/2.
   *
   * Warnings rather than errors, and the corpus is the reason: 29 of its 121
   * instances carry no envelope at all. They are not malformed. An instance has
   * no `@id` or provenance until it is saved, and the CEDAR Embeddable Editor's
   * "extract" form strips `@context` from documents it passes around. Rejecting
   * those would make the reader unable to open documents that demonstrably
   * exist, which is the same trap the template reader avoids for pre-2024 forms.
   *
   * So the two verdicts split the answer: `wasSuccessful` stays true, because
   * the document read and the values are usable, while `adheresToBlueprint`
   * turns false, because this is not what a complete instance looks like. A
   * caller that wants to know before saving asks the second one.
   */
  private static reportEnvelope(sourceObject: JsonNode, path: JsonPath, parsingResult: JsonArtifactParsingResult): void {
    for (const key of JsonTemplateInstanceReader.ENVELOPE_KEYS) {
      if (!Object.hasOwn(sourceObject, key)) {
        parsingResult.addBlueprintComparisonWarning(
          new ComparisonError('JsonTemplateInstanceReader', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, path.add(key), key),
        );
        continue;
      }
      // Present and empty is its own case. `pav:createdOn: null` is how a
      // document that was never saved spells the key it has no value for, and an
      // `@context` of `{}` binds nothing — neither is more complete than the
      // absence, so neither passes quietly.
      const value = ReaderUtil.getNode(sourceObject, key);
      const empty = value === null || value === undefined || (key === JsonSchema.atContext && Object.keys(value).length === 0);
      if (empty) {
        parsingResult.addBlueprintComparisonWarning(
          new ComparisonError('JsonTemplateInstanceReader', ComparisonErrorType.MISSING_VALUE_IN_REAL_OBJECT, path.add(key), key, null),
        );
      }
    }
  }

  protected readInstanceData(
    sourceObject: JsonNode,
    instance: TemplateInstance,
    path: JsonPath,
    parsingResult: JsonArtifactParsingResult,
  ): void {
    instance.dataContainer = this.readInstanceContainer(sourceObject, path, parsingResult);
    this.readAnnotations(instance, sourceObject);
  }

  private readInstanceContainer(sourceObject: JsonNode, path: JsonPath, parsingResult: JsonArtifactParsingResult): InstanceDataContainer {
    return this.parseContainer(sourceObject, path, parsingResult);
  }

  protected isKnownKey(key: string): boolean {
    return Object.hasOwn(this.knownKeys, key);
  }

  private parseContainer(sourceObject: JsonNode, path: JsonPath, parsingResult: JsonArtifactParsingResult): InstanceDataContainer {
    const ret: InstanceDataContainer = new InstanceDataContainer();
    Object.keys(sourceObject).forEach((key) => {
      if (!this.isKnownKey(key)) {
        const content: JsonNode = ReaderUtil.getNode(sourceObject, key);
        if (Array.isArray(content)) {
          const arrayContainer: InstanceDataAtomList = [];
          ret.setValue(key, arrayContainer);
          content.forEach((arrayElement: JsonNode, index: number) => {
            arrayContainer[index] = this.parseNode(arrayElement, path.add(key, index), parsingResult);
          });
        } else {
          ret.setValue(key, this.parseNode(content, path.add(key), parsingResult));
        }
      }
    });
    // Nested containers run through this method in their own right. Report
    // only this level here so a nested conflict is not repeated once for every
    // ancestor on the way back out of the recursive parse.
    for (const conflict of AttributeValueNamePolicy.findConflicts(ret).filter((candidate) => candidate.path.length === 0)) {
      parsingResult.addBlueprintComparisonError(
        new ComparisonError(
          'JsonTemplateInstanceReader',
          ComparisonErrorType.VALUE_MISMATCH,
          path.add(...conflict.path, conflict.groupName, conflict.name),
          'a unique, non-reserved attribute-value name',
          conflict.name,
        ),
      );
    }
    this.packAttributeValues(ret);

    // `"@context": null` is a present key with nothing in it, and every lookup
    // below starts with `Object.hasOwn`, which throws on null — so a document
    // carrying one took the reader down instead of parsing. The same trap as a
    // null child in `parseNode`. There are no mappings to read either way, and
    // `reportEnvelope` is what says the context is missing.
    const atContextNode = Object.hasOwn(sourceObject, JsonSchema.atContext) ? ReaderUtil.getNode(sourceObject, JsonSchema.atContext) : null;
    if (atContextNode !== null && atContextNode !== undefined) {
      const atContext = atContextNode;
      // add iri mapping for regular fields
      Object.keys(ret.values).forEach((key) => {
        const iri = ReaderUtil.getString(atContext, key);
        if (iri !== null) {
          ret.setIri(key, iri);
        }
      });

      // add iri for AV fields
      Object.keys(ret.values).forEach((key: string) => {
        const field = ret.values[key];
        if (field instanceof InstanceDataAttributeValueField) {
          Object.keys(field.values).forEach((avElementName: string) => {
            const iri = ReaderUtil.getString(atContext, avElementName);
            if (iri !== null) {
              ret.setIri(avElementName, iri);
            }
          });
        }
      });

      // Keep the mapping for children that carry no data.
      //
      // The two passes above walk `ret.values`, so they only see children the
      // instance actually populated. A template may declare more children than
      // the data fills, and their @context entries were being dropped — which
      // made a round trip through this library non-idempotent for any such
      // instance. Anything not already covered by the standard prefixes and
      // typed entries is a child property IRI and belongs in the output.
      Object.keys(atContext).forEach((key: string) => {
        if (Object.hasOwn(JsonTemplateInstanceContent.CONTEXT_VERBATIM, key)) {
          return;
        }
        const iri = ReaderUtil.getString(atContext, key);
        if (iri !== null) {
          ret.setIri(key, iri);
        }
      });
    }

    // Add @id. Compatibility readers must be able to open the production form
    // CEDAR itself once wrote for an unassigned element occurrence: "@id": "".
    // Keep the value in the read model so the departure remains observable, but
    // record it as a warning; the writer turns it into null, which is the
    // canonical request for the repository to assign an occurrence identifier.
    // STRICT still refuses it. The document root has already passed through
    // readNonReportableAttributes, so this leniency applies only to nested
    // containers, not to an artifact pretending its own identifier is blank.
    if (Object.hasOwn(sourceObject, JsonSchema.atId)) {
      const atId = ReaderUtil.getString(sourceObject, JsonSchema.atId);
      if (atId !== null) {
        if (atId.trim() === '') {
          if (!this.behavior.useWarningForKnownIssues()) {
            JsonTemplateInstanceReader.refuseEmptyIdentifier(sourceObject);
          }
          parsingResult.addBlueprintComparisonWarning(
            new ComparisonError(
              'JsonTemplateInstanceReader',
              ComparisonErrorType.VALUE_MISMATCH,
              path.add(JsonSchema.atId),
              'an absolute IRI or null while the occurrence awaits server assignment',
              atId,
            ),
          );
        }
        ret.id = atId;
      }
    }
    return ret;
  }

  /**
   * Everything a field's value may carry, and nothing an element would.
   * `@type` and `skos:notation` appear on controlled terms; `@id` and
   * `rdfs:label` are the IRI-valued pair; `@value` is the literal case.
   */
  private static readonly VALUE_ATOM_KEYS: ReadonlySet<string> = new Set([
    JsonSchema.atValue,
    JsonSchema.atId,
    JsonSchema.rdfsLabel,
    JsonSchema.atType,
    CedarModel.skosNotation,
  ]);

  /**
   * True when this node is a field's value rather than an element.
   *
   * A value carries only value keys. Anything else holding an `@id` is an
   * element that has simply not written its `@context` — which is what the
   * CEDAR Embeddable Editor's "extract" form of an instance looks like, and
   * reading `@id` alone as the signal turns every element in it into a link
   * atom, losing the whole subtree.
   *
   * Public because consumers keep needing to ask it and keep answering it
   * differently. CEE had three separate rules for it — one matching on exact
   * key counts, which deleted the `@id` of any controlled term or link that
   * also carried a `@type`.
   */
  public static isValueNode(sourceObject: JsonNode | string | null): boolean {
    if (sourceObject === null || sourceObject === undefined) {
      return false;
    }
    if (typeof sourceObject === 'string') {
      // An attribute-value field's slot holds the attribute's name.
      return true;
    }
    if (Object.hasOwn(sourceObject, JsonSchema.atValue)) {
      return true;
    }
    if (Object.hasOwn(sourceObject, JsonSchema.atContext)) {
      return false;
    }
    const keys = Object.keys(sourceObject);
    return keys.length > 0 && keys.every((key) => JsonTemplateInstanceReader.VALUE_ATOM_KEYS.has(key));
  }

  /**
   * Classify one value node on its own, without a surrounding instance.
   *
   * The type is the answer to what the value *is*: a `InstanceDataLinkAtom`
   * carries its IRI, a `InstanceDataControlledAtom` its label, a
   * `InstanceDataStringAtom` its literal. A consumer holding a bare node — a
   * validator, a report — otherwise has to re-derive that from the keys.
   */
  public static readValueNode(sourceObject: JsonNode | string | null): InstanceDataAtomType {
    if (sourceObject === null || sourceObject === undefined) {
      return new InstanceDataEmptyNode();
    }
    if (typeof sourceObject === 'string') {
      return new InstanceDataAttributeValueFieldName(sourceObject);
    }
    if (!JsonTemplateInstanceReader.isValueNode(sourceObject)) {
      return new InstanceDataEmptyNode();
    }
    return JsonTemplateInstanceReader.parseDataAtom(sourceObject);
  }

  private parseNode(
    sourceObject: JsonNode | string | null,
    path: JsonPath,
    parsingResult: JsonArtifactParsingResult,
  ): InstanceDataAtomType {
    // `null` is how an element with no occurrences is written, and it reaches
    // here both on its own and as a member of a list. Every check below starts
    // with `Object.hasOwn`, which throws on it, so an instance containing one
    // took the reader down rather than parsing.
    if (sourceObject === null || sourceObject === undefined) {
      return new InstanceDataEmptyNode();
    }
    if (typeof sourceObject === 'string') {
      return new InstanceDataAttributeValueFieldName(sourceObject);
    }
    if (JsonTemplateInstanceReader.isValueNode(sourceObject)) {
      const atom = JsonTemplateInstanceReader.parseDataAtom(sourceObject);
      JsonTemplateInstanceReader.reportNullIri(atom, path, parsingResult);
      return atom;
    }
    if (Object.keys(sourceObject).length === 0) {
      return new InstanceDataEmptyNode();
    }
    return this.parseContainer(sourceObject, path, parsingResult);
  }

  /**
   * `{"@id": null}` is malformed, and was being preserved rather than reported.
   *
   * `@value` and `@id` are not symmetrical. A literal's `@value` may be null —
   * JSON-LD permits it and CEDAR declares the property `["string", "null"]`,
   * which is how an unfilled literal is written. An `@id` may not: JSON-LD
   * requires an IRI, and CEDAR's templates declare it
   * `{"type": "string", "format": "uri"}` with no null branch. An unfilled link
   * or controlled-term field is written `{}`.
   *
   * The round trip made this invisible. The reader took `{"@id": null}` as a
   * link atom holding a null id and the writer emitted it straight back, so the
   * document survived intact and no stage objected. Reporting it here is the
   * point at which the library stops passing an invalid document through in
   * silence.
   *
   * The node is still parsed and preserved — fidelity is not the thing being
   * fixed. What changes is that the verdict now says so.
   */
  private static reportNullIri(atom: InstanceDataAtomType, path: JsonPath, parsingResult: JsonArtifactParsingResult): void {
    const nullIri = (atom instanceof InstanceDataLinkAtom || atom instanceof InstanceDataControlledAtom) && atom.id === null;
    if (nullIri) {
      parsingResult.addBlueprintComparisonError(
        new ComparisonError(
          'JsonTemplateInstanceReader',
          ComparisonErrorType.MISSING_VALUE_IN_REAL_OBJECT,
          path.add(JsonSchema.atId),
          'an IRI',
          null,
        ),
      );
    }
  }

  private static parseDataAtom(content: JsonNode): InstanceDataAtomType {
    if (Object.hasOwn(content, JsonSchema.atValue)) {
      const value = ReaderUtil.getString(content, JsonSchema.atValue);
      const type = ReaderUtil.getString(content, JsonSchema.atType);
      if (type === null) {
        return new InstanceDataStringAtom(value);
      } else {
        return new InstanceDataTypedAtom(value, type);
      }
    }
    if (Object.hasOwn(content, JsonSchema.atId)) {
      JsonTemplateInstanceReader.refuseEmptyIdentifier(content);
      const id = ReaderUtil.getString(content, JsonSchema.atId);
      const label = ReaderUtil.getString(content, JsonSchema.rdfsLabel);
      // `fromParsedNode` on both: a document that arrives with a null `@id` is
      // preserved as it came and reported by `reportNullIri`, rather than
      // refused here. See the note on that method.
      if (label === null) {
        return InstanceDataLinkAtom.fromParsedNode(id);
      } else {
        return InstanceDataControlledAtom.fromParsedNode(id, label);
      }
    }
    // Neither a literal nor an IRI, so there is no value here — but the node was
    // not empty either, or `isValueNode` would not have sent it this way. The
    // usual case is `{"rdfs:label": "..."}`: a label with nothing to label.
    // Carrying what was dropped lets a consumer report it instead of showing an
    // empty field for no stated reason.
    return new InstanceDataEmptyAtom(content);
  }

  private packAttributeValues(dataContainer: InstanceDataContainer) {
    const values = dataContainer.values;
    const newAttributeValues: InstanceDataAttributeValueField[] = [];
    Object.keys(values).forEach((key) => {
      const value: InstanceDataAtomType = values[key];
      if (Array.isArray(value)) {
        let foundNonAttributeValueName = false;
        value.forEach((arrayElement: InstanceDataAtomType, _index: number) => {
          if (!(arrayElement instanceof InstanceDataAttributeValueFieldName)) {
            foundNonAttributeValueName = true;
          }
        });
        /**
         * `[]` is an empty list, not an empty attribute-value field.
         *
         * What identifies an attribute-value field is that its slots hold
         * attribute *names*. An empty array holds none, so nothing in it points
         * that way — but "every entry is a name" is vacuously true of it, and it
         * was being folded into an attribute-value field on that alone. Any
         * multi child the user simply had not filled came back as one, and a
         * consumer holding the template then saw a cardinality mismatch on every
         * unfilled multi child in the document.
         *
         * Both shapes still serialize to `[]`, so no round trip changes; what
         * changes is that the empty list is read as the empty list it is.
         */
        if (value.length > 0 && !foundNonAttributeValueName) {
          const avField = new InstanceDataAttributeValueField(key);
          newAttributeValues.push(avField);
          value.forEach((arrayElement: InstanceDataAttributeValueFieldName, _index: number) => {
            const avName: string | null = arrayElement.name;
            if (avName !== null) {
              if (Object.hasOwn(values, avName)) {
                const avValue: InstanceDataStringAtom = values[avName] as InstanceDataStringAtom;
                avField.addValue(avName, avValue);
              }
            }
          });
        }
      }
    });

    newAttributeValues.forEach((avField: InstanceDataAttributeValueField, _index: number) => {
      const avName: string | null = avField.name;
      if (avName !== null) {
        values[avName] = avField;
        Object.keys(avField.values).forEach((key) => {
          if (Object.hasOwn(values, key)) {
            delete values[key];
          }
        });
      }
    });

    dataContainer.values = values;
  }
}

import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
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

export class JsonTemplateInstanceReader extends JsonAbstractInstanceArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_INSTANCE;
  protected knownKeys = {
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
    } catch (Exception) {
      instanceObject = {};
    }
    return this.readFromObject(instanceObject, new JsonPath());
  }

  public readFromObject(instanceSourceObject: JsonNode, _topPath: JsonPath): JsonTemplateInstanceReaderResult {
    const parsingResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
    const instance = TemplateInstance.buildEmptyWithNullValues();

    this.readNonReportableAttributes(instance, instanceSourceObject);

    this.readInstanceData(instanceSourceObject, instance, new JsonPath());

    return new JsonTemplateInstanceReaderResult(instance, parsingResult, instanceSourceObject);
  }

  protected readInstanceData(sourceObject: JsonNode, instance: TemplateInstance, path: JsonPath): void {
    instance.dataContainer = this.readInstanceContainer(sourceObject, path);
    this.readAnnotations(instance, sourceObject);
  }

  private readInstanceContainer(sourceObject: JsonNode, path: JsonPath): InstanceDataContainer {
    return this.parseContainer(sourceObject, path);
  }

  protected isKnownKey(key: string): boolean {
    return Object.hasOwn(this.knownKeys, key);
  }

  private parseContainer(sourceObject: JsonNode, path: JsonPath): InstanceDataContainer {
    const ret: InstanceDataContainer = new InstanceDataContainer();
    Object.keys(sourceObject).forEach((key) => {
      if (!this.isKnownKey(key)) {
        const content: JsonNode = ReaderUtil.getNode(sourceObject, key);
        if (Array.isArray(content)) {
          const arrayContainer: InstanceDataAtomList = [];
          ret.setValue(key, arrayContainer);
          content.forEach((arrayElement: JsonNode, index: number) => {
            arrayContainer[index] = this.parseNode(arrayElement, path.add(key, index));
          });
        } else {
          ret.setValue(key, this.parseNode(content, path.add(key)));
        }
      }
    });
    this.packAttributeValues(ret);

    if (Object.hasOwn(sourceObject, JsonSchema.atContext)) {
      const atContext = ReaderUtil.getNode(sourceObject, JsonSchema.atContext);
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

    // add @id
    if (Object.hasOwn(sourceObject, JsonSchema.atId)) {
      const atId = ReaderUtil.getString(sourceObject, JsonSchema.atId);
      if (atId !== null) {
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

  private parseNode(sourceObject: JsonNode | string | null, path: JsonPath): InstanceDataAtomType {
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
      return JsonTemplateInstanceReader.parseDataAtom(sourceObject);
    }
    if (Object.keys(sourceObject).length === 0) {
      return new InstanceDataEmptyNode();
    }
    return this.parseContainer(sourceObject, path);
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
      const id = ReaderUtil.getString(content, JsonSchema.atId);
      const label = ReaderUtil.getString(content, JsonSchema.rdfsLabel);
      if (label === null) {
        return new InstanceDataLinkAtom(id);
      } else {
        return new InstanceDataControlledAtom(id, label);
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
        if (!foundNonAttributeValueName) {
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

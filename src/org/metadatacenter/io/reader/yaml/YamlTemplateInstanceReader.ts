import { IdentifierPolicy } from '../../../policy/IdentifierPolicy';
import { YamlKeyTracking } from './YamlKeyTracking';
import { YamlSourcePolicy, yamlSpelling } from './YamlSourcePolicy';
import { ExactDecimal } from '../../../policy/NumericPolicy';
import { ReservedNames } from '../../../model/cedar/ReservedNames';
import { InstanceDataNotationAtom } from '../../../model/cedar/template-instance/InstanceDataNotationAtom';
import { InstanceDataLabelAtom } from '../../../model/cedar/template-instance/InstanceDataLabelAtom';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlAbstractArtifactReader } from './YamlAbstractArtifactReader';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { IsoDate } from '../../../model/cedar/types/wrapped-types/IsoDate';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { ReaderUtil } from '../ReaderUtil';
import { TemplateInstance } from '../../../model/cedar/template-instance/TemplateInstance';
import { YamlTemplateInstanceReaderResult } from './YamlTemplateInstanceReaderResult';
import { InstanceDataContainer } from '../../../model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataAtomType } from '../../../model/cedar/template-instance/InstanceDataAtomType';
import { InstanceDataAtomList } from '../../../model/cedar/template-instance/InstanceDataAtomList';
import { InstanceDataStringAtom } from '../../../model/cedar/template-instance/InstanceDataStringAtom';
import { InstanceDataTypedAtom } from '../../../model/cedar/template-instance/InstanceDataTypedAtom';
import { InstanceDataLinkAtom } from '../../../model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataControlledAtom } from '../../../model/cedar/template-instance/InstanceDataControlledAtom';
import { InstanceDataEmptyNode } from '../../../model/cedar/template-instance/InstanceDataEmptyNode';
import { InstanceDataAttributeValueField } from '../../../model/cedar/template-instance/InstanceDataAttributeValueField';
import { AttributeValueNamePolicy } from '../../../model/cedar/template-instance/AttributeValueNamePolicy';
import { ComparisonError } from '../../../model/cedar/util/compare/ComparisonError';
import { YamlComparisonErrorType } from '../../../model/cedar/util/compare/YamlComparisonErrorType';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';

const ELEMENT_INSTANCE_TYPE = 'element-instance';

/** The keys other than its datatype that describe a field's value. Each holds text. */
const DESCRIPTION_KEYS: readonly string[] = [YamlKeys.label, YamlKeys.notation, YamlKeys.prefLabel, YamlKeys.language];

/**
 * Read a CEDAR template instance from YAML into the same `TemplateInstance` the
 * JSON reader produces — the serialization the `YamlTemplateInstanceWriter`
 * emits, read back.
 *
 * The YAML instance is the lean form: field data sits under a `children` block,
 * a value is `value` / `id` / `datatype` / `label` where the JSON uses `@value`
 * / `@id` / `@type` / `rdfs:label`, an element nests its own `id` and `children`,
 * and an attribute-value field sits at the container level with its attributes
 * named directly. Two things the JSON instance carries are deliberately absent
 * and cannot be recovered from the YAML alone: the `@context` property IRIs and
 * the empty slots the template's JSON Schema requires. Both are template data;
 * `InstanceInflater` reconstructs them. This reader's job is the values.
 */
export class YamlTemplateInstanceReader extends YamlAbstractArtifactReader {
  private constructor(behavior: YamlReaderBehavior, isCompact: boolean = false) {
    super(behavior, isCompact);
  }

  public static getStrict(): YamlTemplateInstanceReader {
    return new YamlTemplateInstanceReader(YamlReaderBehavior.STRICT);
  }

  /**
   * A reader for the compact form, which names neither the instance nor what a repository records
   * about it. An instance has no model version to give the ordinary reader away, so asking for this
   * one is what says which form is meant — and it is what refuses a document that names its instance.
   */
  public static getStrictForCompact(): YamlTemplateInstanceReader {
    return new YamlTemplateInstanceReader(YamlReaderBehavior.STRICT, true);
  }

  public static getForBehavior(behavior: YamlReaderBehavior, isCompact: boolean = false): YamlTemplateInstanceReader {
    return new YamlTemplateInstanceReader(behavior, isCompact);
  }

  public readFromString(instanceSourceString: string): YamlTemplateInstanceReaderResult {
    const instanceObject = YamlSourcePolicy.parse(instanceSourceString);
    return this.readFromObject(instanceObject);
  }

  public readFromObject(sourceObject: JsonNode): YamlTemplateInstanceReaderResult {
    return YamlKeyTracking.read(sourceObject, '', (instanceSourceObject) => {
      const parsingResult = new YamlArtifactParsingResult();
      const instance = TemplateInstance.buildEmptyWithNullValues();
      const source = instanceSourceObject ?? {};
      YamlTemplateInstanceReader.refuseNullAndEmptyValues(source, '', true);
      YamlTemplateInstanceReader.assertType(source, YamlArtifactType.TEMPLATE_INSTANCE, 'A template instance');

      instance.schema_name = YamlTemplateInstanceReader.readName(source, '', 'A template instance');
      // No description is the empty string, never null.
      YamlTemplateInstanceReader.assertText(source, YamlKeys.description, '');
      instance.schema_description = ReaderUtil.getString(source, YamlKeys.description) ?? '';
      instance.descriptionWasAbsent = ReaderUtil.getString(source, YamlKeys.description) === null;
      instance.at_id = CedarArtifactId.forValue(ReaderUtil.getIdentifier(source, YamlKeys.id));
      if (!Object.hasOwn(source, YamlKeys.isBasedOn)) {
        throw new Error(`No ${YamlKeys.isBasedOn} present. A template instance names the template it is based on, as Java requires.`);
      }
      // A compatibility reader takes the legacy empty spelling as absence, and the writer omits the
      // optional key; a strict one refuses it, as Java does.
      const lenient = this.behavior.useWarningForKnownIssues();
      instance.schema_isBasedOn = CedarArtifactId.forValue(ReaderUtil.getArtifactIdentifier(source, YamlKeys.isBasedOn, lenient));
      instance.pav_derivedFrom = CedarArtifactId.forValue(ReaderUtil.getArtifactIdentifier(source, YamlKeys.derivedFrom, lenient));
      // The writer emits an instance's provenance and its annotations; both were read by nobody, so
      // either one was lost by writing what had just been read. Who created and last modified the
      // instance are IRIs, as in Java's reader, so an empty string or a number is refused.
      YamlAbstractArtifactReader.refuseEmptyIdentifier(source, YamlKeys.createdBy);
      YamlAbstractArtifactReader.refuseEmptyIdentifier(source, YamlKeys.modifiedBy);
      instance.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(source, YamlKeys.createdBy));
      instance.pav_createdOn = IsoDate.forValue(ReaderUtil.getString(source, YamlKeys.createdOn));
      instance.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(source, YamlKeys.modifiedBy));
      instance.pav_lastUpdatedOn = IsoDate.forValue(ReaderUtil.getString(source, YamlKeys.modifiedOn));
      this.readAnnotations(instance, source, parsingResult, new JsonPath());

      instance.dataContainer = this.parseContainer(source, '', true);
      for (const conflict of AttributeValueNamePolicy.findConflicts(instance.dataContainer, 'template', true)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'YamlTemplateInstanceReader',
            YamlComparisonErrorType.VALUE_MISMATCH,
            new JsonPath(...AttributeValueNamePolicy.locationOf(conflict)),
            'a unique, non-reserved attribute-value name',
            conflict.name,
          ),
        );
      }
      return new YamlTemplateInstanceReaderResult(instance, parsingResult, sourceObject ?? {});
    });
  }

  /**
   * Keys that name the instance rather than its data, so are not attribute-value fields. Nested
   * elements reserve only their discriminator, identity and children block, matching Java; `name`
   * can be an attribute-group name there. An annotation block is the artifact's, not a field named
   * `annotations`: left unreserved, the attribute-value fallback below claimed it, and an annotation
   * carrying an IRI rather than a literal came out of that as a null-valued attribute the writer
   * then dropped.
   */
  private static readonly RESERVED_KEYS: ReadonlySet<string> = ReservedNames.TEMPLATE_INSTANCE_YAML_KEYS;

  private static readonly ELEMENT_RESERVED_KEYS: ReadonlySet<string> = ReservedNames.NESTED_ELEMENT_INSTANCE_YAML_KEYS;

  private parseContainer(node: JsonNode, path: string, isDocumentRoot: boolean = false): InstanceDataContainer {
    const container = new InstanceDataContainer();
    container.types = YamlTemplateInstanceReader.readTypes(node, path);

    // A child is a mapping, or a list of mappings for a repeated child, as Java's reader requires.
    const childrenPath = `${path}/${YamlKeys.children}`;
    const children: unknown = ReaderUtil.getNode(node, YamlKeys.children);
    if (!YamlTemplateInstanceReader.isMapping(children)) {
      throw new Error(`Expected a mapping of child instances at ${childrenPath}.`);
    }
    Object.keys(children).forEach((key) => {
      const content: unknown = children[key];
      const childPath = `${childrenPath}/${key}`;
      if (Array.isArray(content)) {
        content.forEach((entry: unknown, index: number) => {
          if (!YamlTemplateInstanceReader.isMapping(entry)) {
            throw new Error(`Expected a mapping for the entry of a multi-instance list at ${childPath}[${index}].`);
          }
        });
        // A repeated child is a list of elements or a list of fields. Java's reader holds every entry
        // to the first one's kind, so a list holding both is refused rather than read two ways.
        const entries = content as JsonNode[];
        const isElement = YamlTemplateInstanceReader.isElementEntry(entries[0]);
        const mixed = entries.findIndex((entry) => YamlTemplateInstanceReader.isElementEntry(entry) !== isElement);
        if (mixed >= 0) {
          throw new Error(`The repeated child at ${childPath}[${mixed}] mixes element and field entries.`);
        }
        const list: InstanceDataAtomList = [];
        container.setValue(key, list);
        entries.forEach((entry: JsonNode, index: number) => {
          list[index] = this.parseNode(entry, `${childPath}[${index}]`);
        });
      } else if (YamlTemplateInstanceReader.isMapping(content)) {
        container.setValue(key, this.parseNode(content, childPath));
      } else {
        throw new Error(`Expected a mapping or a list for the child instance at ${childPath}.`);
      }
    });

    // Attribute-value fields sit beside `children`, their attributes named
    // directly: `<field>: { <attr>: { value: … } }`. A reader without the template can not tell a
    // misspelled key holding a mapping from a field whose name the form-filler chose, so every
    // mapping there is one and the template judges it. A scalar or a list there is not one, and is
    // left unread, so the document is refused for it, as Java's reader refuses it.
    YamlKeyTracking.untracked(() => Object.keys(node)).forEach((key) => {
      const reserved = isDocumentRoot ? YamlTemplateInstanceReader.RESERVED_KEYS : YamlTemplateInstanceReader.ELEMENT_RESERVED_KEYS;
      if (reserved.has(key)) {
        return;
      }
      const avNode: unknown = YamlKeyTracking.untracked(() => node[key]);
      if (!YamlTemplateInstanceReader.isMapping(avNode)) {
        return;
      }
      YamlKeyTracking.use(node, key);
      const avField = new InstanceDataAttributeValueField(key);
      Object.keys(avNode).forEach((attrName) => {
        avField.addValue(attrName, YamlTemplateInstanceReader.parseAttributeValue(avNode, attrName, `${path}/${key}/${attrName}`));
      });
      container.setValue(key, avField);
    });

    const id = ReaderUtil.getIdentifier(node, YamlKeys.id);
    if (id !== null) {
      container.id = id;
    }
    return container;
  }

  /**
   * An attribute is a field's value, held to the same rules and read the same way, as Java's reader
   * reads it. Reading only its `value` lost the label the writer emits, and its datatype and
   * identifier with it.
   */
  private static parseAttributeValue(field: JsonNode, attrName: string, path: string): InstanceDataAtomType {
    const node: unknown = field[attrName];
    if (!YamlTemplateInstanceReader.isMapping(node)) {
      throw new Error(`Expected a mapping for the attribute-value field at ${path}.`);
    }
    return YamlTemplateInstanceReader.parseFieldValue(node, path);
  }

  /**
   * Hold a field's value to what Java's reader takes: an id or a value but not both, at most one
   * datatype and that an IRI, a literal that is a string, number or boolean, and text for the label,
   * notation, preferred label and language.
   */
  private static assertFieldValue(node: JsonNode, path: string): void {
    if (Object.hasOwn(node, YamlKeys.id) && Object.hasOwn(node, YamlKeys.value)) {
      throw new Error('A field cannot contain both id and value.');
    }
    // One slot, as in Java's reader: the YAML form writes a lone datatype as a string.
    if (Array.isArray(node[YamlKeys.datatype])) {
      throw new Error('A field value can have at most one datatype.');
    }
    YamlTemplateInstanceReader.assertText(node, YamlKeys.datatype, path);
    ReaderUtil.assertIri(ReaderUtil.getString(node, YamlKeys.datatype), YamlKeys.datatype);
    ReaderUtil.assertFieldIri(ReaderUtil.getString(node, YamlKeys.id), YamlKeys.id);
    const value: unknown = node[YamlKeys.value];
    const isLiteral = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || ExactDecimal.isExact(value);
    if (Object.hasOwn(node, YamlKeys.value) && value !== null && !isLiteral) {
      throw new Error(`Expected a string, number or boolean at ${path}/${YamlKeys.value}.`);
    }
    DESCRIPTION_KEYS.forEach((key) => YamlTemplateInstanceReader.assertText(node, key, path));
  }

  /**
   * A field value, read as a string. An unquoted number or boolean is read as the text it was written
   * as, so `007` stays `007`: a field holds a literal, which a YAML 1.2 core resolver would otherwise
   * read as the number 7. Java's reader keeps the same text. A value the source policy did not parse
   * has no recorded text, and is read as the string form of the value it holds.
   */
  private static readValue(node: JsonNode, key: string): string | null {
    const raw: unknown = node[key];
    if (typeof raw === 'number' || typeof raw === 'boolean' || ExactDecimal.isExact(raw)) {
      return yamlSpelling(node, key) ?? String(raw);
    }
    return ReaderUtil.getString(node, key);
  }

  /** An element carries a `children` block, or is the stub written for an empty repeated one; a value never is. */
  /**
   * The classes an instance or an element occurrence states under `instanceType`, its JSON-LD
   * `@type`, as Java's reader reads them: a string is one class, a list several in order, and each an
   * absolute IRI.
   */
  private static readTypes(node: JsonNode, path: string): string[] {
    if (!Object.hasOwn(node, YamlKeys.instanceType)) return [];
    const stated: unknown = node[YamlKeys.instanceType];
    const types = Array.isArray(stated) ? stated : [stated];
    if (types.length === 0) throw new Error(`Instance types must not be empty at ${path}/${YamlKeys.instanceType}.`);
    return types.map((type) => {
      if (typeof type !== 'string') throw new Error(`An instance type must be an IRI string at ${path}/${YamlKeys.instanceType}.`);
      IdentifierPolicy.assertIdentifier(type, `${path}/${YamlKeys.instanceType}`);
      return type;
    });
  }

  private static isElementEntry(node: JsonNode): boolean {
    return Object.hasOwn(node, YamlKeys.children) || ReaderUtil.getString(node, YamlKeys.type) === ELEMENT_INSTANCE_TYPE;
  }

  private parseNode(node: JsonNode, path: string): InstanceDataAtomType {
    if (YamlTemplateInstanceReader.isElementEntry(node)) {
      return this.parseContainer(node, path);
    }
    return YamlTemplateInstanceReader.parseFieldValue(node, path);
  }

  /** A field's value, or an attribute's, which is read the same way. */
  private static parseFieldValue(node: JsonNode, path: string): InstanceDataAtomType {
    const atom = YamlTemplateInstanceReader.parseFieldValueWithoutNotation(node, path);
    if ('language' in atom) {
      atom.language = ReaderUtil.getString(node, YamlKeys.language);
    }
    if ('preferredLabel' in atom) {
      atom.preferredLabel = ReaderUtil.getString(node, YamlKeys.prefLabel);
    }
    if ('notation' in atom && !(atom instanceof InstanceDataNotationAtom)) {
      atom.notation = ReaderUtil.getString(node, YamlKeys.notation);
    }
    return atom;
  }

  private static parseFieldValueWithoutNotation(node: JsonNode, path: string): InstanceDataAtomType {
    YamlTemplateInstanceReader.assertFieldValue(node, path);
    if (Object.hasOwn(node, YamlKeys.value)) {
      const value = YamlTemplateInstanceReader.readValue(node, YamlKeys.value);
      const datatype = ReaderUtil.getString(node, YamlKeys.datatype);
      const label = ReaderUtil.getString(node, YamlKeys.label);
      return datatype === null ? new InstanceDataStringAtom(value, label) : new InstanceDataTypedAtom(value, datatype, label);
    }
    if (Object.hasOwn(node, YamlKeys.id)) {
      const id = ReaderUtil.getString(node, YamlKeys.id);
      const label = ReaderUtil.getString(node, YamlKeys.label);
      const datatype = ReaderUtil.getString(node, YamlKeys.datatype);
      return label === null
        ? InstanceDataLinkAtom.fromParsedNode(id, datatype)
        : InstanceDataControlledAtom.fromParsedNode(id, label, datatype);
    }
    const label = ReaderUtil.getString(node, YamlKeys.label);
    if (label !== null) {
      return new InstanceDataLabelAtom(label, ReaderUtil.getString(node, YamlKeys.datatype));
    }
    const notation = ReaderUtil.getString(node, YamlKeys.notation);
    if (notation !== null) {
      return new InstanceDataNotationAtom(notation, ReaderUtil.getString(node, YamlKeys.datatype));
    }
    return new InstanceDataEmptyNode();
  }
}

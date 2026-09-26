import { ReservedNames } from '../../../model/cedar/ReservedNames';
import { InstanceDataNotationAtom } from '../../../model/cedar/template-instance/InstanceDataNotationAtom';
import { InstanceDataLabelAtom } from '../../../model/cedar/template-instance/InstanceDataLabelAtom';
import YAML from 'yaml';
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

const ELEMENT_INSTANCE_TYPE = 'element-instance';

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
    let instanceObject;
    try {
      instanceObject = YAML.parse(instanceSourceString);
    } catch {
      instanceObject = {};
    }
    return this.readFromObject(instanceObject);
  }

  public readFromObject(instanceSourceObject: JsonNode): YamlTemplateInstanceReaderResult {
    const parsingResult = new YamlArtifactParsingResult();
    const instance = TemplateInstance.buildEmptyWithNullValues();
    const source = instanceSourceObject ?? {};

    instance.schema_name = ReaderUtil.getString(source, YamlKeys.name);
    instance.schema_description = ReaderUtil.getString(source, YamlKeys.description) ?? '';
    instance.descriptionWasAbsent = ReaderUtil.getString(source, YamlKeys.description) === null;
    YamlTemplateInstanceReader.refuseEmptyIdentifier(source);
    instance.at_id = CedarArtifactId.forValue(ReaderUtil.getString(source, YamlKeys.id));
    instance.schema_isBasedOn = CedarArtifactId.forValue(ReaderUtil.getString(source, YamlKeys.isBasedOn));
    // Accept the legacy empty spelling as absence; the writer omits the optional key.
    instance.pav_derivedFrom = CedarArtifactId.forValue(ReaderUtil.getString(source, YamlKeys.derivedFrom));
    // The writer emits an instance's provenance and its annotations; both were read by nobody, so
    // either one was lost by writing what had just been read.
    instance.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(source, YamlKeys.createdBy));
    instance.pav_createdOn = IsoDate.forValue(ReaderUtil.getString(source, YamlKeys.createdOn));
    instance.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(source, YamlKeys.modifiedBy));
    instance.pav_lastUpdatedOn = IsoDate.forValue(ReaderUtil.getString(source, YamlKeys.modifiedOn));
    this.readAnnotations(instance, source, parsingResult, new JsonPath());

    instance.dataContainer = this.parseContainer(source, true);
    for (const conflict of AttributeValueNamePolicy.findConflicts(instance.dataContainer)) {
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
    return new YamlTemplateInstanceReaderResult(instance, parsingResult, source);
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

  private parseContainer(node: JsonNode, isDocumentRoot: boolean = false): InstanceDataContainer {
    const container = new InstanceDataContainer();

    const children = ReaderUtil.getNode(node, YamlKeys.children);
    if (children !== null) {
      Object.keys(children).forEach((key) => {
        const content = ReaderUtil.getNode(children, key) ?? (children as JsonNode)[key];
        if (Array.isArray(content)) {
          const list: InstanceDataAtomList = [];
          container.setValue(key, list);
          content.forEach((element: JsonNode, index: number) => {
            list[index] = this.parseNode(element);
          });
        } else {
          container.setValue(key, this.parseNode(content));
        }
      });
    }

    // Attribute-value fields sit beside `children`, their attributes named
    // directly: `<field>: { <attr>: { value: … } }`.
    Object.keys(node).forEach((key) => {
      const reserved = isDocumentRoot ? YamlTemplateInstanceReader.RESERVED_KEYS : YamlTemplateInstanceReader.ELEMENT_RESERVED_KEYS;
      if (reserved.has(key)) {
        return;
      }
      const avNode = (node as JsonNode)[key];
      if (avNode === null || typeof avNode !== 'object' || Array.isArray(avNode)) {
        return;
      }
      const avField = new InstanceDataAttributeValueField(key);
      Object.keys(avNode).forEach((attrName) => {
        const inner = (avNode as JsonNode)[attrName];
        avField.addValue(attrName, new InstanceDataStringAtom(this.parseAttributeValue(inner)));
      });
      container.setValue(key, avField);
    });

    YamlTemplateInstanceReader.refuseEmptyIdentifier(node);
    const id = ReaderUtil.getString(node, YamlKeys.id);
    if (id !== null) {
      container.id = id;
    }
    return container;
  }

  private parseAttributeValue(node: unknown): string | null {
    if (typeof node === 'string') {
      return node;
    }
    if (node !== null && typeof node === 'object' && !Array.isArray(node)) {
      const value = (node as JsonNode)[YamlKeys.value];
      return typeof value === 'string' ? value : null;
    }
    return null;
  }

  private parseNode(node: JsonNode | string | null): InstanceDataAtomType {
    const atom = this.parseNodeWithoutNotation(node);
    if (node !== null && typeof node === 'object' && 'language' in atom) {
      atom.language = ReaderUtil.getString(node, YamlKeys.language);
    }
    if (node !== null && typeof node === 'object' && 'notation' in atom && !(atom instanceof InstanceDataNotationAtom)) {
      atom.notation = ReaderUtil.getString(node, YamlKeys.notation);
    }
    return atom;
  }

  private parseNodeWithoutNotation(node: JsonNode | string | null): InstanceDataAtomType {
    if (node === null || node === undefined) {
      return new InstanceDataEmptyNode();
    }
    if (typeof node === 'string') {
      return new InstanceDataStringAtom(node);
    }
    // An element carries a `children` block; a value never does.
    if (Object.hasOwn(node, YamlKeys.children) || ReaderUtil.getString(node, YamlKeys.type) === ELEMENT_INSTANCE_TYPE) {
      return this.parseContainer(node);
    }
    if (Object.hasOwn(node, YamlKeys.id) && Object.hasOwn(node, YamlKeys.value)) {
      throw new Error('A field cannot contain both id and value.');
    }
    // One slot, as in Java's reader: the YAML form writes a lone datatype as a string.
    if (Array.isArray(node[YamlKeys.datatype])) {
      throw new Error('A field value can have at most one datatype.');
    }
    if (Object.hasOwn(node, YamlKeys.value)) {
      const value = ReaderUtil.getString(node, YamlKeys.value);
      const datatype = ReaderUtil.getString(node, YamlKeys.datatype);
      const label = ReaderUtil.getString(node, YamlKeys.label);
      return datatype === null ? new InstanceDataStringAtom(value, label) : new InstanceDataTypedAtom(value, datatype, label);
    }
    if (Object.hasOwn(node, YamlKeys.id)) {
      ReaderUtil.assertFieldIri(ReaderUtil.getString(node, YamlKeys.id), YamlKeys.id);
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

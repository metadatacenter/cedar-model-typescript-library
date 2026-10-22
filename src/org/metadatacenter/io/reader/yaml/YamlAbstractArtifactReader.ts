import { TextPolicy } from '../../../policy/TextPolicy';
import { SchemaExtensions } from '../../../model/cedar/SchemaExtensions';
import { AbstractArtifact } from '../../../model/cedar/AbstractArtifact';
import { internalNameFor, SchemaArtifactKind, AbstractSchemaArtifact } from '../../../model/cedar/AbstractSchemaArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarArtifactId } from '../../../model/cedar/types/cedar-types/CedarArtifactId';
import { CedarUser } from '../../../model/cedar/types/cedar-types/CedarUser';
import { IsoDate } from '../../../model/cedar/types/wrapped-types/IsoDate';
import { SchemaVersion } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
import { PavVersion } from '../../../model/cedar/types/wrapped-types/PavVersion';
import { BiboStatus } from '../../../model/cedar/types/wrapped-types/BiboStatus';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { Annotations } from '../../../model/cedar/annotation/Annotations';
import { AnnotationAtId } from '../../../model/cedar/annotation/AnnotationAtId';
import { AnnotationAtValue } from '../../../model/cedar/annotation/AnnotationAtValue';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { ReaderUtil } from '../ReaderUtil';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlArtifactParsingResult } from '../../../model/cedar/util/compare/YamlArtifactParsingResult';
import { Language } from '../../../model/cedar/types/wrapped-types/Language';
import { ExactDecimal } from '../../../policy/NumericPolicy';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';
import { SchemaVersionValues } from '../../../model/cedar/types/wrapped-types/SchemaVersion';

/** The keys beside which a null value is the shape of a term chosen without a literal. */
const LABEL_KEYS: readonly string[] = [YamlKeys.label, YamlKeys.prefLabel, YamlKeys.notation];

/**
 * The keys that say what a schema artifact is and who made it, rather than what it holds. Java's
 * reader refuses null, an empty mapping and an empty list anywhere in a schema document, and this
 * reader refuses them at these keys wherever an artifact sits in the document.
 */
const SCHEMA_METADATA_KEYS: readonly string[] = [
  YamlKeys.type,
  YamlKeys.name,
  YamlKeys.description,
  YamlKeys.id,
  YamlKeys.identifier,
  YamlKeys.modelVersion,
  YamlKeys.version,
  YamlKeys.status,
  YamlKeys.previousVersion,
  YamlKeys.derivedFrom,
  YamlKeys.createdBy,
  YamlKeys.createdOn,
  YamlKeys.modifiedBy,
  YamlKeys.modifiedOn,
  YamlKeys.language,
  YamlKeys.annotations,
  YamlKeys.instanceType,
  YamlKeys.prefLabel,
  YamlKeys.altLabels,
  YamlKeys.header,
  YamlKeys.footer,
];

/** The statuses Java's reader takes. */
const STATUSES: readonly string[] = BiboStatus.values().map((status) => status.getYamlValue() as string);

export abstract class YamlAbstractArtifactReader {
  protected behavior: YamlReaderBehavior;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.NULL;
  /**
   * Whether compact input is expected. The compact form omits the model version, so a reader that
   * has not been asked for it treats an absent model version as what it is — a document it was not
   * given the form of. Reading compact input has to be asked for, as it does in the Java library,
   * whose reader takes the same flag and whose converter selects it with -cy on the way in.
   */
  protected readonly isCompact: boolean;

  protected constructor(behavior: YamlReaderBehavior, isCompact: boolean = false) {
    this.behavior = behavior;
    this.isCompact = isCompact;
  }

  /** The word CEDAR puts in a derived title/description: "template", "element" or "field". */
  protected artifactTypeWord(): SchemaArtifactKind {
    if (this.knownArtifactType === CedarArtifactType.TEMPLATE) {
      return 'template';
    }
    if (this.knownArtifactType === CedarArtifactType.TEMPLATE_ELEMENT) {
      return 'element';
    }
    return 'field';
  }

  protected readNonReportableAttributes(container: AbstractSchemaArtifact, sourceObject: JsonNode): void {
    container.extensions = SchemaExtensions.fromYaml(sourceObject);
    // Read in non-reportable properties
    YamlAbstractArtifactReader.refuseEmptyIdentifier(sourceObject);
    container.at_id = CedarArtifactId.forValue(ReaderUtil.getString(sourceObject, YamlKeys.id));
    container.schema_name = ReaderUtil.getString(sourceObject, YamlKeys.name);
    // An absent description is the empty string, not null. The YAML serialization omits a
    // description that is empty, so reading it back as null made `schema:description` null in the
    // JSON — which the meta-schema rejects, since it requires a string — and emptied the
    // container's `_ui.propertyDescriptions` entry for every undescribed child, which derives from
    // this field. The Java library's YAML reader defaults the same field to the empty string.
    container.schema_description = ReaderUtil.getStringOrEmpty(sourceObject, YamlKeys.description);
    // The YAML carries only a name; the JSON serialization's `title` and
    // `description` are derived from it as "<name> <type> schema" — the
    // JSON-schema title the meta-schema requires to be a non-empty string.
    // Reading YAML without setting them left them null, so a YAML-sourced
    // artifact written back to JSON was invalid. Composed here to match the Java
    // library's YAML reader, which builds the identical strings.
    if (container.schema_name !== null) {
      const kind = this.artifactTypeWord();
      container.title = internalNameFor(container.schema_name, kind);
      container.description = `${container.schema_name} ${kind} schema generated by the CEDAR Artifact Library`;
    }
    container.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, YamlKeys.createdBy));
    container.pav_createdOn = IsoDate.forValue(ReaderUtil.getString(sourceObject, YamlKeys.createdOn));
    container.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(sourceObject, YamlKeys.modifiedBy));
    container.pav_lastUpdatedOn = IsoDate.forValue(ReaderUtil.getString(sourceObject, YamlKeys.modifiedOn));
    const modelVersion: string | null = ReaderUtil.getString(sourceObject, YamlKeys.modelVersion);
    if (modelVersion === null && !this.isCompact) {
      throw new Error(
        `No ${YamlKeys.modelVersion} present. A document without one is the compact form, which a reader has to be asked for.`,
      );
    }
    container.schema_schemaVersion = SchemaVersion.forValue(modelVersion);
    container.pav_version = PavVersion.forValue(ReaderUtil.getString(sourceObject, YamlKeys.version));
    container.bibo_status = BiboStatus.forYamlValue(ReaderUtil.getString(sourceObject, YamlKeys.status));
    // A compatibility reader takes the legacy empty spelling as absence, and the writer omits the
    // optional key; a strict one refuses it, as Java does.
    container.pav_derivedFrom = CedarArtifactId.forValue(
      ReaderUtil.getArtifactIdentifier(sourceObject, YamlKeys.derivedFrom, this.behavior.useWarningForKnownIssues()),
    );
    container.pav_previousVersion = CedarArtifactId.forValue(ReaderUtil.getIdentifier(sourceObject, YamlKeys.previousVersion));
    container.schema_identifier = ReaderUtil.getString(sourceObject, YamlKeys.identifier);
    container.language = Language.forValue(ReaderUtil.getString(sourceObject, YamlKeys.language));
  }

  /**
   * An empty artifact or occurrence `id` is not an identifier, and it is not an absence of one either.
   *
   * Documents carry it where one has not been assigned — half the element occurrences in the shared
   * corpus once did — and reading it as though the key were absent hides that from whoever wrote it. A
   * key that is not to be answered yet is written `null` or left out. Optional `derivedFrom` is a
   * compatibility exception: its legacy empty spelling loads as absence and is omitted on write.
   *
   * A refusal names the key, or where the key sits when that is below the document's top level.
   */
  protected static refuseEmptyIdentifier(sourceObject: JsonNode, key: string = YamlKeys.id, location: string = key): void {
    const raw = ReaderUtil.getString(sourceObject, key);
    if (raw !== null && typeof raw !== 'string') {
      throw new Error(`Invalid URI at "${location}": expected a string.`);
    }
    if (raw !== null && TextPolicy.isBlank(raw)) {
      throw new Error(`An empty string is not a URI at "${location}"; write null or leave the key out where there is no value.`);
    }
    ReaderUtil.assertIri(raw, location);
  }

  /** A YAML mapping: an object that is neither a list nor a number the source policy kept exact. */
  protected static isMapping(node: unknown): node is JsonNode {
    return node !== null && typeof node === 'object' && !Array.isArray(node) && !ExactDecimal.isExact(node);
  }

  protected static refuseNullOrEmpty(value: unknown, path: string): void {
    if (value === null) {
      throw new Error(`null is not a valid value at ${path}; omit the key if the value is unknown.`);
    }
    if (Array.isArray(value) && value.length === 0) {
      throw new Error(`An empty list ([]) is not a valid value at ${path}; omit the key if the value is unknown.`);
    }
    if (YamlAbstractArtifactReader.isMapping(value) && Object.keys(value).length === 0) {
      throw new Error(`An empty mapping ({}) is not a valid value at ${path}; omit the key if the value is unknown.`);
    }
  }

  /**
   * Refuse null, an empty mapping and an empty list anywhere in `node`, as Java's reader does. A value
   * that is not known is left out rather than written as one of them. In an instance, Java's reader
   * makes one exception, and so does this one: a null `value` beside a label, a preferred label or a
   * notation.
   */
  protected static refuseNullAndEmptyValues(node: unknown, path: string, isInstance: boolean = false): void {
    if (Array.isArray(node)) {
      node.forEach((entry: unknown, index: number) => {
        YamlAbstractArtifactReader.refuseNullOrEmpty(entry, `${path}[${index}]`);
        YamlAbstractArtifactReader.refuseNullAndEmptyValues(entry, `${path}[${index}]`, isInstance);
      });
    } else if (YamlAbstractArtifactReader.isMapping(node)) {
      for (const [key, value] of Object.entries(node)) {
        if (isInstance && key === YamlKeys.value && value === null && LABEL_KEYS.some((label) => typeof node[label] === 'string')) {
          continue;
        }
        YamlAbstractArtifactReader.refuseNullOrEmpty(value, `${path}/${key}`);
        YamlAbstractArtifactReader.refuseNullAndEmptyValues(value, `${path}/${key}`, isInstance);
      }
    }
  }

  protected static assertText(node: JsonNode, key: string, path: string): void {
    if (Object.hasOwn(node, key) && typeof node[key] !== 'string') {
      throw new Error(`Expected a string at ${path}/${key}.`);
    }
  }

  /** An artifact states its type, and it is the one the reader reads, as Java's reader requires. */
  protected static assertType(source: JsonNode, expected: YamlArtifactType, artifact: string): void {
    const type = expected.getValue();
    if (!Object.hasOwn(source, YamlKeys.type)) {
      throw new Error(`No ${YamlKeys.type} present. ${artifact} states its type, "${type}".`);
    }
    YamlAbstractArtifactReader.assertText(source, YamlKeys.type, '');
    if (source[YamlKeys.type] !== type) {
      throw new Error(`Invalid artifact type "${source[YamlKeys.type]}" at /${YamlKeys.type}. ${artifact} has the type "${type}".`);
    }
  }

  /** An artifact has a name, and it is a non-empty string, as Java's reader requires. */
  protected static readName(source: JsonNode, path: string, artifact: string): string {
    if (!Object.hasOwn(source, YamlKeys.name)) {
      throw new Error(`No ${YamlKeys.name} present${path === '' ? '' : ` at ${path}`}. ${artifact} must have a name.`);
    }
    YamlAbstractArtifactReader.assertText(source, YamlKeys.name, path);
    const name = source[YamlKeys.name] as string;
    if (name === '') {
      throw new Error(`Expected a non-empty string at ${path}/${YamlKeys.name}.`);
    }
    return name;
  }

  /**
   * Hold a template's, an element's or a field's metadata to the rules Java's reader holds it to,
   * wherever the artifact sits in the document: what it is, its name, who made it and when, its
   * status, its annotations and its labels. Each was read as whatever the document held, so a number
   * where a string belongs, or a status no artifact can have, was kept and then written to JSON.
   */
  protected assertSchemaMetadata(source: JsonNode, topPath: JsonPath): void {
    const path = topPath.toPointer();
    const isRoot = path === '';
    for (const key of SCHEMA_METADATA_KEYS) {
      if (Object.hasOwn(source, key)) {
        YamlAbstractArtifactReader.refuseNullOrEmpty(source[key], `${path}/${key}`);
        YamlAbstractArtifactReader.refuseNullAndEmptyValues(source[key], `${path}/${key}`);
      }
    }
    const kind = this.artifactTypeWord();
    const artifact = kind === 'template' ? 'A template' : kind === 'element' ? 'An element' : 'A field';
    // A child's type is what chose its reader, and a field reader has already held its own to the
    // field types it knows.
    if (isRoot && kind === 'template') {
      YamlAbstractArtifactReader.assertType(source, YamlArtifactType.TEMPLATE, artifact);
    } else if (isRoot && kind === 'element') {
      YamlAbstractArtifactReader.assertType(source, YamlArtifactType.ELEMENT, artifact);
    }
    // Java's reader checks the model version of the document it is given, and not its children's.
    if (isRoot && Object.hasOwn(source, YamlKeys.modelVersion)) {
      YamlAbstractArtifactReader.assertText(source, YamlKeys.modelVersion, path);
      if (source[YamlKeys.modelVersion] !== SchemaVersionValues.CURRENT) {
        throw new Error(
          `Invalid ${YamlKeys.modelVersion} "${source[YamlKeys.modelVersion]}" at /${YamlKeys.modelVersion}. This library reads model version "${SchemaVersionValues.CURRENT}".`,
        );
      }
    }
    YamlAbstractArtifactReader.readName(source, path, artifact);
    const textKeys = [YamlKeys.description, YamlKeys.identifier, YamlKeys.language, YamlKeys.createdOn, YamlKeys.modifiedOn];
    if (kind !== 'field') textKeys.push(YamlKeys.header, YamlKeys.footer);
    if (kind !== 'template') textKeys.push(YamlKeys.prefLabel);
    textKeys.forEach((key) => YamlAbstractArtifactReader.assertText(source, key, path));
    // Who created and last modified the artifact are IRIs, as in Java's reader.
    [YamlKeys.createdBy, YamlKeys.modifiedBy].forEach((key) =>
      YamlAbstractArtifactReader.refuseEmptyIdentifier(source, key, `${path}/${key}`.slice(1)),
    );
    // An empty status is no status, as in Java's reader; any other has to be one an artifact can have.
    YamlAbstractArtifactReader.assertText(source, YamlKeys.status, path);
    const status = source[YamlKeys.status];
    if (Object.hasOwn(source, YamlKeys.status) && status !== '' && !STATUSES.includes(status as string)) {
      throw new Error(`Invalid ${YamlKeys.status} "${status}" at ${path}/${YamlKeys.status}. A status is one of ${STATUSES.join(', ')}.`);
    }
    // An alternative label is not empty: Java's reader refuses one that is.
    const altLabels: unknown = source[YamlKeys.altLabels];
    if (kind !== 'template' && Array.isArray(altLabels)) {
      const empty = altLabels.indexOf('');
      if (empty >= 0) {
        throw new Error(`Expected a non-empty string at ${path}/${YamlKeys.altLabels}[${empty}].`);
      }
    }
  }

  /**
   * An element's or a field's alternative labels: the strings in the list. Java's reader passes over
   * an entry that is not a string, where keeping it put a number in `skos:altLabel`.
   */
  protected static readAltLabels(source: JsonNode): Array<string> {
    return ReaderUtil.getFilteredStringList(source, YamlKeys.altLabels).filter((label: unknown) => typeof label === 'string');
  }

  /**
   * An artifact's annotations: a mapping of names, each to a literal `value` or an IRI `id`. Both are
   * held to the Java reader's rules — the literal is a string, and the IRI is held to the rule of
   * every other identifier here — and where an annotation states both, the literal is read, as Java
   * reads it.
   */
  protected readAnnotations(
    artifact: AbstractArtifact,
    artifactSourceObject: JsonNode,
    _parsingResult: YamlArtifactParsingResult,
    topPath: JsonPath,
  ) {
    const annotations = new Annotations();
    if (!Object.hasOwn(artifactSourceObject, YamlKeys.annotations)) {
      return;
    }
    const path = `${topPath.toPointer()}/${YamlKeys.annotations}`;
    const annotationsNode: unknown = artifactSourceObject[YamlKeys.annotations];
    if (!YamlAbstractArtifactReader.isMapping(annotationsNode)) {
      throw new Error(`Expected a mapping at ${path}.`);
    }
    Object.keys(annotationsNode).forEach((name: string) => {
      const annotationNode: unknown = annotationsNode[name];
      if (!YamlAbstractArtifactReader.isMapping(annotationNode)) {
        throw new Error(`Expected map value for annotation at ${path}/${name}`);
      }
      if (Object.hasOwn(annotationNode, YamlKeys.value)) {
        YamlAbstractArtifactReader.assertText(annotationNode, YamlKeys.value, `${path}/${name}`);
        annotations.add(new AnnotationAtValue(name, annotationNode[YamlKeys.value] as string));
      } else if (Object.hasOwn(annotationNode, YamlKeys.id)) {
        YamlAbstractArtifactReader.refuseEmptyIdentifier(annotationNode, YamlKeys.id, `${path}/${name}/${YamlKeys.id}`.slice(1));
        annotations.add(new AnnotationAtId(name, annotationNode[YamlKeys.id] as string));
      } else {
        throw new Error(`Annotation must have either a value or id at ${path}/${name}`);
      }
    });
    if (annotations.getSize() > 0) {
      artifact.annotations = annotations;
    }
  }
}

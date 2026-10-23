import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { CedarSchemaValues } from '../../../model/cedar/types/wrapped-types/ArtifactSchema';
import { SchemaVersion, SchemaVersionValues } from '../../../model/cedar/types/wrapped-types/SchemaVersion';
import { JavascriptTypeValues } from '../../../model/cedar/types/wrapped-types/JavascriptType';

/** The four types a schema artifact can declare. */
const SCHEMA_ARTIFACT_TYPES: readonly CedarArtifactType[] = [
  CedarArtifactType.TEMPLATE,
  CedarArtifactType.TEMPLATE_ELEMENT,
  CedarArtifactType.TEMPLATE_FIELD,
  CedarArtifactType.STATIC_TEMPLATE_FIELD,
];

/** The types each kind of schema artifact can declare, and the word Java's refusal uses for it. */
const KINDS = {
  template: { types: [CedarArtifactType.TEMPLATE], word: 'template' },
  element: { types: [CedarArtifactType.TEMPLATE_ELEMENT], word: 'element' },
  field: { types: [CedarArtifactType.TEMPLATE_FIELD, CedarArtifactType.STATIC_TEMPLATE_FIELD], word: 'field' },
} as const;

/**
 * What a schema artifact declares about itself in JSON, held to the Java JSON reader's rules: the
 * JSON-LD type it claims, the JSON Schema it is written in, the JSON Schema type it is and the model
 * version it follows. This library's readers compared each with the expected value and recorded a
 * difference, or read nothing, and its writers then wrote the expected value back, so a document Java
 * refuses was read and written as one Java accepts. Java refuses the document, and so does each check
 * here. Most refusals use Java's words. The two for a missing or repeated `@type` say it more plainly.
 *
 * A compatibility reader still opens an artifact that leaves one of these declarations out, as it
 * always has. CEE opens a host's template with it, and relies on it to read a template that states
 * nothing but its properties. It refuses a declaration that is there and wrong, as a strict reader
 * does.
 */
export class JsonArtifactShape {
  private static shown(value: unknown): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  private static own(node: JsonNode, key: string): unknown {
    return Object.hasOwn(node, key) ? node[key] : undefined;
  }

  /**
   * The type a schema artifact declares, as Java reads `@type`: one IRI, given as a string or as a list
   * of exactly one, naming a template, an element, a field or a static field.
   */
  static declaredType(node: JsonNode, path: JsonPath): CedarArtifactType {
    const declared = JsonArtifactShape.own(node, JsonSchema.atType);
    const types = Array.isArray(declared) ? declared : declared === undefined || declared === null ? [] : [declared];
    if (types.length === 0) {
      throw new Error(`A schema artifact must declare a JSON-LD @type at ${path.toString()}`);
    }
    if (types.length !== 1) {
      throw new Error(`Expecting a single JSON-LD @type for a schema artifact, got ${types.length} at ${path.toString()}`);
    }
    const type = SCHEMA_ARTIFACT_TYPES.find((candidate) => candidate.getValue() === types[0]);
    if (type === undefined) {
      throw new Error(`Unexpected schema artifact JSON-LD @type ${JsonArtifactShape.shown(types[0])} at ${path.toString()}`);
    }
    return type;
  }

  /** Whether `key` is left out of `node`, which only a compatibility reader takes. */
  static isTolerated(node: JsonNode, key: string, lenient: boolean): boolean {
    return lenient && !Object.hasOwn(node, key);
  }

  /** Refuse an artifact read as a template, an element or a field that declares itself something else. */
  static assertDeclaredKind(node: JsonNode, path: JsonPath, kind: keyof typeof KINDS, lenient: boolean): void {
    if (JsonArtifactShape.isTolerated(node, JsonSchema.atType, lenient)) {
      return;
    }
    const type = JsonArtifactShape.declaredType(node, path);
    if (!(KINDS[kind].types as readonly CedarArtifactType[]).includes(type)) {
      throw new Error(`Unexpected ${KINDS[kind].word} schema artifact JSON-LD @type ${type.getValue()} at ${path.toString()}`);
    }
  }

  /** The type of a template's or an element's child, which is never a template. */
  static childType(node: JsonNode, path: JsonPath): CedarArtifactType {
    const type = JsonArtifactShape.declaredType(node, path);
    if (type === CedarArtifactType.TEMPLATE) {
      throw new Error(`Invalid nesting of template schema artifact at ${path.toString()}`);
    }
    return type;
  }

  /**
   * Refuse a `$schema` other than the JSON Schema draft CEDAR artifacts are written in. An artifact read
   * on its own must state it. A child need not, since Java reads children written without one.
   */
  static assertJsonSchemaUri(node: JsonNode, path: JsonPath, required: boolean, lenient: boolean): void {
    if (!Object.hasOwn(node, CedarModel.schema) && (!required || lenient)) {
      return;
    }
    const declared = JsonArtifactShape.own(node, CedarModel.schema);
    if (declared !== CedarSchemaValues.CURRENT) {
      const shown = declared === undefined ? 'none' : JsonArtifactShape.shown(declared);
      throw new Error(`Expecting ${CedarSchemaValues.CURRENT}, got ${shown} at ${path.toString()}`);
    }
  }

  /** Refuse a template or an element whose JSON Schema type is not `object`. */
  static assertObjectType(node: JsonNode, path: JsonPath, lenient: boolean): void {
    if (JsonArtifactShape.isTolerated(node, JsonSchema.type, lenient)) {
      return;
    }
    const declared = JsonArtifactShape.own(node, JsonSchema.type);
    if (declared !== JavascriptTypeValues.OBJECT) {
      const shown = declared === undefined ? 'none' : JsonArtifactShape.shown(declared);
      throw new Error(`Expecting artifact JSON Schema type ${JavascriptTypeValues.OBJECT}, got ${shown} at ${path.toString()}`);
    }
  }

  /** Refuse a child whose JSON Schema type is neither `object`, for one instance, nor `array`, for several. */
  static assertChildJsonSchemaType(node: JsonNode, path: JsonPath, lenient: boolean): void {
    if (JsonArtifactShape.isTolerated(node, JsonSchema.type, lenient)) {
      return;
    }
    const declared = JsonArtifactShape.own(node, JsonSchema.type);
    if (declared !== JavascriptTypeValues.OBJECT && declared !== JavascriptTypeValues.ARRAY) {
      const shown = declared === undefined ? 'none' : JsonArtifactShape.shown(declared);
      throw new Error(`Expecting array or object, got ${shown} at ${path.toString()}`);
    }
  }

  /**
   * Refuse an artifact that does not state the model version this library reads, at any depth. Java
   * refuses one that states another version or none, and so does the YAML reader. A value that is not
   * a version at all keeps the refusal it always had.
   */
  static assertModelVersion(node: JsonNode, path: JsonPath, lenient: boolean): void {
    if (JsonArtifactShape.isTolerated(node, JsonSchema.schemaVersion, lenient)) {
      return;
    }
    const declared = JsonArtifactShape.own(node, JsonSchema.schemaVersion);
    if (typeof declared === 'string') {
      SchemaVersion.forValue(declared);
    }
    if (declared !== SchemaVersionValues.CURRENT) {
      const shown = declared === undefined || declared === null ? 'none' : JsonArtifactShape.shown(declared);
      throw new Error(`Expecting model version ${SchemaVersionValues.CURRENT}, got ${shown} at ${path.toString()}`);
    }
  }
}

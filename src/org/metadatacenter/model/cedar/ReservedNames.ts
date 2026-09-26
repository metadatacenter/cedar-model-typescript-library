import { YamlKeys } from './constants/YamlKeys';

/** The artifact an attribute-value field is a child of, which decides the YAML keys beside it. */
export type AttributeValueFieldParent = 'template' | 'element';

/**
 * The names a child of a template or element may not take.
 *
 * Every child's key, and every attribute name a form-filler invents for an attribute-value field,
 * becomes a property of an instance's JSON object beside the properties CEDAR writes there itself.
 * Such a name therefore may not be a JSON-LD keyword, a CEDAR instance property or an object
 * internal that a JavaScript object cannot hold as an ordinary key.
 *
 * An attribute-value field's own key has one more constraint. The YAML form writes it beside its
 * parent's metadata rather than under `children`, so it may not be one of the metadata keys that
 * parent's YAML mapping carries. A template's instance carries all of them; an element used inside
 * its parent carries only `type`, `id` and `children`.
 *
 * The Java artifact library's `ReservedNames` answers the same two questions with the same sets,
 * and the editors ask whichever library they are built on.
 */
export abstract class ReservedNames {
  private static readonly INSTANCE_PROPERTIES: ReadonlySet<string> = new Set([
    'schema:name',
    'schema:description',
    'schema:identifier',
    'schema:isBasedOn',
    'pav:createdOn',
    'pav:createdBy',
    'pav:lastUpdatedOn',
    'pav:derivedFrom',
    'oslc:modifiedBy',
    '_annotations',
    'rdfs:label',
    'skos:notation',
    'skos:prefLabel',
    'skos:altLabel',
  ]);

  private static readonly OBJECT_INTERNALS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);

  /** The metadata keys of a template instance's YAML mapping. */
  public static readonly TEMPLATE_INSTANCE_YAML_KEYS: ReadonlySet<string> = new Set([
    YamlKeys.type,
    YamlKeys.name,
    YamlKeys.description,
    YamlKeys.id,
    YamlKeys.isBasedOn,
    YamlKeys.derivedFrom,
    YamlKeys.children,
    YamlKeys.annotations,
    YamlKeys.createdOn,
    YamlKeys.createdBy,
    YamlKeys.modifiedOn,
    YamlKeys.modifiedBy,
  ]);

  /** The metadata keys of an element instance's YAML mapping when it is written inside its parent. */
  public static readonly NESTED_ELEMENT_INSTANCE_YAML_KEYS: ReadonlySet<string> = new Set([YamlKeys.type, YamlKeys.id, YamlKeys.children]);

  private constructor() {}

  /** Whether no child, and no attribute a form-filler invents, may take this name. */
  public static isReservedName(name: string): boolean {
    return name.startsWith('@') || ReservedNames.INSTANCE_PROPERTIES.has(name) || ReservedNames.OBJECT_INTERNALS.has(name);
  }

  /** Whether an attribute-value field that is a child of `parent` may not take this name. */
  public static isReservedAttributeValueFieldName(name: string, parent: AttributeValueFieldParent): boolean {
    return ReservedNames.isReservedName(name) || ReservedNames.yamlKeys(parent).has(name);
  }

  /** The metadata keys the YAML form writes beside an attribute-value field of `parent`. */
  public static yamlKeys(parent: AttributeValueFieldParent): ReadonlySet<string> {
    return parent === 'template' ? ReservedNames.TEMPLATE_INSTANCE_YAML_KEYS : ReservedNames.NESTED_ELEMENT_INSTANCE_YAML_KEYS;
  }
}

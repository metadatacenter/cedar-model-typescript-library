import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { InstanceDataContainer } from '../../../model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataAttributeValueField } from '../../../model/cedar/template-instance/InstanceDataAttributeValueField';

/** Serialization-only views preserve Java's group/member order even for integer-looking names. */
export function stringifyInstance(node: JsonNode, container: InstanceDataContainer, indent: number): string {
  function view(node: JsonNode, container: InstanceDataContainer): JsonNode {
    const result = { ...node };
    const groups = new Map<string, string[]>();
    for (const [key, atom] of Object.entries(container.values)) {
      if (atom instanceof InstanceDataAttributeValueField) {
        // Membership arrays preserve name order, unlike Object.keys on a JS object.
        groups.set(key, node[key] as string[]);
      } else if (atom instanceof InstanceDataContainer) {
        result[key] = view(node[key] as JsonNode, atom);
      } else if (Array.isArray(atom) && Array.isArray(node[key])) {
        result[key] = (node[key] as JsonNode[]).map((child, index) =>
          atom[index] instanceof InstanceDataContainer ? view(child, atom[index] as InstanceDataContainer) : child,
        );
      }
    }
    const children = Object.keys(container.values);
    const dataKeys = new Set([...children, ...[...groups.values()].flat()]);
    const order = Object.keys(result).filter((key) => !dataKeys.has(key));
    const childOrder = children.flatMap((key) => [key, ...(groups.get(key) ?? [])]).filter((key) => Object.hasOwn(result, key));
    // Instance envelope precedes data, then annotations/context/provenance. Integer keys
    // must not jump ahead of @id/name simply because the result is a JavaScript object.
    const boundary = order.findIndex((key) => key === '_annotations' || key === '@context');
    order.splice(boundary < 0 ? order.length : boundary, 0, ...childOrder);
    return new Proxy(result, { ownKeys: () => order });
  }
  return JSON.stringify(view(node, container), null, indent);
}

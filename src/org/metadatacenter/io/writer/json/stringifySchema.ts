import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';

// Ordinary JS objects enumerate array-index keys first. A temporary serialization view
// preserves Java's schema order even when a field is named "11". Returned JsonNodes
// remain ordinary objects, so callers can still clone and manipulate them normally.
function orderedView(value: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const order = [...new Set([...keys.filter((key) => Object.hasOwn(value, key)), ...Object.keys(value)])];
  return new Proxy(value, { ownKeys: () => order });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function stringifySchema(schema: JsonNode, indent: number): string {
  function view(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(view);
    if (!isObject(value)) return value;
    const result: Record<string, unknown> = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, view(child)]));
    const ui = result._ui;
    const order = isObject(ui) ? ui.order : undefined;
    if (
      Array.isArray(order) &&
      order.every((key): key is string => typeof key === 'string') &&
      isObject(ui) &&
      isObject(result.properties)
    ) {
      const children = new Set(order);
      const properties = result.properties;
      result.properties = orderedView(properties, [...Object.keys(properties).filter((key) => !children.has(key)), ...order]);
      const context = properties['@context'];
      if (isObject(context) && isObject(context.properties)) {
        context.properties = orderedView(context.properties, [
          ...Object.keys(context.properties).filter((key) => !children.has(key)),
          ...order,
        ]);
      }
      for (const key of ['propertyLabels', 'propertyDescriptions']) {
        const map = ui[key];
        if (isObject(map)) ui[key] = orderedView(map, order);
      }
    }
    return result;
  }
  return JSON.stringify(view(schema), null, indent);
}

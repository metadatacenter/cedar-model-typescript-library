export class SimpleYamlSerializer {
  /**
   * Serializes a given object into a YAML string.
   * @param obj The object to serialize.
   * @param indent The indentation level for the YAML output. Defaults to 2.
   * @param level The current depth to calculate the indentation. Internal use.
   * @returns The YAML string representation of the object.
   */
  static serialize(obj: any, indent: number = 2, level: number = 0): string {
    if (typeof obj !== 'object' || obj === null) {
      return SimpleYamlSerializer.serializePrimitive(obj);
    }

    let output = '';
    const indentStr = ' '.repeat(indent * level);

    if (Array.isArray(obj)) {
      for (const item of obj) {
        output += `${indentStr}- ${SimpleYamlSerializer.serialize(item, indent, level + 1)}\n`;
      }
    } else {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          output += `${indentStr}${key}:\n${SimpleYamlSerializer.serialize(value, indent, level + 1)}`;
        } else {
          output += `${indentStr}${key}: ${SimpleYamlSerializer.serializePrimitive(value)}\n`;
        }
      }
    }

    return output;
  }

  private static serializePrimitive(value: any): string {
    switch (typeof value) {
      case 'string':
        // Simple escape for strings that contain colons or start with a space
        return value.includes(':') || value.startsWith(' ') ? `"${value}"` : value;
      case 'number':
      case 'boolean':
        return String(value);
      default:
        return 'null';
    }
  }
}

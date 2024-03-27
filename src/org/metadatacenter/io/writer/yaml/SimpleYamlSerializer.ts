export class SimpleYamlSerializer {
  /**
   * Serializes a given object into a YAML string.
   * @param obj The object to serialize.
   * @param indent The indentation level for the YAML output. Defaults to 2.
   * @param level The current depth to calculate the indentation. Internal use.
   * @returns The YAML string representation of the object.
   */
  static serialize(obj: any, indent: number = 2, level: number = 0): string {
    const indentS = ' '.repeat(indent);
    const indentStr = indentS.repeat(level);

    if (typeof obj !== 'object' || obj === null) {
      return SimpleYamlSerializer.serializePrimitive(obj, indent, level);
    }

    let output = '';
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          const objectProperties = SimpleYamlSerializer.serialize(item, indent, level + 1).trim();
          output += indentStr + `- ${objectProperties}\n`;
        } else {
          output += indentStr + `- ${SimpleYamlSerializer.serializePrimitive(item, indent, level)}\n`;
        }
      });
    } else {
      Object.entries(obj).forEach(([key, value], index) => {
        const isFirstLineOfObject = index === 0 && level > 0;
        if (typeof value === 'object' && value !== null) {
          const nestedObject = SimpleYamlSerializer.serialize(value, indent, level + 1);
          if (Array.isArray(value)) {
            // For arrays, reduce the level by one to correct the indentation.
            output += `${indentStr}${key}:\n${nestedObject}`;
          } else {
            output += `${indentStr}${key}:${isFirstLineOfObject ? ' ' : '\n'}${nestedObject}`;
          }
        } else {
          output += `${indentStr}${key}: ${SimpleYamlSerializer.serializePrimitive(value, indent, level)}\n`;
        }
      });
    }

    return output;
  }

  private static serializePrimitive(value: any, indent: number = 2, level: number = 0): string {
    if (typeof value === 'string') {
      if (value === '') {
        return '""';
      } else if (value.includes('\n')) {
        // Multiline string formatting
        const indentS = ' '.repeat(indent);
        const indentStr = indentS.repeat(level + 1);
        return `|-\n${value
          .split('\n')
          .map((line) => (line === '' ? '' : indentStr + line))
          .join('\n')}`;
      } else if (value.startsWith(' ')) {
        // Single-line strings that need quoting
        return `"${value}"`;
      } else {
        // Regular single-line strings
        return value;
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    } else {
      return 'null';
    }
  }
}

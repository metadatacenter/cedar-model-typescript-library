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
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          const objectProperties = SimpleYamlSerializer.serialize(item, indent, level + 1).trim();
          output += `  `.repeat(level) + `- ${objectProperties}\n`;
        } else {
          output += `  `.repeat(level) + `- ${SimpleYamlSerializer.serializePrimitive(item)}\n`;
        }
      });
    } else {
      Object.entries(obj).forEach(([key, value], index) => {
        const isFirstLineOfObject = index === 0 && level > 0;
        if (typeof value === 'object' && value !== null) {
          const nestedObject = SimpleYamlSerializer.serialize(value, indent, level + 1).trimEnd();
          if (Array.isArray(value)) {
            // For arrays, reduce the level by one to correct the indentation.
            output += `${'  '.repeat(level)}${key}:\n${nestedObject}`;
          } else {
            output += `${'  '.repeat(level)}${key}:${isFirstLineOfObject ? ' ' : '\n'}${nestedObject}`;
          }
        } else {
          output += `${'  '.repeat(level)}${key}: ${SimpleYamlSerializer.serializePrimitive(value)}\n`;
        }
      });
    }

    return output;
  }

  private static serializePrimitive(value: any): string {
    if (typeof value === 'string') {
      if (value === '') {
        return '""';
      } else if (value.includes('\n')) {
        // Multiline string formatting
        return `|-\n  ${value.split('\n').join('\n  ')}`;
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

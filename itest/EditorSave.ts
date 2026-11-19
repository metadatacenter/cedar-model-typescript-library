import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CedarArtifactId,
  CedarWriters,
  InstanceInflater,
  InstanceValidationOptions,
  InstanceValidator,
  JsonNode,
  JsonSourcePolicy,
  JsonTemplateInstanceReader,
  JsonTemplateReader,
  Template,
  TemplateInstance,
  ValidationSummary,
} from '../src';

// How the embeddable editor opens, judges and writes an instance, for the verdict gate and for the
// script that writes the documents the Java validator judges. Both must take the same path, or the gate
// compares a verdict with a document the validator never saw.

export type Operation = { op: 'add' | 'remove'; path: string; value?: JsonNode };

/** A corpus file as JSON, read as the library reads a source document. */
export function corpusDocument(root: string, relative: string): JsonNode {
  return JsonSourcePolicy.parse(readFileSync(join(root, relative), 'utf8'));
}

/** The document with JSON Patch `add` and `remove` operations applied, as the recorder applies them. */
export function patched(document: JsonNode, operations: Operation[] = []): JsonNode {
  const copy = structuredClone(document) as Record<string, unknown>;
  for (const { op, path, value } of operations) {
    const keys = path
      .split('/')
      .slice(1)
      .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'));
    const last = keys.pop() as string;
    const parent = keys.reduce((node, part) => node[part] as Record<string, unknown>, copy);
    if (op === 'remove') delete parent[last];
    else parent[last] = value;
  }
  return copy as JsonNode;
}

/** The stored template as the editor reads it, with the FEBRUARY_2024 behavior. */
export function editorTemplate(template: JsonNode): Template {
  return JsonTemplateReader.getFebruary2024().readFromObject(template).template;
}

/**
 * The instance as the editor reads it, with the FEBRUARY_2024 behavior alone, or null where that reader
 * refuses it: an instance the editor cannot open, it cannot save either. A crash is not a refusal.
 */
export function editorInstance(document: JsonNode): TemplateInstance | null {
  try {
    return JsonTemplateInstanceReader.getFebruary2024().readFromObject(document).instance;
  } catch (error) {
    if (error instanceof TypeError || error instanceof RangeError) throw error;
    return null;
  }
}

/** The editor's judgement of the instance against the stored template, or null where it cannot open it. */
export function editorReport(document: JsonNode, template: JsonNode, options: InstanceValidationOptions = {}): ValidationSummary | null {
  const instance = editorInstance(document);
  return instance === null ? null : InstanceValidator.validateReport(instance, editorTemplate(template), template, options);
}

/** Whether the editor would let the instance be saved, judged against the stored template. */
export function editorCanSave(document: JsonNode, template: JsonNode, options: InstanceValidationOptions = {}): boolean {
  return editorReport(document, template, options)?.canSave ?? false;
}

/**
 * The document the editor's save writes, or null where it cannot write one. The editor completes the
 * instance against its template with `InstanceInflater` and `'empty'`, so a repeated child keeps the
 * occurrences the user saw, and writes it with the FEBRUARY_2024 JSON writer. Its host names the
 * template and the instance, which a corpus instance made by the editor lacks; the server supplies the
 * rest, so that is left to whoever judges the document.
 */
export function editorWrite(document: JsonNode, template: JsonNode): JsonNode | null {
  const instance = editorInstance(document);
  if (instance === null) return null;
  if (instance.schema_isBasedOn.getValue() === null) instance.schema_isBasedOn = CedarArtifactId.forValue(template['@id'] as string);
  instance.schema_name ??= 'Corpus instance';
  try {
    const inflated = InstanceInflater.inflate(instance, editorTemplate(template), 'empty');
    return CedarWriters.json().getFebruary2024().getTemplateInstanceWriter().getAsJsonNode(inflated);
  } catch (error) {
    if (error instanceof TypeError || error instanceof RangeError) throw error;
    return null;
  }
}

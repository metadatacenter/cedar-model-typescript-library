import { AbstractArtifact } from './AbstractArtifact';
import { FieldValuePolicy, ValidationField } from '../../policy/FieldValuePolicy';
import { ValidationFinding, ValidationPolicy, ValidationSummary } from '../../policy/ValidationPolicy';
import { Template } from './template/Template';
import { TemplateElement } from './element/TemplateElement';
import { TemplateField } from './field/TemplateField';
import { validationFieldSchema } from './util/validationFieldSchema';
import { AbstractDynamicChildDeploymentInfo } from './deployment/AbstractDynamicChildDeploymentInfo';

/** Template consistency after structural parsing; preserves unknown semantic verification. */
export class TemplateValueValidator {
  static validate(artifact: AbstractArtifact): ValidationSummary {
    if (artifact instanceof Template || artifact instanceof TemplateElement || artifact instanceof TemplateField) {
      const findings: ValidationFinding[] = [];
      this.visitModel(artifact, '', findings);
      return ValidationPolicy.summarize(findings, 'template');
    }
    return ValidationPolicy.summarize(
      [ValidationPolicy.finding('valueShape', '', 'Expected a template, element or field definition.')],
      'template',
    );
  }

  private static visitModel(artifact: AbstractArtifact, path: string, findings: ValidationFinding[]): void {
    if (artifact instanceof TemplateField) {
      this.visit(validationFieldSchema(artifact, true), path, findings);
    } else if (artifact instanceof Template || artifact instanceof TemplateElement) {
      for (const name of artifact.getChildrenInfo().getChildrenNames()) {
        const info = artifact.getChildInfo(name),
          child = artifact.getChild(name);
        let at = ValidationPolicy.child(path + '/properties', name);
        if (info?.isMultiInAnyWay()) {
          if (
            info instanceof AbstractDynamicChildDeploymentInfo &&
            info.minItems != null &&
            info.maxItems != null &&
            info.minItems > info.maxItems
          )
            findings.push(ValidationPolicy.finding('templateConstraint', at + '/maxItems', 'Minimum occurrence count exceeds maximum.'));
          at += '/items';
        }
        if (child) this.visitModel(child, at, findings);
      }
    }
  }

  /** Also accepts retained imported definitions so their defaults can be corrected. */
  static validateSource(source: unknown): ValidationSummary {
    const findings: ValidationFinding[] = [];
    this.visit(source, '', findings);
    return ValidationPolicy.summarize(findings, 'template');
  }

  private static visit(source: unknown, path: string, out: ValidationFinding[]): void {
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      out.push(ValidationPolicy.finding('valueShape', path, 'A definition must be an object.'));
      return;
    }
    const schema = source as ValidationField & { type?: string; items?: unknown; minItems?: number; maxItems?: number };
    if (schema.type === 'array') {
      if (schema.minItems != null && schema.maxItems != null && schema.minItems > schema.maxItems)
        out.push(ValidationPolicy.finding('templateConstraint', path + '/maxItems', 'Minimum occurrence count exceeds maximum.'));
      this.visit(schema.items, path + '/items', out);
      return;
    }
    if (schema._ui?.inputType) {
      out.push(...FieldValuePolicy.validateConfiguration(schema, path), ...FieldValuePolicy.validateDefault(schema, path));
      const value = schema._valueConstraints?.defaultValue;
      if (
        value != null &&
        value !== '' &&
        (FieldValuePolicy.isControlled(schema) || FieldValuePolicy.authorityTypes.has(schema._ui.inputType))
      ) {
        const semanticPath =
          path + '/_valueConstraints/defaultValue' + (FieldValuePolicy.isControlled(schema) && typeof value === 'object' ? '/termUri' : '');
        out.push(
          ValidationPolicy.finding(
            'semanticNotChecked',
            semanticPath,
            'Default identifier membership or existence has not been verified.',
            'notChecked',
          ),
        );
      }
      return;
    }
    for (const [name, child] of Object.entries(schema.properties ?? {})) {
      const candidate = child?.type === 'array' ? child.items : child;
      if (candidate && typeof candidate === 'object' && candidate._ui)
        this.visit(child, ValidationPolicy.child(path + '/properties', name), out);
    }
  }
}

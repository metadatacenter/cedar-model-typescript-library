import { AbstractArtifact } from './AbstractArtifact';
import { SchemaValuePolicy } from '../../policy/SchemaValuePolicy';
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
      SchemaValuePolicy.visit(validationFieldSchema(artifact, true), path, findings);
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
    SchemaValuePolicy.visit(source, '', findings);
    return ValidationPolicy.summarize(findings, 'template');
  }
}

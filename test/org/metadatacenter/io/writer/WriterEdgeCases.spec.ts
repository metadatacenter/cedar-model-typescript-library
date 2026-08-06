import {
  CedarBuilders,
  CedarFieldType,
  CedarWriters,
  ChildDeploymentInfoStatic,
  ControlledTermActionBuilder,
  ControlledTermBranchBuilder,
  ControlledTermClassBuilder,
  ControlledTermOntologyBuilder,
  ControlledTermValueSetBuilder,
  JsonNode,
  SchemaVersion,
} from '../../../../../src';
import { AdditionalProperties } from '../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/AdditionalProperties';
import { JsonValueConstraintsActionWriter } from '../../../../../src/org/metadatacenter/model/cedar/field/dynamic/controlled-term/value-constraint/action/JsonValueConstraintsActionWriter';
import { JsonValueConstraintsBranchWriter } from '../../../../../src/org/metadatacenter/model/cedar/field/dynamic/controlled-term/value-constraint/branch/JsonValueConstraintsBranchWriter';
import { JsonValueConstraintsClassWriter } from '../../../../../src/org/metadatacenter/model/cedar/field/dynamic/controlled-term/value-constraint/class/JsonValueConstraintsClassWriter';
import { JsonValueConstraintsOntologyWriter } from '../../../../../src/org/metadatacenter/model/cedar/field/dynamic/controlled-term/value-constraint/ontology/JsonValueConstraintsOntologyWriter';
import { JsonValueConstraintsValueSetWriter } from '../../../../../src/org/metadatacenter/model/cedar/field/dynamic/controlled-term/value-constraint/value-set/JsonValueConstraintsValueSetWriter';

describe('writer edge cases', () => {
  test('atomic JSON writing handles null, fallback, open-property, and unsupported values', () => {
    const writer = CedarWriters.json().getStrict().getAtomicWriter();

    expect(writer.write(null)).toBeNull();
    expect(writer.write(SchemaVersion.NULL)).toBe(SchemaVersion.CURRENT.getValue());
    expect(writer.write(AdditionalProperties.ALLOW_ATTRIBUTE_VALUE)).toEqual(expect.objectContaining({ type: expect.anything() }));
    expect(writer.write(AdditionalProperties.NULL)).toBeNull();
    expect(() => writer.write({} as never)).toThrow('Unsupported type');
  });

  test('writer facades dispatch every artifact kind and reject unsupported values', () => {
    const json = CedarWriters.json().getStrict();
    const yaml = CedarWriters.yaml().getStrict();
    const template = CedarBuilders.templateBuilder().build();
    const element = CedarBuilders.templateElementBuilder().build();
    const field = CedarBuilders.textFieldBuilder().build();

    expect(json.getWriterForArtifact(template)).toBeTruthy();
    expect(json.getWriterForArtifact(element)).toBeTruthy();
    expect(json.getWriterForArtifact(field)).toBeTruthy();
    expect(() => json.getWriterForArtifact({} as never)).toThrow('No JSON reader available');
    expect(() => json.getFieldWriterForType(CedarFieldType.NULL)).toThrow('No JSON writer found');
    expect(() => yaml.getFieldWriterForType(CedarFieldType.NULL)).toThrow('No YAML writer found');
    expect(() => json.getWriterForValueConstraint({ className: 'missing' } as never)).toThrow('No JSON writer found');
    expect(() => yaml.getWriterForValueConstraint({ className: 'missing' } as never)).toThrow('No YAML writer found');
  });

  test('controlled-term constraints have useful standalone JSON representations', () => {
    const writers = CedarWriters.json().getStrict();
    const branch = new ControlledTermBranchBuilder().withName('branch').build();
    const clazz = new ControlledTermClassBuilder().withLabel('class').build();
    const ontology = new ControlledTermOntologyBuilder().withName('ontology').build();
    const valueSet = new ControlledTermValueSetBuilder().withName('values').build();
    const action = new ControlledTermActionBuilder().withAction('delete').build();

    const branchJson = JSON.parse(
      (writers.getWriterForValueConstraint(branch) as JsonValueConstraintsBranchWriter).getAsJsonString(branch),
    );
    const classJson = JSON.parse((writers.getWriterForValueConstraint(clazz) as JsonValueConstraintsClassWriter).getAsJsonString(clazz));
    const ontologyJson = JSON.parse(
      (writers.getWriterForValueConstraint(ontology) as JsonValueConstraintsOntologyWriter).getAsJsonString(ontology),
    );
    const valueSetJson = JSON.parse(
      (writers.getWriterForValueConstraint(valueSet) as JsonValueConstraintsValueSetWriter).getAsJsonString(valueSet),
    );
    const actionJson = JSON.parse(
      (writers.getWriterForValueConstraint(action) as JsonValueConstraintsActionWriter).getAsJsonString(action),
    );

    expect(branchJson.name).toBe('branch');
    expect(classJson.label).toBe('class');
    expect(ontologyJson.name).toBe('ontology');
    expect(ontologyJson).not.toHaveProperty('numTerms');
    expect(valueSetJson.name).toBe('values');
    expect(actionJson.action).toBe('delete');
    expect(actionJson).not.toHaveProperty('to');
  });

  test('default child deployment and empty static content serialize without optional UI properties', () => {
    const json = CedarWriters.json().getStrict();
    const compatibilityJson = CedarWriters.json().getFebruary2024();
    const yaml = CedarWriters.yaml().getStrict();
    const text = CedarBuilders.textFieldBuilder().build();
    const image = CedarBuilders.imageFieldBuilder().build();
    const richText = CedarBuilders.richTextFieldBuilder().build();
    const youtube = CedarBuilders.youtubeFieldBuilder().build();

    expect(json.getFieldWriterForField(text).getAsJsonNode(text)).toHaveProperty('_ui.inputType');
    const staticDeploymentJson = json.getFieldWriterForField(text).getAsJsonNode(text, ChildDeploymentInfoStatic.empty());
    expect(staticDeploymentJson._ui).not.toHaveProperty('hidden');
    expect(staticDeploymentJson._valueConstraints).not.toHaveProperty('requiredValue');
    expect(compatibilityJson.getFieldWriterForField(text).getAsJsonNode(text).properties).not.toHaveProperty('@language');
    expect(yaml.getFieldWriterForField(image).getYamlAsJsonNode(image)).not.toHaveProperty('content');
    expect(yaml.getFieldWriterForField(richText).getYamlAsJsonNode(richText)).not.toHaveProperty('content');

    const yamlYoutube: JsonNode = yaml.getFieldWriterForField(youtube).getYamlAsJsonNode(youtube);
    expect(yamlYoutube).not.toHaveProperty('content');
    expect(yamlYoutube).not.toHaveProperty('width');
    expect(yamlYoutube).not.toHaveProperty('height');

    const jsonYoutube: JsonNode = json.getFieldWriterForField(youtube).getAsJsonNode(youtube);
    expect(jsonYoutube._ui).not.toHaveProperty('content');
    expect(jsonYoutube._ui).not.toHaveProperty('size');
  });
});

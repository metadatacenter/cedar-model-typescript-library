import { CedarBuilders, CedarJsonWriters, CedarWriters, TemplateInstance, TemplateInstanceBuilder } from '../../../../../../src';
import { JsonTemplateInstanceWriter } from '../../../../../../src/org/metadatacenter/io/writer/json/JsonTemplateInstanceWriter';
import { InstanceDataStringAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataStringAtom';
import { InstanceDataAtomList } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataAtomList';
import * as fs from 'fs';
import { TestResource } from '../../../../../../itest/TestResource';
import { TestUtil } from '../../../../../../itest/TestUtil';

describe('TemplateInstanceBuilder Reference Comparison', () => {
  test('creates template instance matching reference file instance-002.json and compares JSON output', () => {
    // Create multi-value array for the "Multi Text Field"
    const multiTextFieldValues: InstanceDataAtomList = [new InstanceDataStringAtom('value 1'), new InstanceDataStringAtom('value 2')];

    const templateInstanceBuilder: TemplateInstanceBuilder = CedarBuilders.templateInstanceBuilder();
    const templateInstance: TemplateInstance = templateInstanceBuilder
      .withAtId('https://repo.metadatacenter.org/template-instances/2ee5bd6a-47ca-4e77-be67-8a5d51d6fd9c')
      .withSchemaName('02 - multi text field metadata')
      .withSchemaDescription('')
      .withCreatedOn('2020-07-17T15:49:35-07:00')
      .withCreatedBy('https://metadatacenter.org/users/2fa8910d-96e7-4e2f-ae60-4dfa8ec9877d')
      .withLastUpdatedOn('2020-07-17T15:49:35-07:00')
      .withModifiedBy('https://metadatacenter.org/users/2fa8910d-96e7-4e2f-ae60-4dfa8ec9877d')
      .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/0829d5f1-303b-4fd8-be65-b40d2c8826f8')
      .withDataValue('Multi Text Field', multiTextFieldValues)
      .withDataIri('Multi Text Field', 'https://schema.metadatacenter.org/properties/3886be18-9efb-4edf-a814-02257e29378d')
      .withDataId('https://repo.metadatacenter.org/template-instances/2ee5bd6a-47ca-4e77-be67-8a5d51d6fd9c')
      .build();

    // Serialize to JSON
    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateInstanceWriter = writers.getTemplateInstanceWriter();
    const generatedJson = writer.getAsJsonNode(templateInstance);

    // Read the reference file
    const testResource: TestResource = TestResource.instance(2);
    const referenceFilePath: string = TestUtil.getReferenceJsonFileName(testResource);
    const referenceJsonString = fs.readFileSync(referenceFilePath, 'utf8');
    const referenceJson = JSON.parse(referenceJsonString);

    // Compare the generated JSON with the reference
    expect(generatedJson['@id']).toBe(referenceJson['@id']);
    expect(generatedJson['schema:name']).toBe(referenceJson['schema:name']);
    expect(generatedJson['schema:description']).toBe(referenceJson['schema:description']);
    expect(generatedJson['schema:isBasedOn']).toBe(referenceJson['schema:isBasedOn']);
    expect(generatedJson['pav:createdOn']).toBe(referenceJson['pav:createdOn']);
    expect(generatedJson['pav:createdBy']).toBe(referenceJson['pav:createdBy']);
    expect(generatedJson['pav:lastUpdatedOn']).toBe(referenceJson['pav:lastUpdatedOn']);
    expect(generatedJson['oslc:modifiedBy']).toBe(referenceJson['oslc:modifiedBy']);

    // Compare the multi-value field
    expect(generatedJson['Multi Text Field']).toEqual(referenceJson['Multi Text Field']);

    // Compare the context - check that all reference context properties exist in generated context
    const referenceContext = referenceJson['@context'] as Record<string, any>;
    const generatedContext = generatedJson['@context'] as Record<string, any>;

    // Check that all properties from reference context exist in generated context
    expect(generatedContext).not.toBeNull();
    Object.keys(referenceContext).forEach((key) => {
      expect(generatedContext[key]).toEqual(referenceContext[key]);
    });

    // Optional: Log the generated JSON for debugging
    // console.log('Generated JSON:', generatedString);
    // console.log('Reference JSON:', referenceJsonString);
  });
});

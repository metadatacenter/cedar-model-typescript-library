import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-024', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/024', 'template-024.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter: YAMLTemplateWriter = writers.getYAMLTemplateWriter();

    const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template);
    // console.log(stringified);
    const expectedSerialization = `
type: template
id: https://repo.metadatacenter.org/templates/d942c27c-8c5f-420d-b540-a6e9400d5f55
name: #024 Template with simple controlled field
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-11T16:27:51-07:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-11T16:27:51-07:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: Controlled
    multiple: true
    minItems: 4
    maxItems: 7
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/8fbf3e19-5c8a-4b72-9463-c1769fc73f96
    name: Controlled
    description: Help Text
    modelVersion: 1.6.0
    inputType: textfield
    datatype: xsd:anyURI
    valueRecommendationEnabled: true
    required: true
    values:
      - valueType: class
        label: Music
        source: MESH
        type: OntologyClass
        prefLabel: Music
        uri: http://purl.bioontology.org/ontology/MESH/D009146
    createdOn: 2024-03-11T16:27:51-07:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-11T16:27:51-07:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});

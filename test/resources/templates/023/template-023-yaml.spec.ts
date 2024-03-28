import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-023', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/023', 'template-023.json');
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
id: https://repo.metadatacenter.org/templates/a35e97be-a5e7-4a28-a3c4-3ba62bf980e5
name: #023 Template with controlled field
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-11T15:20:18-07:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-11T15:26:26-07:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: Controlled 1
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/ca4e4afa-ae85-4ac2-aa9b-5dd003f4ac8c
    name: Controlled 1
    description: Help Text
    modelVersion: 1.6.0
    altLabel:
      - ALT label 1
      - ALT label 2
    inputType: textfield
    datatype: xsd:anyURI
    defaultValue: http://purl.bioontology.org/ontology/MESH/C039047
    defaultLabel: 2,3,6-trichlorotoluene
    values:
      - valueType: ontology
        acronym: MESH
        name: Medical Subject Headings
        uri: https://data.bioontology.org/ontologies/MESH
        numTerms: 353825
      - valueType: class
        label: Music UI Label added in the editor
        source: MESH
        type: OntologyClass
        prefLabel: Music
        uri: http://purl.bioontology.org/ontology/MESH/D009146
      - valueType: branch
        source: Medical Subject Headings (MESH)
        acronym: MESH
        name: Mathematical Concepts
        uri: http://purl.bioontology.org/ontology/MESH/D055641
        maxDepth: 0
      - valueType: valueSet
        vsCollection: CADSR-VS
        name: Progressive Disease
        uri: https://cadsr.nci.nih.gov/metadata/CADSR-VS/ad5886076616ec6c35558648aca5abf942d6147a
        numTerms: 0
    createdOn: 2024-03-11T15:26:26-07:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-11T15:26:26-07:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});

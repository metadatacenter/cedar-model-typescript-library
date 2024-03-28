import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-030', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/030', 'template-030.json');
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
id: https://repo.metadatacenter.org/templates/7563ef7a-c390-4a31-bcab-bb6ea27bfb7b
name: #030 Template with actions
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-26T13:22:10-07:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-26T13:22:10-07:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: Untitled
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/ded5aa1e-b665-4897-b5b3-2084eff12a0c
    name: Untitled
    description: Help Text
    modelVersion: 1.6.0
    inputType: textfield
    datatype: xsd:anyURI
    values:
      - valueType: ontology
        acronym: HOME
        name: Health Ontology for Minority Equity
        uri: https://data.bioontology.org/ontologies/HOME
        numTerms: 82
      - valueType: class
        label: Verbal_Abuse
        source: HOME
        type: OntologyClass
        prefLabel: Verbal_Abuse
        uri: http://www.semanticweb.org/navyarenjith/ontologies/2021/3/untitled-ontology-5#Verbal_Abuse
      - valueType: branch
        source: undefined (CWD)
        acronym: CWD
        name: calories
        uri: http://www.semanticweb.org/jbagwell/ontologies/2017/9/untitled-ontology-6#calories
        maxDepth: 0
    actions:
      - action: delete
        termUri: http://www.semanticweb.org/navyarenjith/ontologies/2021/3/untitled-ontology-5#At_Elderly_Home
        sourceUri: https://data.bioontology.org/ontologies/HOME
        source: HOME
      - action: delete
        termUri: http://www.semanticweb.org/jbagwell/ontologies/2017/9/untitled-ontology-6#basalMetabolicRate
        sourceUri: http://www.semanticweb.org/jbagwell/ontologies/2017/9/untitled-ontology-6#calories
        source: CWD
      - action: delete
        termUri: http://www.semanticweb.org/navyarenjith/ontologies/2021/3/untitled-ontology-5#Baton
        sourceUri: https://data.bioontology.org/ontologies/HOME
        source: HOME
      - action: move
        to: 0
        termUri: http://www.semanticweb.org/navyarenjith/ontologies/2021/3/untitled-ontology-5#Denial_Of_Counseling_Preventive_Service
        sourceUri: https://data.bioontology.org/ontologies/HOME
        source: HOME
      - action: move
        to: 0
        termUri: http://www.semanticweb.org/navyarenjith/ontologies/2021/3/untitled-ontology-5#Excessive_Use_Of_Physical_Force
        sourceUri: https://data.bioontology.org/ontologies/HOME
        source: HOME
      - action: move
        to: 4
        termUri: http://www.semanticweb.org/navyarenjith/ontologies/2021/3/untitled-ontology-5#Exposure_To_Harmful_Chemicals
        sourceUri: https://data.bioontology.org/ontologies/HOME
        source: HOME
      - action: delete
        termUri: http://www.semanticweb.org/navyarenjith/ontologies/2021/3/untitled-ontology-5#Denial_Of_Ambulatory_Service
        sourceUri: https://data.bioontology.org/ontologies/HOME
        source: HOME
    createdOn: 2024-03-26T13:22:10-07:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-26T13:22:10-07:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});

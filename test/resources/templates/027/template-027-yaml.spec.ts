import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-027', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/027', 'template-027.json');
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
id: https://repo.metadatacenter.orgx/templates/50cee84b-bfd8-4b6b-9a97-a74a5d6d63f9
name: template 36
status: bibo:published
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-02-15T11:21:09-08:00
createdBy: https://metadatacenter.org/users/68d898fd-2b81-492c-b68c-a80c8283fd8a
lastUpdatedOn: 2024-02-15T11:23:19-08:00
modifiedBy: https://metadatacenter.org/users/68d898fd-2b81-492c-b68c-a80c8283fd8a
annotations:
  - name: https://datacite.com/doi
    type: id
    value: https://doi.org/10.82658/8vc1-qf27
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});

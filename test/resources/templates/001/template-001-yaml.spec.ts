import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-001', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/001', 'template-001.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter: YAMLTemplateWriter = writers.getYAMLTemplateWriter();

    const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template);
    // console.log(stringified);
    expect(stringified.length).toBe(325);
    const expectedSerialization = `
type: template
name: Untitled
description: Untitled description
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
children:
  - key: Textfield
    type: templateField
    id: tmp-1708998934299-6744386
    name: Textfield
    description: Help Text
    modelVersion: 1.6.0
    inputType: textfield
    datatype: xsd:string`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});

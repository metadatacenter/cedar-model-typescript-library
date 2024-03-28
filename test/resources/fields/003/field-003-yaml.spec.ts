import { CedarWriters, JSONFieldReader } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateFieldWriter - field-003', () => {
  test('read a JSON field, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('fields/003', 'field-003.json');
    const reader: JSONFieldReader = JSONFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(artifactSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter = writers.getYAMLFieldWriterForField(jsonFieldReaderResult.field);

    const stringified = yamlWriter.getAsYamlString(jsonFieldReaderResult.field);
    // console.log(stringified);
    const expectedSerialization = `
type: templateField
id: https://repo.metadatacenter.org/template-fields/ddd47aa9-923e-4b00-bff3-aea907a95ed2
identifier: study_start_date
name: Study Start Date
description: |-
  The official start date for the study for which this data file was created. This date must be in the ISO-8601 format of yyyy-mm-dd. For example, 2022-10-05 specifies October 5, 2022.

  This field is considered auxiliary information to the initially registered Study Start Date. It will not update the registered information, but may trigger a verification that the registered Start Date has not changed.
status: bibo:draft
version: 0.9.1
modelVersion: 1.6.0
label: Study Start Date
inputType: temporal
granularity: day
datatype: xsd:date
createdOn: 2022-10-13T14:15:32-07:00
createdBy: https://metadatacenter.org/users/819b3cfd-49a9-4e72-b5d5-18166366f014
lastUpdatedOn: 2022-10-13T14:15:32-07:00
modifiedBy: https://metadatacenter.org/users/819b3cfd-49a9-4e72-b5d5-18166366f014
derivedFrom: ""
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});

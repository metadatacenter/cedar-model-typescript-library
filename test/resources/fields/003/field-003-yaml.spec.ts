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
    // TODO: YAML: timeFormat is not serialized, if default, but java library renders it
    expect(stringified.length).toBe(974);
    expect(stringified).toContain('type: templateField');
    expect(stringified).toContain('id: https://repo.metadatacenter.org/template-fields/ddd47aa9-923e-4b00-bff3-aea907a95ed2');
    expect(stringified).toContain('identifier: study_start_date');
    expect(stringified).toContain('name: Study Start Date');
    expect(stringified).toContain('description: |-');
    expect(stringified).toContain(
      '  The official start date for the study for which this data file was created. This date must be in the ISO-8601 format of yyyy-mm-dd. For example, 2022-10-05 specifies October 5, 2022.',
    );
    expect(stringified).not.toContain('  \n');
    expect(stringified).toContain(
      '  This field is considered auxiliary information to the initially registered Study Start Date. It will not update the registered information, but may trigger a verification that the registered Start Date has not changed.',
    );
    expect(stringified).toContain('status: bibo:draft');
    expect(stringified).toContain('version: 0.9.1');
    expect(stringified).toContain('modelVersion: 1.6.0');
    expect(stringified).toContain('label: Study Start Date');
    expect(stringified).toContain('inputType: temporal');
    expect(stringified).toContain('granularity: day');
    expect(stringified).toContain('datatype: xsd:date');
    expect(stringified).toContain('createdOn: 2022-10-13T14:15:32-07:00');
    expect(stringified).toContain('createdBy: https://metadatacenter.org/users/819b3cfd-49a9-4e72-b5d5-18166366f014');
    expect(stringified).toContain('lastUpdatedOn: 2022-10-13T14:15:32-07:00');
    expect(stringified).toContain('modifiedBy: https://metadatacenter.org/users/819b3cfd-49a9-4e72-b5d5-18166366f014');
    expect(stringified).toContain('derivedFrom: ""');
  });
});

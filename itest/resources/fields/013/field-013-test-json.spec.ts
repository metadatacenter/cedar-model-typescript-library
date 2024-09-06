import { TestUtil } from '../../../TestUtil';
import { CedarWriters, CedarYamlWriters, JsonTemplateFieldReader, YamlTemplateFieldWriter } from '../../../../src';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.field(13);

describe('JSONFieldReaderYAMLWriter' + testResource.toString(), () => {
  test('reads a field, check for new line handling', () => {
    const artifactSource = TestUtil.readReferenceJson(testResource);
    const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(artifactSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const schema_description = jsonFieldReaderResult.field.schema_description;
    expect(schema_description).toStrictEqual('\\n\n');

    const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
    const yamlWriter: YamlTemplateFieldWriter = writers.getFieldWriterForField(jsonFieldReaderResult.field);

    const stringified: string = yamlWriter.getAsYamlString(jsonFieldReaderResult.field);
    const descriptionMatch = stringified.match(/description:\s*"(.*?)"/);
    expect(descriptionMatch).not.toBeNull();
    expect(descriptionMatch?.length).toBe(2);
    expect(descriptionMatch?.[1]).toBe('\\\\n\\n');
  });
});

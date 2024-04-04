import { TestUtil } from '../../../TestUtil';
import { CedarArtifactId, JsonTemplateInstanceReader } from '../../../../src';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.instance(1);

describe('JSONInstanceReader' + testResource.toString(), () => {
  test('reads a simple instance', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateInstanceReader = JsonTemplateInstanceReader.getStrict();
    const jsonInstanceReaderResult = reader.readFromString(artifactSource);
    expect(jsonInstanceReaderResult).not.toBeNull();
    const parsingResult = jsonInstanceReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
    expect(jsonInstanceReaderResult.instance.at_id).toStrictEqual(
      CedarArtifactId.forValue('https://repo.metadatacenter.org/template-instances/1da98ce2-9b74-4257-af64-e6ef1c143f6e'),
    );
    expect(jsonInstanceReaderResult.instance.schema_name).toBe('With Email metadata');
  });
});

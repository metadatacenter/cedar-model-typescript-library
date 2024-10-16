import { TestUtil } from '../../../TestUtil';
import { CedarArtifactId, JsonTemplateInstanceReader } from '../../../../src';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.instance(1);

describe('JSONInstanceReader' + testResource.toString(), () => {
  test('reads a simple instance', () => {
    const artifactSource = TestUtil.readReferenceJson(testResource);
    const reader: JsonTemplateInstanceReader = JsonTemplateInstanceReader.getStrict();
    const jsonInstanceReaderResult = reader.readFromString(artifactSource);
    expect(jsonInstanceReaderResult).not.toBeNull();
    const parsingResult = jsonInstanceReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
    expect(jsonInstanceReaderResult.instance.at_id).toStrictEqual(
      CedarArtifactId.forValue('https://repo.metadatacenter.org/template-instances/19f5261e-9259-45ec-b961-b3d17c92f27f'),
    );
    expect(jsonInstanceReaderResult.instance.schema_name).toBe('01 - single field metadata');
  });
});

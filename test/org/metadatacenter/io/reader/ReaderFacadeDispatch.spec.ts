import {
  CedarArtifactType,
  CedarJsonReaders,
  CedarYamlReaders,
  JsonNode,
  JsonTemplateElementReader,
  JsonTemplateFieldReader,
  JsonTemplateInstanceReader,
  JsonTemplateReader,
  YamlTemplateElementReader,
  YamlTemplateFieldReader,
  YamlTemplateInstanceReader,
  YamlTemplateReader,
} from '../../../../../src';

describe('reader facade dispatch', () => {
  test('JSON detection accepts strings and objects and reports an absent type', () => {
    const templateType = CedarArtifactType.TEMPLATE.getValue();
    expect(CedarJsonReaders.detectArtifactType(JSON.stringify({ '@type': templateType }))).toBe(CedarArtifactType.TEMPLATE);
    expect(CedarJsonReaders.detectArtifactType({ '@type': templateType } as JsonNode)).toBe(CedarArtifactType.TEMPLATE);
    expect(CedarJsonReaders.detectArtifactType(JsonNode.getEmpty())).toBe(CedarArtifactType.NULL);
  });

  test.each([
    [CedarArtifactType.TEMPLATE, JsonTemplateReader],
    [CedarArtifactType.TEMPLATE_ELEMENT, JsonTemplateElementReader],
    [CedarArtifactType.TEMPLATE_FIELD, JsonTemplateFieldReader],
    [CedarArtifactType.STATIC_TEMPLATE_FIELD, JsonTemplateFieldReader],
    [CedarArtifactType.TEMPLATE_INSTANCE, JsonTemplateInstanceReader],
  ])('JSON dispatches %s to its reader', (artifactType, readerType) => {
    expect(CedarJsonReaders.getStrict().getReaderForArtifactType(artifactType)).toBeInstanceOf(readerType);
  });

  test.each([
    [CedarArtifactType.TEMPLATE, YamlTemplateReader],
    [CedarArtifactType.TEMPLATE_ELEMENT, YamlTemplateElementReader],
    [CedarArtifactType.TEMPLATE_FIELD, YamlTemplateFieldReader],
    [CedarArtifactType.STATIC_TEMPLATE_FIELD, YamlTemplateFieldReader],
    [CedarArtifactType.TEMPLATE_INSTANCE, YamlTemplateInstanceReader],
  ])('YAML dispatches %s to its reader', (artifactType, readerType) => {
    expect(CedarYamlReaders.getStrict().getReaderForArtifactType(artifactType)).toBeInstanceOf(readerType);
  });

  test('unsupported artifact types fail explicitly', () => {
    expect(() => CedarJsonReaders.getStrict().getReaderForArtifactType(CedarArtifactType.NULL)).toThrow('No JSON reader available');
    expect(() => CedarYamlReaders.getStrict().getReaderForArtifactType(CedarArtifactType.NULL)).toThrow('No YAML reader available');
  });
});

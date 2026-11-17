import { CedarWriters, JsonElementInstanceReader, YamlElementInstanceReader } from '../../src';
import { TestUtil } from '../TestUtil';
import { TestResource } from '../TestResource';
import { elementInstanceTestNumbers } from './generatedTestCases';

// Each standalone element instance in the shared corpus, read from its source and written in the three
// forms, must come out as the Java library's committed renderings, and the Java library's YAML, full
// and compact, must read back to the same document.
describe('ElementInstance-references', () => {
  const jsonWriter = CedarWriters.json().getStrict().getElementInstanceWriter();
  const yamlWriter = CedarWriters.yaml().getStrict().getElementInstanceWriter();

  elementInstanceTestNumbers.forEach((number) => {
    const resource = TestResource.elementInstance(number);

    it(`writes the Java library's JSON, YAML and compact YAML: ${resource}`, () => {
      const instance = JsonElementInstanceReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).instance;
      expect(JSON.parse(jsonWriter.getAsJsonString(instance))).toEqual(JSON.parse(TestUtil.readJavaLibJson(resource)));
      expect(yamlWriter.getAsYamlString(instance, false)).toBe(TestUtil.readJavaLibYaml(resource, false));
      expect(yamlWriter.getAsYamlString(instance, true)).toBe(TestUtil.readJavaLibYaml(resource, true));
    });

    it(`reads the Java library's YAML back to the same document: ${resource}`, () => {
      for (const compact of [false, true]) {
        const javaYaml = TestUtil.readJavaLibYaml(resource, compact);
        const reread = YamlElementInstanceReader.getStrict().readFromString(javaYaml).instance;
        expect(yamlWriter.getAsYamlString(reread, compact)).toBe(javaYaml);
      }
    });
  });
});

import { CedarBuilders, CedarReaders, CedarWriters } from '../src';

for (const factory of [CedarBuilders.imageFieldBuilder, CedarBuilders.youtubeFieldBuilder]) {
  for (const [width, height] of [
    [320, null],
    [null, 180],
    [320, 180],
    [null, null],
  ] as const) {
    test(`${factory.name} preserves independent dimensions ${width} × ${height} in standalone JSON and YAML`, () => {
      const field = factory().withSchemaName('Media').withWidth(width).withHeight(height).build();
      const jsonWriter = CedarWriters.json().getStrict().getFieldWriterForField(field);
      const json = jsonWriter.getAsJsonNode(field);
      const expectedSize = { ...(width === null ? {} : { width }), ...(height === null ? {} : { height }) };
      expect(json['_ui']).toMatchObject(width === null && height === null ? { _content: null } : { _size: expectedSize });
      const fromJson = CedarReaders.json().getStrict().getTemplateFieldReader().readFromObject(json).field;
      expect(jsonWriter.getAsJsonNode(fromJson)).toEqual(json);
      const yaml = CedarWriters.yaml().getStrict().getFieldWriterForField(field).getAsYamlString(field);
      const fromYaml = CedarReaders.yaml().getStrict().getTemplateFieldReader().readFromString(yaml).field;
      expect(jsonWriter.getAsJsonNode(fromYaml)['_ui']).toEqual(json['_ui']);
    });
  }
}

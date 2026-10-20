import { CedarBuilders, CedarReaders, CedarWriters, JsonNode, Language } from '../src';

/**
 * A template's or element's own language lives in its top-level `@context`, where the Java library
 * writes it and both libraries read it. The schema of its instances' context, under `properties`,
 * takes no `@language`: the meta-schema refuses one there, so a template written that way cannot be
 * saved.
 */
const writers = CedarWriters.json().getStrict();
const readers = CedarReaders.json().getStrict();

const containers = [
  {
    kind: 'template',
    build: () => CedarBuilders.templateBuilder().withSchemaName('Study').build(),
    write: (artifact: never) => writers.getTemplateWriter().getAsJsonNode(artifact),
    read: (json: JsonNode) => readers.getTemplateReader().readFromObject(json).template,
  },
  {
    kind: 'element',
    build: () => CedarBuilders.templateElementBuilder().withSchemaName('Sample').build(),
    write: (artifact: never) => writers.getTemplateElementWriter().getAsJsonNode(artifact),
    read: (json: JsonNode) => readers.getTemplateElementReader().readFromObject(json).element,
  },
] as const;

for (const { kind, build, write, read } of containers) {
  test(`a ${kind}'s language is written to its own context and read back from there`, () => {
    const artifact = build();
    artifact.language = Language.forValue('fr');
    const json = write(artifact as never);
    expect(json['@context']).toMatchObject({ '@language': 'fr' });
    expect((json['properties'] as JsonNode)['@context']).not.toHaveProperty('@language');
    const restored = read(json);
    expect(restored.language.getValue()).toBe('fr');
    expect(write(restored as never)).toEqual(json);
  });

  test(`a ${kind} with no language writes none in either context`, () => {
    const json = write(build() as never);
    expect(json['@context']).not.toHaveProperty('@language');
    expect((json['properties'] as JsonNode)['@context']).not.toHaveProperty('@language');
    expect(read(json).language).toBe(Language.NULL);
  });

  test(`a ${kind} written where the language used to go keeps it, and is rewritten where it belongs`, () => {
    const json = write(build() as never);
    const legacy = structuredClone(json);
    ((legacy['properties'] as JsonNode)['@context'] as JsonNode)['@language'] = 'fr';
    const restored = read(legacy);
    expect(restored.language.getValue()).toBe('fr');
    const rewritten = write(restored as never);
    expect(rewritten['@context']).toMatchObject({ '@language': 'fr' });
    expect((rewritten['properties'] as JsonNode)['@context']).not.toHaveProperty('@language');
  });
}

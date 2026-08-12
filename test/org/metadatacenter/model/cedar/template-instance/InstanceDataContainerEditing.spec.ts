import { InstanceDataContainer, InstanceDataStringAtom } from '../../../../../../src';

/**
 * Changing a container's children through the container.
 *
 * `values` and `iris` are exposed for reading and were the only way to change
 * one, so a consumer removing a child reached in and used `delete` — and, in
 * every case that mattered, forgot the second map. A property is a child *and*
 * the IRI identifying it; a name left in the IRI map with no child under it
 * becomes a `@context` entry pointing at nothing.
 */
describe('a container edited through its own methods', () => {
  const filled = () => {
    const container = new InstanceDataContainer();
    container.setValue('_colour', new InstanceDataStringAtom('blue'));
    container.setIri('_colour', 'https://schema.metadatacenter.org/properties/1');
    return container;
  };

  test('removing a child takes its property IRI with it', () => {
    const container = filled();
    expect([container.hasValue('_colour'), container.hasIri('_colour')]).toEqual([true, true]);

    container.removeValue('_colour');

    expect([container.hasValue('_colour'), container.hasIri('_colour')]).toEqual([false, false]);
    expect(container.values).toEqual({});
    expect(container.iris).toEqual({});
  });

  test('an identity can be dropped on its own, for a child that stays', () => {
    const container = filled();
    container.removeIri('_colour');
    expect(container.hasValue('_colour')).toBe(true);
    expect(container.hasIri('_colour')).toBe(false);
  });

  test('removing what is not there is not an error', () => {
    const container = new InstanceDataContainer();
    expect(() => container.removeValue('_absent')).not.toThrow();
    expect(container.hasValue('_absent')).toBe(false);
  });
});

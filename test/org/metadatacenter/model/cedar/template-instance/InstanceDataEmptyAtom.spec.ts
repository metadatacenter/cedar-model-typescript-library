import { InstanceDataEmptyAtom } from '../../../../../../src';

describe('InstanceDataEmptyAtom', () => {
  test('distinguishes a genuinely empty value from discarded source content', () => {
    const empty = new InstanceDataEmptyAtom();
    const emptyObject = new InstanceDataEmptyAtom({});
    const discarded = new InstanceDataEmptyAtom({ label: 'orphaned label' });

    expect(empty.discarded).toBeNull();
    expect(empty.hasDiscardedContent()).toBe(false);
    expect(emptyObject.hasDiscardedContent()).toBe(false);
    expect(discarded.hasDiscardedContent()).toBe(true);
    expect(discarded.discarded).toEqual({ label: 'orphaned label' });
  });
});

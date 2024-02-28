import { BiboStatus, BiboStatusValues } from './BiboStatus';

test('creates draft status', () => {
  const draftByReference = BiboStatus.DRAFT;
  expect(draftByReference).not.toBeNull();
  expect(draftByReference.getValue()).toBe(BiboStatusValues.DRAFT);

  const draftByValue = BiboStatus.forValue(BiboStatusValues.DRAFT);
  expect(draftByValue).not.toBeNull();
  expect(draftByValue.getValue()).toBe(BiboStatusValues.DRAFT);
});

test('creates published status', () => {
  const publishedByReference = BiboStatus.PUBLISHED;
  expect(publishedByReference).not.toBeNull();
  expect(publishedByReference.getValue()).toBe(BiboStatusValues.PUBLISHED);

  const publishedByValue = BiboStatus.forValue(BiboStatusValues.PUBLISHED);
  expect(publishedByValue).not.toBeNull();
  expect(publishedByValue.getValue()).toBe(BiboStatusValues.PUBLISHED);
});

test('creates unknown status', () => {
  const unknownByReference = BiboStatus.NULL;
  expect(unknownByReference).not.toBeNull();
  expect(unknownByReference.getValue()).toBeNull();

  const unknownByValue = BiboStatus.forValue('unknown-string');
  expect(unknownByValue).not.toBeNull();
  expect(unknownByValue.getValue()).toBeNull();

  const unknownByNull = BiboStatus.forValue(null);
  expect(unknownByNull).not.toBeNull();
  expect(unknownByNull.getValue()).toBeNull();
});

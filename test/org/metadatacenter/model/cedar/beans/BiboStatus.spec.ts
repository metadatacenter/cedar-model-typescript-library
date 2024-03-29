import { BiboStatus, BiboStatusJsonValues } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/BiboStatus';

describe('BiboStatus', () => {
  test('creates draft status', () => {
    const draftByReference = BiboStatus.DRAFT;
    expect(draftByReference).not.toBeNull();
    expect(draftByReference.getJsonValue()).toBe(BiboStatusJsonValues.DRAFT);

    const draftByValue = BiboStatus.forJsonValue(BiboStatusJsonValues.DRAFT);
    expect(draftByValue).not.toBeNull();
    expect(draftByValue.getJsonValue()).toBe(BiboStatusJsonValues.DRAFT);
  });

  test('creates published status', () => {
    const publishedByReference = BiboStatus.PUBLISHED;
    expect(publishedByReference).not.toBeNull();
    expect(publishedByReference.getJsonValue()).toBe(BiboStatusJsonValues.PUBLISHED);

    const publishedByValue = BiboStatus.forJsonValue(BiboStatusJsonValues.PUBLISHED);
    expect(publishedByValue).not.toBeNull();
    expect(publishedByValue.getJsonValue()).toBe(BiboStatusJsonValues.PUBLISHED);
  });

  test('creates unknown status', () => {
    const unknownByReference = BiboStatus.NULL;
    expect(unknownByReference).not.toBeNull();
    expect(unknownByReference.getJsonValue()).toBeNull();

    const unknownByValue = BiboStatus.forJsonValue('unknown-string');
    expect(unknownByValue).not.toBeNull();
    expect(unknownByValue.getJsonValue()).toBeNull();

    const unknownByNull = BiboStatus.forJsonValue(null);
    expect(unknownByNull).not.toBeNull();
    expect(unknownByNull.getJsonValue()).toBeNull();
  });
});

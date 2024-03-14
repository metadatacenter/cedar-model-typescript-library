import { SchemaVersion, SchemaVersionValues } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/SchemaVersion';

describe('SchemaVersion', () => {
  test('creates current version', () => {
    const unknown = SchemaVersion.forValue(SchemaVersionValues.CURRENT);
    expect(unknown).not.toBeNull();
    expect(unknown.getValue()).toBe('1.6.0');
  });

  test('creates random version', () => {
    const unknown = SchemaVersion.forValue('1.1.1');
    expect(unknown).not.toBeNull();
    expect(unknown.getValue()).toBe(null);
  });

  test('creates unknown version using null', () => {
    const nullByNull = SchemaVersion.forValue(null);
    expect(nullByNull).not.toBeNull();
    expect(nullByNull.getValue()).toBe(null);
  });
});

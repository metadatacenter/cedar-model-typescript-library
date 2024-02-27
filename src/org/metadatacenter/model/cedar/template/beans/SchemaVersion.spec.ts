import { SchemaVersion, SchemaVersionValues } from './SchemaVersion';

test('creates random version', () => {
  const unknown = SchemaVersion.forValue('1.1.1');
  expect(unknown).not.toBeNull();
  expect(unknown.getValue()).toBe('1.1.1');
});

test('creates current version using null', () => {
  const nullByNull = SchemaVersion.forValue(null);
  expect(nullByNull).not.toBeNull();
  expect(nullByNull.getValue()).toBe(SchemaVersionValues.CURRENT);
});

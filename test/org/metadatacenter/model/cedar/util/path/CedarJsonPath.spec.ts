import { JsonPath } from '../../../../../../../src';

describe('CedarJsonPath', () => {
  test('toString returns correct path format', () => {
    const path = new JsonPath('level1', 'level2', 3, 'x', 5);
    expect(path.toString()).toBe('/level1/level2/[3]/x/[5]/');
  });

  test('equal returns true for identical paths', () => {
    const path1 = new JsonPath('level1', 2);
    const path2 = new JsonPath('level1', 2);
    expect(path1.equal(path2)).toBe(true);
  });

  test('equal returns false for different paths', () => {
    const path1 = new JsonPath('level1', 2);
    const path2 = new JsonPath('level1', 3);
    expect(path1.equal(path2)).toBe(false);
  });

  test('equal returns false when path lengths differ', () => {
    expect(new JsonPath('level1').equal(new JsonPath('level1', 'level2'))).toBe(false);
  });

  test('add returns a new path with additional components', () => {
    const path1 = new JsonPath('level1');
    const path2 = path1.add('level2', 3);
    expect(path1.toString()).toBe('/level1/');
    expect(path2.toString()).toBe('/level1/level2/[3]/');
  });

  test('join combines two paths', () => {
    const path1 = new JsonPath('level1');
    const path2 = new JsonPath('level2', 3);
    const path3 = path1.join(path2);
    expect(path3.toString()).toBe('/level1/level2/[3]/');
  });

  test('reports the last component, including the empty-path case', () => {
    expect(new JsonPath().getLastComponent()).toBeNull();
    expect(new JsonPath('level1', 2).getLastComponent()).toBe(2);
  });

  test('matches suffixes, wildcards, and rejects mismatches or overlong suffixes', () => {
    const path = new JsonPath('properties', '_field', 'items');
    expect(path.endsIn('_field', 'items')).toBe(true);
    expect(path.endsIn(JsonPath.ANY, 'items')).toBe(true);
    expect(path.endsIn('_other', 'items')).toBe(false);
    expect(path.endsIn('schema', 'properties', '_field', 'items')).toBe(false);
  });

  test('selects the requested number of trailing components', () => {
    const path = new JsonPath('one', 'two', 'three');
    expect(path.getLastNComponents(2).toString()).toBe('/two/three/');
    expect(path.getLastNComponents(10).toString()).toBe('/one/two/three/');
    expect(path.getLastNComponents(0).toString()).toBe('/');
    expect(new JsonPath().getLastNComponents(2).toString()).toBe('/');
  });
});

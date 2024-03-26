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
});

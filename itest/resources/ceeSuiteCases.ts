import { ceeSuiteTestMap } from './generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';

const numbers = (part: 'template' | 'instance'): number[] =>
  Object.entries(ceeSuiteTestMap)
    .filter(([, definition]) => definition[part])
    .map(([number]) => Number(number))
    .sort((a, b) => a - b);

/** The CEE suite cases that hold a template, and those that hold an instance. */
export const ceeSuiteTemplateResources = (): TestResource[] => numbers('template').map((n) => TestResource.ceeSuite(n));
export const ceeSuiteInstanceResources = (): TestResource[] => numbers('instance').map((n) => TestResource.ceeSuiteInstance(n));

/**
 * A CEE suite instance as a host stores it. Most of the suite's instances are CEE's output before a
 * host stores it: data alone, with no name and no template named. Both libraries' strict readers
 * require both, so such an instance is given the template in its own case and its case identifier as
 * its name, as the Java library's corpus verifiers give them. An instance that names its template is
 * left as it is.
 */
export const ceeSuiteInstanceAsStored = (resource: TestResource): string => {
  const source = TestUtil.readReferenceJson(resource);
  const instance = JSON.parse(source);
  if (Object.hasOwn(instance, 'schema:isBasedOn')) return source;
  const template = JSON.parse(TestUtil.readReferenceJson(TestResource.ceeSuite(Number(resource.getCaseId().slice(-3)))));
  instance['schema:isBasedOn'] = template['@id'];
  instance['schema:name'] = resource.getCaseId();
  return JSON.stringify(instance, null, 2) + '\n';
};

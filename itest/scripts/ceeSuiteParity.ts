import { isDeepStrictEqual } from 'node:util';
import * as fs from 'fs';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';
import { ceeSuiteInstanceResources, ceeSuiteTemplateResources } from '../resources/ceeSuiteCases';

export type CeeSuiteForm = 'json' | 'yaml' | 'compact';

/**
 * The CEE suite cases that neither library renders, with the reason. A case listed here that either
 * library starts rendering fails the run, so the list cannot outlive its reason.
 */
export const CEE_SUITE_REFUSED_BY_BOTH: Readonly<Record<string, string>> = {
  'cee-template-004': "an integer field states two decimal places ('An integer datatype cannot have decimal places.')",
  'cee-template-086': 'deliberately malformed JSON, which both readers refuse',
};

/**
 * The CEE suite cases only one library renders: open defects, each a difference between the libraries
 * that has to be fixed in the library that is wrong. A listed case that both libraries come to render
 * alike fails the run until it is removed, and so does an unlisted case rendered by one library only.
 */
export const CEE_SUITE_OPEN_DEFECTS: Readonly<Record<string, string>> = {};

const fileNames = (resource: TestResource, form: CeeSuiteForm): [string, string] =>
  form === 'json'
    ? [TestUtil.getJavaGeneratedJsonFileName(resource), TestUtil.getOwnGeneratedJsonFileName(resource)]
    : [TestUtil.getJavaGeneratedYamlFileName(resource, form === 'compact'), TestUtil.getOwnGeneratedYamlFileName(resource, form === 'compact')];

/**
 * Hold this library's rendering of every CEE suite template and instance to the Java library's, in one
 * form. JSON is compared as structure and YAML byte for byte, as the numbered collections are. Every case
 * is accounted for: compared, refused by both with a listed reason, or an open defect with a listed
 * reason. Returns the number of problems, and sets a failing exit code when there are any.
 */
export function verifyCeeSuiteParity(form: CeeSuiteForm, parts: Array<'template' | 'instance'> = ['template', 'instance']): number {
  const resources = [
    ...(parts.includes('template') ? ceeSuiteTemplateResources() : []),
    ...(parts.includes('instance') ? ceeSuiteInstanceResources() : []),
  ];
  const problems: string[] = [];
  let compared = 0;
  for (const resource of resources) {
    const id = resource.getCaseId();
    const [javaFile, typeScriptFile] = fileNames(resource, form);
    const [java, typeScript] = [fs.existsSync(javaFile), fs.existsSync(typeScriptFile)];
    if (!java && !typeScript) {
      if (!(id in CEE_SUITE_REFUSED_BY_BOTH)) problems.push(`${id}: neither library renders it, and no reason is listed`);
      continue;
    }
    if (id in CEE_SUITE_REFUSED_BY_BOTH) problems.push(`${id}: listed as refused by both, but rendered by ${java ? 'Java' : 'TypeScript'}`);
    if (java !== typeScript) {
      if (!(id in CEE_SUITE_OPEN_DEFECTS)) problems.push(`${id}: rendered by ${java ? 'Java' : 'TypeScript'} only`);
      continue;
    }
    compared++;
    const [left, right] = [fs.readFileSync(javaFile, 'utf8'), fs.readFileSync(typeScriptFile, 'utf8')];
    const same = form === 'json' ? isDeepStrictEqual(JSON.parse(left), JSON.parse(right)) : left.trim() === right.trim();
    if (!same) problems.push(`${id}: ${form === 'json' ? 'structurally differing' : 'differing'} ${form}`);
    else if (id in CEE_SUITE_OPEN_DEFECTS) problems.push(`${id}: both libraries now agree; remove it from the open defects`);
  }
  const listed = Object.keys(CEE_SUITE_OPEN_DEFECTS).filter((id) => resources.some((r) => r.getCaseId() === id));
  console.log(`cee-suite (${form}): ${compared} compared, ${problems.length} problems, open defects: ${listed.join(', ') || 'none'}`);
  problems.forEach((problem) => console.error(`  ${problem}`));
  if (problems.length > 0) process.exitCode = 1;
  return problems.length;
}

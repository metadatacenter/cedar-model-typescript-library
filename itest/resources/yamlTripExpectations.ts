import { TripFamily } from './JsonThroughYaml';

/**
 * The known families each corpus case shows when its JSON is written through YAML (see `TripFamily`).
 * A case not listed shows none. `schemaText` is listed nowhere, since every schema artifact may show
 * it. A case that stops showing a family it declares fails as surely as one that starts showing a new one.
 */
const each = (family: TripFamily, ids: string[]): Record<string, readonly TripFamily[]> =>
  Object.fromEntries(ids.map((id) => [id, [family]]));

export const TRIP_FAMILIES: Readonly<Record<string, readonly TripFamily[]>> = {
  // Templates stored without some `_ui.propertyLabels` or `_ui.propertyDescriptions` entries.
  ...each('uiEntryFilled', ['template-003', 'cee-template-076', 'cee-template-087']),
  // Ontologies addressed as http://data.bioontology.org/ or https://bioportal.bioontology.org/.
  ...each('ontologyAddress', ['cee-template-021', 'cee-template-042', 'cee-template-043', 'cee-template-045', 'cee-template-071']),
  // Instances holding empty values, omitting children their template declares, holding fewer
  // occurrences of a repeated child than its lower bound, or stating property IRIs other than their
  // template's. cee-instance-072 also holds an element with nothing but an identifier.
  ...each('instanceCompletion', [
    'instance-002',
    'instance-004',
    'instance-005',
    'instance-009',
    'instance-011',
    'instance-012',
    'instance-013',
    'instance-015',
    'instance-016',
    'instance-017',
    'instance-018',
    'instance-019',
    'instance-020',
    'instance-021',
    'instance-022',
    'cee-instance-002',
    'cee-instance-004',
    'cee-instance-013',
    'cee-instance-016',
    'cee-instance-020',
    'cee-instance-029',
    'cee-instance-041',
    'cee-instance-046',
    'cee-instance-057',
    'cee-instance-059',
    'cee-instance-060',
    'cee-instance-063',
    'cee-instance-071',
    'cee-instance-072',
    'cee-instance-085',
    'cee-instance-086',
  ]),
};

/** Cases the comparison cannot run on, and why. */
export const TRIP_EXCLUSIONS: Readonly<Record<string, string>> = {
  'cee-template-086': 'deliberately malformed JSON, which the CEE reference test holds the reader to refusing',
  'instance-008': 'its template, https://repo.metadatacenter.org/templates/e26d7ff6-3a92-4445-85e4-fb2648c62500, is in no corpus case',
};

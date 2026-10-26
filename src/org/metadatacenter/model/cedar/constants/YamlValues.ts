export class YamlValues {
  static id: string = 'id';
  static value: string = 'value';
  static iri: string = 'iri';
  static string: string = 'string';

  static Controlled = class {
    static class: string = 'class';
    static ontology: string = 'ontology';
    static valueSet: string = 'valueSet';
    static branch: string = 'branch';
    // BioPortal serves an ontology at this prefix followed by its acronym. The reader derives that
    // address for an ontology entry that states no `sourceUri`.
    static derivedOntologyAddressPrefix: string = 'https://data.bioontology.org/ontologies/';
    // A BioPortal ontology address, over http or https, at data.bioontology.org or
    // bioportal.bioontology.org. The one group is the acronym the address names. The writer leaves out
    // such an address for the entry's own acronym, and states an address outside BioPortal.
    static bioPortalOntologyAddress: RegExp = /^https?:\/\/(?:data|bioportal)\.bioontology\.org\/ontologies\/([^/]+)$/;
  };
}

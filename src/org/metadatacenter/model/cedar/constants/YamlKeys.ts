export class YamlKeys {
  static id: string = 'id';
  static type: string = 'type';
  static name: string = 'name';
  static description: string = 'description';
  static modelVersion: string = 'modelVersion';
  static status: string = 'status';
  static version: string = 'version';

  static label: string = 'label';
  static altLabel: string = 'altLabel';

  static inputType: string = 'inputType';
  static datatype: string = 'datatype';
  static valueRecommendationEnabled: string = 'valueRecommendationEnabled';

  static required: string = 'required';

  static default: string = 'default';
  static minLength: string = 'minLength';
  static maxLength: string = 'maxLength';
  static regex: string = 'regex';

  static identifier: string = 'identifier';

  static derivedFrom: string = 'derivedFrom';
  static createdOn: string = 'createdOn';
  static createdBy: string = 'createdBy';
  static lastUpdatedOn: string = 'lastUpdatedOn';
  static modifiedBy: string = 'modifiedBy';

  static annotations: string = 'annotations';
  static value: string = 'value';

  static granularity: string = 'granularity';
  static timeZone: string = 'timeZone';
  static timeFormat: string = 'timeFormat';

  static header: string = 'header';
  static footer: string = 'footer';

  static children: string = 'children';

  static multiple: string = 'multiple';
  static minItems: string = 'minItems';
  static maxItems: string = 'maxItems';

  static content: string = 'content';
  static height: string = 'height';
  static width: string = 'width';

  static key: string = 'key';

  static minValue: string = 'minValue';
  static maxValue: string = 'maxValue';
  static decimalPlace: string = 'decimalPlace';
  static unit: string = 'unit';

  static multipleChoice: string = 'multipleChoice';

  static values: string = 'values';
  static selected: string = 'selected';

  static actions: string = 'actions';
  static action: string = 'action';

  static Controlled = class {
    static label: string = 'label';
    static acronym: string = 'acronym';
    static ontologyName: string = 'ontologyName';
    static iri: string = 'iri';
    static numTerms: string = 'numTerms';
    static termType: string = 'termType';
    static termLabel: string = 'termLabel';
    static maxDepth: string = 'maxDepth';
    static valueSetName: string = 'valueSetName';

    static to: string = 'to';
    static termIri: string = 'termIri';
    static sourceIri: string = 'sourceIri';
    static sourceAcronym: string = 'sourceAcronym';
  };
}

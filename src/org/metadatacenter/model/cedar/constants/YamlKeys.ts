export class YamlKeys {
  static id: string = 'id';
  static type: string = 'type';
  static name: string = 'name';
  static description: string = 'description';
  static modelVersion: string = 'modelVersion';
  static status: string = 'status';
  static version: string = 'version';

  static language: string = 'language';

  static label: string = 'label';
  static prefLabel: string = 'prefLabel';
  static altLabels: string = 'altLabels';

  static datatype: string = 'datatype';
  static valueRecommendation: string = 'valueRecommendation';

  static required: string = 'required';
  static recommended: string = 'recommended';
  static hidden: string = 'hidden';
  static continuePreviousLine = 'continuePreviousLine';
  static propertyIri: string = 'propertyIri';
  static overrideLabel: string = 'overrideLabel';
  static overrideDescription: string = 'overrideDescription';

  static default: string = 'default';
  static minLength: string = 'minLength';
  static maxLength: string = 'maxLength';
  static regex: string = 'regex';

  static identifier: string = 'identifier';

  static derivedFrom: string = 'derivedFrom';
  static previousVersion: string = 'previousVersion';
  static createdOn: string = 'createdOn';
  static createdBy: string = 'createdBy';
  static modifiedOn: string = 'modifiedOn';
  static modifiedBy: string = 'modifiedBy';
  static isBasedOn: string = 'isBasedOn';

  static annotations: string = 'annotations';
  static value: string = 'value';

  static granularity: string = 'granularity';
  static inputTimeZone: string = 'inputTimeZone';
  static inputTimeFormat: string = 'inputTimeFormat';

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
  static decimalPlaces: string = 'decimalPlaces';
  static unit: string = 'unit';

  static multipleChoice: string = 'multipleChoice';

  static values: string = 'values';
  static selected: string = 'selected';

  static actions: string = 'actions';
  static action: string = 'action';

  static configuration: string = 'configuration';

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

  static nullEnabled: string = 'nullEnabled';
  static trueLabel: string = 'trueLabel';
  static falseLabel: string = 'falseLabel';
  static nullLabel: string = 'nullLabel';
}

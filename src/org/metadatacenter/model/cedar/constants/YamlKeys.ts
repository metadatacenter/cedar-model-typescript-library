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
    // A value-constraint entry names a vocabulary and a term within it, and the two groups of keys say
    // which: `source*` is the vocabulary, `term*` the term or branch. The keys were once a mix of
    // `acronym`, `ontologyName`, `iri` and `valueSetName`, where `iri` identified a different thing in
    // each of the four entry kinds and no key said which vocabulary system served it.
    static sourceSystem: string = 'sourceSystem';
    static sourceAcronym: string = 'sourceAcronym';
    static sourceName: string = 'sourceName';
    static sourceIri: string = 'sourceIri';
    static termIri: string = 'termIri';
    static termType: string = 'termType';
    static termLabel: string = 'termLabel';
    static termBaseIri: string = 'termBaseIri';
    static termBaseLabel: string = 'termBaseLabel';
    static termMaxDepth: string = 'termMaxDepth';
    static termCount: string = 'termCount';

    // The version triple, nested under `version`. Absent means the entry resolves against the latest
    // snapshot of its source.
    static versionId: string = 'id';
    static versionEffectiveDate: string = 'effectiveDate';
    static versionDeclaredVersion: string = 'declaredVersion';

    static to: string = 'to';
  };

  static nullEnabled: string = 'nullEnabled';
  // A boolean field's labels are a block keyed by the value they label, as the JSON nests them and as
  // the Java library writes them. They were three flat keys here, which neither of the other two
  // recognised, so the labels were lost whenever a document crossed between them.
  static labels: string = 'labels';
  static trueLabel: string = 'true';
  static falseLabel: string = 'false';
  static nullLabel: string = 'null';
}

export class CedarModel {
  static ui = '_ui';
  static schema = '$schema';
  static order = 'order';
  static inputType = 'inputType';
  static type = 'type';
  static items = 'items';
  static valueConstraints = '_valueConstraints';
  static requiredValue = 'requiredValue';
  static defaultValue = 'defaultValue';
  static minItems = 'minItems';
  static maxItems = 'maxItems';
  static minLength = 'minLength';
  static maxLength = 'maxLength';
  static numberType = 'numberType';
  static temporalType = 'temporalType';
  static temporalGranularity = 'temporalGranularity';
  static timezoneEnabled = 'timezoneEnabled';
  static inputTimeFormat = 'inputTimeFormat';
  static unitOfMeasure = 'unitOfMeasure';
  static minValue = 'minValue';
  static maxValue = 'maxValue';
  static decimalPlace = 'decimalPlace';
  static content = '_content';
  static size = '_size';
  static width = 'width';
  static height = 'height';
  static regex = 'regex';
  static pages = 'pages';
  static header = 'header';
  static footer = 'footer';

  static ontologies = 'ontologies';
  static valueSets = 'valueSets';
  static classes = 'classes';
  static branches = 'branches';
  static actions = 'actions';

  static multipleChoice = 'multipleChoice';
  static literals = 'literals';
  static label = 'label';
  static selectedByDefault = 'selectedByDefault';

  static propertyDescriptions = 'propertyDescriptions';
  static propertyLabels = 'propertyLabels';

  static skosPrefLabel = 'skos:prefLabel';
  static skosAltLabel = 'skos:altLabel';
  static skosNotation = 'skos:notation';

  static format = 'format';
  static enum = 'enum';

  static annotations = '_annotations';

  // static baseTemplateURL = 'https://schema.metadatacenter.org';
  // static templateFieldType = CedarModel.baseTemplateURL + '/core/TemplateField';
  // static templateElementType = CedarModel.baseTemplateURL + '/core/TemplateElement';
  // static templateStaticFieldType = CedarModel.baseTemplateURL + '/core/StaticTemplateField';

  static ValueConstraints = class {
    static acronym = 'acronym';
    static name = 'name';
    static uri = 'uri';
    static numTerms: string = 'numTerms';

    static label = 'label';
    static source = 'source';
    static type = 'type';
    static termType = 'termType';
    static prefLabel: string = 'prefLabel';

    static maxDepth: string = 'maxDepth';

    static vsCollection: string = 'vsCollection';

    static termUri: string = 'termUri';
    static sourceUri: string = 'sourceUri';

    static action: string = 'action';
    static to: string = 'to';

    static recommendedValue = 'recommendedValue';
  };

  static Ui = class {
    static hidden = 'hidden';
    static continuePreviousLine = 'continuePreviousLine';
    static valueRecommendationEnabled = 'valueRecommendationEnabled';
  };

  static nullEnabled = 'nullEnabled';
  static trueLabel = 'true';
  static falseLabel = 'false';
  static nullLabel = 'null';
  static labels = 'labels';
}

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

  /**
   * The IRI prefix a child property is addressed by in an instance's `@context`.
   *
   * Was commented out here while the same string stayed hardcoded in
   * `ContainerArtifactChildrenInfo.getChildIriMap`, which mints one for any child
   * whose template declares none — so the prefix existed twice, once as a literal
   * and once as a comment. CEE mints the same shape for a newly named
   * attribute-value property and had its own copy of the constant to do it.
   *
   * One definition, used by both.
   */
  static propertyIriPrefix = 'https://schema.metadatacenter.org/properties/';

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

    // The source-explicit keys. All optional, and a constraint written before they existed carries
    // none of them: `iri` is the source ontology's canonical identity, `sourceSystem` names the system
    // serving it, and `version` pins one snapshot.
    static iri: string = 'iri';
    static sourceSystem: string = 'sourceSystem';
    static version: string = 'version';
    static versionId: string = 'id';
    static versionEffectiveDate: string = 'effectiveDate';
    static versionDeclaredVersion: string = 'declaredVersion';

    static action: string = 'action';
    static to: string = 'to';

    static recommendedValue = 'recommendedValue';
  };

  static Ui = class {
    static hidden = 'hidden';
    static continuePreviousLine = 'continuePreviousLine';
    static valueRecommendationEnabled = 'valueRecommendationEnabled';
  };
}

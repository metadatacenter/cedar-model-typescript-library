export class JsonSchema {
  // special properties used to add attribute-value fields to the model
  static reservedAttributeName = '__reserved__attribute_name';
  static reservedAttributeValue = '__reserved__attribute_value';
  static reservedDefaultAttributeName = 'Attribute Value Field';

  static properties = 'properties';
  static required = 'required';

  static atContext = '@context';
  static atId = '@id';
  static atType = '@type';
  static atValue = '@value';
  static schemaIsBasedOn = 'schema:isBasedOn';
  static schemaName = 'schema:name';
  static schemaDescription = 'schema:description';
  static schemaVersion = 'schema:schemaVersion';
  static pavDerivedFrom = 'pav:derivedFrom';
  static pavCreatedOn = 'pav:createdOn';
  static pavCreatedBy = 'pav:createdBy';
  static pavLastUpdatedOn = 'pav:lastUpdatedOn';
  static oslcModifiedBy = 'oslc:modifiedBy';
  static pavVersion = 'pav:version';
  static biboStatus = 'bibo:status';
  static rdfsLabel = 'rdfs:label';
  static termUri = 'termUri';
  static enum = 'enum';

  static builtInProperties: Map<string, boolean> = new Map([
    [JsonSchema.atId, true],
    [JsonSchema.atContext, true],
    [JsonSchema.atType, true],
    [JsonSchema.schemaIsBasedOn, true],
    [JsonSchema.schemaName, true],
    [JsonSchema.schemaDescription, true],
    [JsonSchema.pavDerivedFrom, true],
    [JsonSchema.pavCreatedOn, true],
    [JsonSchema.pavCreatedBy, true],
    [JsonSchema.pavLastUpdatedOn, true],
    [JsonSchema.oslcModifiedBy, true],
  ]);
}

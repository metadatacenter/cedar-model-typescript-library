export class JsonSchema {
  static properties: string = 'properties';
  static required: string = 'required';

  static atContext: string = '@context';
  static atId: string = '@id';
  static atType: string = '@type';
  static atValue: string = '@value';
  static atLanguage: string = '@language';
  static schemaIsBasedOn: string = 'schema:isBasedOn';
  static schemaName: string = 'schema:name';
  static schemaDescription: string = 'schema:description';
  static schemaVersion: string = 'schema:schemaVersion';
  static schemaIdentifier: string = 'schema:identifier';
  static pavDerivedFrom: string = 'pav:derivedFrom';
  static pavCreatedOn: string = 'pav:createdOn';
  static pavCreatedBy: string = 'pav:createdBy';
  static pavLastUpdatedOn: string = 'pav:lastUpdatedOn';
  static oslcModifiedBy: string = 'oslc:modifiedBy';
  static pavVersion: string = 'pav:version';
  static biboStatus: string = 'bibo:status';
  static rdfsLabel: string = 'rdfs:label';
  static termUri: string = 'termUri';
  static enum: string = 'enum';
  static oneOf: string = 'oneOf';
  static type: string = 'type';
  static items: string = 'items';

  // special properties used to add attribute-value fields to the model
  static reservedAttributeName: string = '__reserved__attribute_name';
  static reservedAttributeValue: string = '__reserved__attribute_value';
  static reservedDefaultAttributeName: string = 'Attribute Value Field';
}

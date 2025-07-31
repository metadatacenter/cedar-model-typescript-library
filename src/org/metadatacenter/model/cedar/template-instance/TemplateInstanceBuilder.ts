import { AbstractArtifactBuilder } from '../AbstractArtifacBuilder';
import { TemplateInstance } from './TemplateInstance';
import { InstanceDataContainer } from './InstanceDataContainer';
import { InstanceDataAtomType } from './InstanceDataAtomType';
import { CedarArtifactId } from '../types/cedar-types/CedarArtifactId';

export class TemplateInstanceBuilder extends AbstractArtifactBuilder {
  private schema_isBasedOn: CedarArtifactId = CedarArtifactId.NULL;
  private dataContainer: InstanceDataContainer = new InstanceDataContainer();

  public withSchemaIsBasedOn(schema_isBasedOn: CedarArtifactId | string): TemplateInstanceBuilder {
    if (schema_isBasedOn instanceof CedarArtifactId) {
      this.schema_isBasedOn = schema_isBasedOn;
    } else {
      this.schema_isBasedOn = CedarArtifactId.forValue(schema_isBasedOn);
    }
    return this;
  }

  public withDataValue(key: string, value: InstanceDataAtomType): TemplateInstanceBuilder {
    this.dataContainer.setValue(key, value);
    return this;
  }

  public withDataIri(key: string, iri: string): TemplateInstanceBuilder {
    this.dataContainer.setIri(key, iri);
    return this;
  }

  public withDataId(id: string | null): TemplateInstanceBuilder {
    this.dataContainer.id = id;
    return this;
  }

  public withDataContainer(dataContainer: InstanceDataContainer): TemplateInstanceBuilder {
    this.dataContainer = dataContainer;
    return this;
  }

  public build(): TemplateInstance {
    const templateInstance: TemplateInstance = TemplateInstance.buildEmptyWithNullValues();
    
    // Set properties from AbstractArtifact
    templateInstance.at_id = this.at_id;
    templateInstance.pav_createdOn = this.pav_createdOn;
    templateInstance.pav_createdBy = this.pav_createdBy;
    templateInstance.pav_lastUpdatedOn = this.pav_lastUpdatedOn;
    templateInstance.oslc_modifiedBy = this.oslc_modifiedBy;
    templateInstance.pav_derivedFrom = this.pav_derivedFrom;
    templateInstance.schema_name = this.schema_name;
    templateInstance.schema_description = this.schema_description;

    // Set TemplateInstance specific properties
    templateInstance.schema_isBasedOn = this.schema_isBasedOn;
    templateInstance.dataContainer = this.dataContainer;

    return templateInstance;
  }
} 
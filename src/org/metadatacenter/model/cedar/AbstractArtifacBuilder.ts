import { CedarDate } from './types/beans/CedarDate';
import { CedarUser } from './types/beans/CedarUser';
import { PavVersion } from './types/beans/PavVersion';
import { BiboStatus } from './types/beans/BiboStatus';
import { CedarArtifactId } from './types/beans/CedarArtifactId';
import { SchemaVersion } from './types/beans/SchemaVersion';
import { CedarAbstractArtifact } from './CedarAbstractArtifact';

export abstract class AbstractArtifactBuilder {
  protected at_id: CedarArtifactId = CedarArtifactId.NULL;
  protected title: string | null = null;
  protected description: string | null = null;
  protected schema_schemaVersion: SchemaVersion = SchemaVersion.CURRENT;
  // provenance
  protected pav_createdOn: CedarDate | null = CedarDate.forValue(null);
  protected pav_createdBy: CedarUser = CedarUser.forValue(null);
  protected pav_lastUpdatedOn: CedarDate | null = CedarDate.forValue(null);
  protected oslc_modifiedBy: CedarUser = CedarUser.forValue(null);
  // status and version
  protected pav_version: PavVersion = PavVersion.DEFAULT;
  protected bibo_status: BiboStatus = BiboStatus.DRAFT;
  // schema name and description
  protected schema_name: string | null = null;
  protected schema_description: string | null = null;

  withAtId(at_id: CedarArtifactId | string): this {
    if (at_id instanceof CedarArtifactId) {
      this.at_id = at_id;
    } else {
      this.at_id = CedarArtifactId.forValue(at_id);
    }
    return this;
  }

  withTitle(title: string | null): this {
    this.title = title;
    return this;
  }

  withDescription(description: string | null): this {
    this.description = description;
    return this;
  }

  withSchemaVersion(schema_schemaVersion: SchemaVersion): this {
    this.schema_schemaVersion = schema_schemaVersion;
    return this;
  }

  withCreatedOn(createdOn: CedarDate | string): this {
    if (createdOn instanceof CedarDate) {
      this.pav_createdOn = createdOn;
    } else {
      this.pav_createdOn = CedarDate.forValue(createdOn);
    }
    return this;
  }

  withCreatedBy(createdBy: CedarUser | string): this {
    if (createdBy instanceof CedarUser) {
      this.pav_createdBy = createdBy;
    } else {
      this.pav_createdBy = CedarUser.forValue(createdBy);
    }
    return this;
  }

  withLastUpdatedOn(lastUpdatedOn: CedarDate | string): this {
    if (lastUpdatedOn instanceof CedarDate) {
      this.pav_lastUpdatedOn = lastUpdatedOn;
    } else {
      this.pav_lastUpdatedOn = CedarDate.forValue(lastUpdatedOn);
    }
    return this;
  }

  withModifiedBy(modifiedBy: CedarUser | string): this {
    if (modifiedBy instanceof CedarUser) {
      this.oslc_modifiedBy = modifiedBy;
    } else {
      this.oslc_modifiedBy = CedarUser.forValue(modifiedBy);
    }
    return this;
  }

  withVersion(version: PavVersion | string): this {
    if (version instanceof PavVersion) {
      this.pav_version = version;
    } else {
      this.pav_version = PavVersion.forValue(version);
    }
    return this;
  }

  withBiboStatus(bibo_status: BiboStatus | string): this {
    if (bibo_status instanceof BiboStatus) {
      this.bibo_status = bibo_status;
    } else {
      this.bibo_status = BiboStatus.forValue(bibo_status);
    }
    return this;
  }

  withSchemaName(schema_name: string | null): this {
    this.schema_name = schema_name;
    return this;
  }

  withSchemaDescription(schema_description: string | null): this {
    this.schema_description = schema_description;
    return this;
  }

  protected buildInternal(artifact: CedarAbstractArtifact): void {
    artifact.at_id = this.at_id;
    artifact.title = this.title;
    artifact.description = this.description;
    artifact.schema_schemaVersion = this.schema_schemaVersion;

    artifact.pav_createdOn = this.pav_createdOn;
    artifact.pav_createdBy = this.pav_createdBy;
    artifact.pav_lastUpdatedOn = this.pav_lastUpdatedOn;
    artifact.oslc_modifiedBy = this.oslc_modifiedBy;

    artifact.pav_version = this.pav_version;
    artifact.bibo_status = this.bibo_status;

    artifact.schema_name = this.schema_name;
    artifact.schema_description = this.schema_description;
  }
}
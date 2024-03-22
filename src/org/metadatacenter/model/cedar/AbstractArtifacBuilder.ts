import { ISODate } from './types/wrapped-types/ISODate';
import { CedarUser } from './types/cedar-types/CedarUser';
import { PavVersion } from './types/wrapped-types/PavVersion';
import { BiboStatus } from './types/wrapped-types/BiboStatus';
import { CedarArtifactId } from './types/cedar-types/CedarArtifactId';
import { SchemaVersion } from './types/wrapped-types/SchemaVersion';
import { AbstractArtifact } from './AbstractArtifact';

export abstract class AbstractArtifactBuilder {
  protected at_id: CedarArtifactId = CedarArtifactId.NULL;
  protected title: string | null = null;
  protected description: string | null = null;
  protected schema_schemaVersion: SchemaVersion = SchemaVersion.CURRENT;
  // provenance
  protected pav_createdOn: ISODate | null = ISODate.forValue(null);
  protected pav_createdBy: CedarUser = CedarUser.forValue(null);
  protected pav_lastUpdatedOn: ISODate | null = ISODate.forValue(null);
  protected oslc_modifiedBy: CedarUser = CedarUser.forValue(null);
  // status and version
  protected pav_version: PavVersion = PavVersion.DEFAULT;
  protected bibo_status: BiboStatus = BiboStatus.DRAFT;
  // schema name and description
  protected schema_name: string | null = null;
  protected schema_description: string | null = null;
  protected schema_identifier: string | null = null;
  //
  protected pav_derivedFrom: CedarArtifactId = CedarArtifactId.NULL;

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

  withCreatedOn(createdOn: ISODate | string): this {
    if (createdOn instanceof ISODate) {
      this.pav_createdOn = createdOn;
    } else {
      this.pav_createdOn = ISODate.forValue(createdOn);
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

  withLastUpdatedOn(lastUpdatedOn: ISODate | string): this {
    if (lastUpdatedOn instanceof ISODate) {
      this.pav_lastUpdatedOn = lastUpdatedOn;
    } else {
      this.pav_lastUpdatedOn = ISODate.forValue(lastUpdatedOn);
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

  withDerivedFrom(pav_derivedFrom: CedarArtifactId): this {
    this.pav_derivedFrom = pav_derivedFrom;
    return this;
  }

  public withSchemaIdentifier(schema_identifier: string): this {
    this.schema_identifier = schema_identifier;
    return this;
  }

  protected buildInternal(artifact: AbstractArtifact): void {
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
    artifact.schema_identifier = this.schema_identifier;

    artifact.pav_derivedFrom = this.pav_derivedFrom;
  }
}

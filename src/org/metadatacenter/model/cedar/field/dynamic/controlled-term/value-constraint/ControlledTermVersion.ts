/**
 * The version triple that pins a value-constraint entry to one vocabulary snapshot.
 *
 * `id` is the snapshot's content hash and the only part resolution reads: taken with the source
 * ontology's canonical identity it names one exact snapshot. `effectiveDate` and `declaredVersion`
 * are labels for people — when the snapshot entered circulation, and whatever version string the
 * source declared for itself, which is neither guaranteed present nor unique.
 *
 * An entry with no version resolves against the latest snapshot the terminology server serves.
 */
export class ControlledTermVersion {
  private readonly _id: string;
  private readonly _effectiveDate: string | null;
  private readonly _declaredVersion: string | null;

  constructor(id: string, effectiveDate: string | null = null, declaredVersion: string | null = null) {
    this._id = id;
    this._effectiveDate = effectiveDate;
    this._declaredVersion = declaredVersion;
  }

  get id(): string {
    return this._id;
  }

  get effectiveDate(): string | null {
    return this._effectiveDate;
  }

  get declaredVersion(): string | null {
    return this._declaredVersion;
  }
}

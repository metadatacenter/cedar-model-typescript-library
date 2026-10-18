import { JavaStrings } from '../../../../util/JavaStrings';

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

  /**
   * A pin must identify a snapshot, so an empty or blank `id` is refused, as Java's `VersionSpec`
   * refuses it. Blank is Java's `String.isBlank`. Both readers refuse such an id before they construct
   * a version, and their message gives the id's path, so only a version a caller builds itself reaches
   * this check. Without it, every writer would write such a version as a pin that neither library
   * reads.
   */
  constructor(id: string, effectiveDate: string | null = null, declaredVersion: string | null = null) {
    if (typeof id !== 'string' || id === '') {
      throw new Error('A pinned version requires an id. A version with no id identifies no snapshot.');
    }
    if (JavaStrings.isBlank(id)) {
      throw new Error("A pinned version's id must not be blank. An id made only of whitespace identifies no snapshot.");
    }
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

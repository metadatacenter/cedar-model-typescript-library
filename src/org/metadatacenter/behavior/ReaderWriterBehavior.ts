export abstract class ReaderWriterBehavior {
  private readonly _useWarningForKnownIssues: boolean;

  protected constructor(useWarningForKnownIssues: boolean) {
    this._useWarningForKnownIssues = useWarningForKnownIssues;
  }

  public useWarningForKnownIssues(): boolean {
    return this._useWarningForKnownIssues;
  }
}

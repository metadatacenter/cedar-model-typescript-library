import { ValueConstraints } from '../../ValueConstraints';

export class ValueConstraintsBooleanField extends ValueConstraints {
  public defaultValue: boolean | null | undefined = undefined;
  public nullEnabled: boolean | null = false;
  public trueLabel: string | null = null;
  public falseLabel: string | null = null;
  public nullLabel: string | null = null;

  public constructor() {
    super();
  }
}

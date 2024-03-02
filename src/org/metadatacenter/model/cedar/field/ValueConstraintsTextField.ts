import { ValueConstraints } from './ValueConstraints';

export class ValueConstraintsTextField extends ValueConstraints {
  public defaultValue: string | null = null;
  public minLength: number | null = null;
  public maxLength: number | null = null;
  public regex: string | null = null;

  public constructor() {
    super();
  }
}

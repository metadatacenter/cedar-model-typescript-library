import { ValueConstraintsLiteralField } from '../../ValueConstraintsLiteralField';

export class ValueConstraintsTextField extends ValueConstraintsLiteralField {
  public minLength: number | null = null;
  public maxLength: number | null = null;
  public regex: string | null = null;

  public constructor() {
    super();
  }
}

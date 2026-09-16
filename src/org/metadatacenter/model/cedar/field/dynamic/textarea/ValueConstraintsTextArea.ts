import { ValueConstraintsLiteralField } from '../../ValueConstraintsLiteralField';

/** Paragraph length constraints follow Java TextAreaField; regex is not a builder option. */
export class ValueConstraintsTextArea extends ValueConstraintsLiteralField {
  public minLength: number | null = null;
  public maxLength: number | null = null;

  public constructor() {
    super();
  }
}

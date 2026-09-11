import { ValueConstraintsLiteralField } from '../../ValueConstraintsLiteralField';

/**
 * A paragraph constrains its values exactly as the shared literal default does
 * and adds nothing of its own. The class exists because `TextArea` names its own
 * constraint type, so a member added here later lands on paragraphs alone.
 */
export class ValueConstraintsTextArea extends ValueConstraintsLiteralField {
  public constructor() {
    super();
  }
}

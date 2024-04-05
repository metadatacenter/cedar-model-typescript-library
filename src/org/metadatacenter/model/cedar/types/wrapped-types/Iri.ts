export class Iri {
  private readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }

  static empty(): Iri {
    return new Iri('');
  }
}

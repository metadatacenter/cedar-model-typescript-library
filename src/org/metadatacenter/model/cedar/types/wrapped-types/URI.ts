export class URI {
  private readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }

  static empty(): URI {
    return new URI('');
  }
}

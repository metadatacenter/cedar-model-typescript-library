import { Annotation } from './Annotation';

export class AnnotationAtId implements Annotation {
  private readonly name: string;
  private readonly id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }

  getName(): string {
    return this.name;
  }

  getAtId() {
    return this.id;
  }
}

import { Annotation } from './Annotation';

export class AnnotationAtId implements Annotation {
  private name: string;
  private id: string;

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

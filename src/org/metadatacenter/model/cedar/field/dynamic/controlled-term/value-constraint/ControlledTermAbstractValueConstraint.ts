import { ValueConstraints } from '../../../ValueConstraints';

interface ClassWithClassName {
  className: string;
}
export abstract class ControlledTermAbstractValueConstraint extends ValueConstraints implements ClassWithClassName {
  className = 'ControlledTermAbstractValueConstraint';
}

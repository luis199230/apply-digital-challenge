import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPriceMinLessThanPriceMax', async: false })
export class IsPriceMinLessThanPriceMax
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const object = args.object as {
      priceMin: number;
      priceMax: number;
    };
    return object.priceMin < object.priceMax;
  }

  defaultMessage(args: ValidationArguments): string {
    let reference = '';
    let comparation = '';
    if (args.property === 'priceMin') {
      reference = 'priceMax';
      comparation = 'less';
    }
    if (args.property === 'priceMax') {
      reference = 'priceMin';
      comparation = 'greater';
    }
    return `${args.property} should be ${comparation} than ${reference}`;
  }
}

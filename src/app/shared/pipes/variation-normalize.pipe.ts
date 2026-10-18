import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'variationNormalize',
  standalone: true,
  pure: true
})
export class VariationNormalizePipe implements PipeTransform {
  transform(variationOption: any[], option?: string): any {
    if (variationOption) {
      return variationOption.map(m => {
        return `${m.name} : ${m.value} `
      }).join(', ')
    } else {
      return 'N/A';
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unique'
})
export class UniquePipe implements PipeTransform {

  transform(value: any[], key: string): any[] {
    return value.filter((v, i, a) => a.findIndex(t => t[key] === v[key]) === i);
  }

}

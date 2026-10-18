import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'slice'
})
export class SlicePipe implements PipeTransform {

  transform(value: any[], startPoint?:number,endPoint?:number): any{

    if(value){
      if(startPoint && endPoint){
        return value.slice(startPoint,endPoint);
       }else if(startPoint && !endPoint){
            return value.slice(startPoint);
       }else if(!startPoint && endPoint){
           return value.slice(0,endPoint);
       }
    }
  }

}

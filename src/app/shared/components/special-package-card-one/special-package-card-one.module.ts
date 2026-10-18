import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SpecialPackageCardOneComponent} from "./special-package-card-one.component";
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SpecialPackageCardOneComponent
  ],
  declarations: [],
  exports:[
    SpecialPackageCardOneComponent
  ]
})
export class SpecialPackageCardOneModule { }

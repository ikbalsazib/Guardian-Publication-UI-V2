import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosterCardTwoComponent } from './poster-card-two.component';
import {RouterLink} from "@angular/router";
import {PipesModule} from "../../pipes/pipes.module";

@NgModule({
  imports: [
    CommonModule,
    RouterLink,
    PipesModule,
    PosterCardTwoComponent
  ],
  declarations: [],
  exports:[
    PosterCardTwoComponent
  ]
})
export class PosterCardTwoModule { }

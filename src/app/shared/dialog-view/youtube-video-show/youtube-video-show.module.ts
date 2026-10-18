import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YoutubeVideoShowComponent } from './youtube-video-show.component';
import {MatButtonModule} from '@angular/material/button';
import {MaterialModule} from "../../../material/material.module";
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MaterialModule,
    YoutubeVideoShowComponent
  ],
  exports: [YoutubeVideoShowComponent]
})
export class YoutubeVideoShowModule { }

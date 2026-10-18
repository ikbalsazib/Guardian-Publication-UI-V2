import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HtmlEditorComponent } from './html-editor.component';
import { DropdownModule } from '../dropdown/dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    HtmlEditorComponent
  ],
  declarations: [],
  exports: [
    HtmlEditorComponent
  ]
})
export class HtmlEditorModule { }

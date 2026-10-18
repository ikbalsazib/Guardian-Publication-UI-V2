import { Component, EventEmitter, Output } from '@angular/core';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drop-zone',
  templateUrl: './drop-zone.component.html',
  styleUrls: ['./drop-zone.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgxDropzoneModule
  ]
})
export class DropZoneComponent {

  @Output() newItemEvent = new EventEmitter();
  files: File[] = [];


  constructor(
  ) { }


  /**
   * IMAGE DRUG & DROP
   * onSelect()
   * onRemove()
  */
  onSelect(event: any) {
    if (event) {
      this.files.push(...event.addedFiles);
      this.newItemEvent.emit(this.files);
    }
  }

  onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
  }

}


import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCroppedEvent, ImageCropperComponent, base64ToFile } from 'ngx-image-cropper';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ImageCropperComponent,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class ImageCropComponent implements OnInit {

  @ViewChild(ImageCropperComponent) imageCropper?: ImageCropperComponent;

  isLoaded = false;
  loadFailed = false;
  imageFile: File | null = null;
  croppedImage: string | null = null;
  imgBlob: Blob | null = null;

  constructor(
    public dialogRef: MatDialogRef<ImageCropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: File | Event | null
  ) {
  }

  ngOnInit(): void {
    if (this.data instanceof File) {
      this.imageFile = this.data;
      return;
    }

    const event = this.data as Event | null;
    const file = (event?.target as HTMLInputElement | null)?.files?.[0];
    if (file) {
      this.imageFile = file;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.applyCropResult(event);
  }

  private applyCropResult(event: ImageCroppedEvent) {
    if (event.blob) {
      this.imgBlob = event.blob;
      this.croppedImage = event.objectUrl ?? event.base64 ?? this.croppedImage;
      return;
    }

    if (event.base64) {
      this.croppedImage = event.base64;
      this.imgBlob = base64ToFile(event.base64);
    }
  }

  loadImageFailed() {
    this.isLoaded = true;
    this.loadFailed = true;
  }

  cropperReady() {
    this.isLoaded = true;
    this.loadFailed = false;
  }

  onCloseDialogue() {
    this.dialogRef.close();
  }

  async onSaveImage() {
    if (!this.imgBlob && this.imageCropper) {
      const result = await this.imageCropper.crop('blob');
      if (result) {
        this.applyCropResult(result);
      }
    }

    this.dialogRef.close({
      imgBlob: this.imgBlob,
      croppedImage: this.croppedImage
    });
  }
}

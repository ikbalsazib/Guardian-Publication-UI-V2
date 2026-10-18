import { CommonModule } from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-youtube-video-show',
  templateUrl: './youtube-video-show.component.html',
  styleUrls: ['./youtube-video-show.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule]
})
export class YoutubeVideoShowComponent implements OnInit {

  safeURL: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<YoutubeVideoShowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {url: string}
  ) {
    this.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(data.url);
  }

  ngOnInit(): void {
  }

  /**
   * ON CLOSE DIALOG
   * onClose()
   */
  onClose() {
    this.dialogRef.close()
  }

}

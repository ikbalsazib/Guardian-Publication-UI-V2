import { Component, ElementRef, inject, Inject, OnInit, ViewChild, PLATFORM_ID } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiService } from '../../../../services/core/ui.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule]
})
export class SocialShareComponent implements OnInit {
  @ViewChild('scroll', { static: false }) scrollElement!: ElementRef;
  public scrollValue = 0;
  url: string = " ";
  navUrl: any;

  // Dependencies
  private uiService = inject(UiService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.isBrowser) {
      this.url = window.location.protocol + '//' + window.location.host + window.location.pathname;
    }
  }

  public nextSlide() {
    let scrollEl = this.scrollElement.nativeElement as HTMLElement;
    if (this.scrollValue < 480) {
      this.scrollValue += 90;
    }
    scrollEl.scrollLeft = this.scrollValue;
  }

  public prevSlide() {
    let scrollEl = this.scrollElement.nativeElement as HTMLElement;
    if (this.scrollValue > 0) {
      this.scrollValue -= 90;
    }
    scrollEl.scrollLeft = this.scrollValue;
  }

  public onCopy(url: string) {
    if (url) {
      window.navigator.clipboard.writeText(url).then(() => {
        this.uiService.success('Link Successfully Copied');
      })
    }
  }

  createNavigationUrl(type: any) {
    let encodeUrl = encodeURIComponent(this.url);
    switch (type) {
      case 'facebook':
        this.navUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeUrl;
        break;
      case 'twitter':
        this.navUrl = 'https://twitter.com/share?url=' + encodeUrl;
        break;
      case 'instagram':
        this.navUrl = 'https://www.instagram.com/sharer/sharer.php?u=' + encodeUrl;
        break;
      case 'whatsapp':
        this.navUrl = 'https://web.whatsapp.com/send?text=' + encodeUrl;
        break;
      case 'linkedin':
        this.navUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeUrl;
        break;
      case 'pinterest':
        this.navUrl = 'https://www.pinterest.com/pin/create/button/?url=' + encodeUrl;
        break;
    }
    return window.open(this.navUrl, '_blank');
  }

  shareProductByEmail(title: string, url: any) {
    var subject = encodeURIComponent("Check out this Product: " + title);
    var body = encodeURIComponent("Hey,\n\nI found this interesting Product and thought you might like it:\n\n" + url);
    var mailtoLink = "mailto:?subject=" + subject + "&body=" + body;
    window.open(mailtoLink);
  }
}

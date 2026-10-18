import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CanonicalService {

  constructor(
    @Inject(DOCUMENT) private dom: Document
  ) {
  }

  setCanonicalURL(url?: string) {
    const baseDomain = 'https://www.guardianpubs.com';
    let canURL: string;

    if (url) {
      canURL = url.startsWith('http') ? url : `${baseDomain}${url.startsWith('/') ? '' : '/'}${url}`;
    } else {
      // Fallback: try to get URL from document
      try {
        canURL = this.dom.location.href || baseDomain;
      } catch (e) {
        canURL = baseDomain;
      }
    }

    // Ensure the URL uses the www version if it doesn't already
    if (canURL.includes('guardianpubs.com') && !canURL.includes('www.guardianpubs.com')) {
      canURL = canURL.replace('guardianpubs.com', 'www.guardianpubs.com');
    }

    // Remove existing canonical link
    const existingLink = this.dom.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Create new canonical link
    const link: HTMLLinkElement = this.dom.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canURL);
    this.dom.head.appendChild(link);
  }


}

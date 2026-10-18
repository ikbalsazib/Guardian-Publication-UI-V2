import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SchemaGraph, SchemaNode } from './schema.types';
import { serializeJsonLd } from './utils/schema-serializer';

const JSON_LD_SCRIPT_ID = 'json-ld';

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  setGraph(nodes: SchemaNode[]): void {
    if (!nodes.length) {
      this.clearSchema();
      return;
    }

    const schema: SchemaGraph = {
      '@context': 'https://schema.org',
      '@graph': nodes,
    };

    this.injectSchema(schema);
  }

  clearSchema(): void {
    const existing = this.document.getElementById(JSON_LD_SCRIPT_ID);
    existing?.remove();
  }

  private injectSchema(schema: SchemaGraph): void {
    const serialized = serializeJsonLd(schema);
    const existing = this.document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null;

    if (existing) {
      existing.text = serialized;
      return;
    }

    const script = this.document.createElement('script');
    script.id = JSON_LD_SCRIPT_ID;
    script.type = 'application/ld+json';
    script.text = serialized;

    const head = this.document.getElementsByTagName('head')[0];
    if (head) {
      head.appendChild(script);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.document.head.appendChild(script);
    }
  }
}

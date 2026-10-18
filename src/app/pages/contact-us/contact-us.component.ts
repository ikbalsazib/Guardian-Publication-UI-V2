import { Component, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContactService } from '../../services/common/contact.service';
import { UiService } from '../../services/core/ui.service';
import { ShopInformationService } from '../../services/common/shop-information.service';
import { ShopInformation } from '../../interfaces/common/shop-information.interface';
import { SeoService } from '../../services/core/seo.service';


@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ContactUsComponent implements OnInit, OnDestroy {
  @ViewChild('formDirective') private formDirective!: NgForm;

  // Signals
  isSubmitting = signal<boolean>(false);
  shopInfo = signal<ShopInformation | null>(null);

  // Form
  contactForm!: FormGroup;

  // Dependencies
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private uiService = inject(UiService);
  private shopInfoService = inject(ShopInformationService);
  private seoService = inject(SeoService);
  private translateService = inject(TranslateService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initForm();
    this.updateSeoMeta();
    this.getShopInfo();
  }

  private updateSeoMeta() {
    this.seoService.updateMetaData({
      title: this.translateService.instant('ln.ContactTitle') || 'Contact Us',
      description: this.translateService.instant('ln.ContactDescription') || 'Contact address, official phone number and email address of Guardian Publications.',
      keywords: 'contact, Guardian Publications contact, Banglabazar, Dhaka',
      canonicalPath: '/contact-us',
    });
    this.seoService.setContactSchema(null, [
      { label: this.translateService.instant('ln.ContactUs') || 'Contact', isCurrent: true },
    ]);
  }

  private initForm() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phoneNo: ['', [Validators.required, Validators.pattern(/^(\+?8801|01)[0-9]{9}$/)]],
      address: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.uiService.warn(this.translateService.instant('ln.ProvideValidInfo'));
      return;
    }

    this.isSubmitting.set(true);
    const sub = this.contactService.addContact(this.contactForm.value).subscribe({
      next: (res) => {
        this.uiService.success(res.message || this.translateService.instant('ln.MessageSentSuccess'));
        this.formDirective.resetForm();
        this.isSubmitting.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  private getShopInfo() {
    const sub = this.shopInfoService.getShopInformation().subscribe({
      next: (res) => {
        if (res.success) {
          this.shopInfo.set(res.data);
          this.seoService.setContactSchema(res.data, [
            { label: this.translateService.instant('ln.ContactUs') || 'Contact', isCurrent: true },
          ]);
        }
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}

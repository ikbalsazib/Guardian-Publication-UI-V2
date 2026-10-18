import { Component, OnDestroy, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ManuscriptService } from '../../services/common/manuscript.service';
import { UiService } from '../../services/core/ui.service';
import { FileUploadService } from '../../services/gallery/file-upload.service';
import { SeoService } from '../../services/core/seo.service';


@Component({
  selector: 'app-manuscript-submission',
  templateUrl: './manuscript-submission.component.html',
  styleUrls: ['./manuscript-submission.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class ManuscriptSubmissionComponent implements OnInit, OnDestroy {
  // Signals
  isLoading = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  uploadedFileUrl = signal<string | null>(null);

  // Form
  manuscriptForm!: FormGroup;
  @ViewChild('formElement') formElement!: NgForm;

  // Dependencies
  private fb = inject(FormBuilder);
  private manuscriptService = inject(ManuscriptService);
  private fileUploadService = inject(FileUploadService);
  private uiService = inject(UiService);
  private seoService = inject(SeoService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.seoService.updateMetaData({
      title: 'পাণ্ডুলিপি জমা দিন',
      description: 'Guardian Publications-এ নতুন বই প্রকাশের জন্য পাণ্ডুলিপি জমা দেওয়ার নিয়ম ও প্রক্রিয়া জানুন।',
      canonicalPath: '/manuscript-submission',
    });
    this.seoService.setWebPageSchema('/manuscript-submission', 'পাণ্ডুলিপি জমা দিন', [
      { label: 'পাণ্ডুলিপি জমা', isCurrent: true },
    ]);
    this.initForm();
  }

  private initForm() {
    this.manuscriptForm = this.fb.group({
      name: ['', Validators.required],
      birthDayDate: [null, Validators.required],
      profession: [''],
      phone: ['', [Validators.required, Validators.pattern(/^(01)[0-9]{9}$/)]],
      email: ['', [Validators.email]],
      address: ['', Validators.required],
      manuScriptName: ['', Validators.required],
      manuScriptWords: [''],
      manuScriptContents: [''],
      targrtReaderClasses: [''],
      docFile: [null],
      manuScriptSummery: ['', [Validators.maxLength(500)]],
      manuScriptComment: ['', [Validators.maxLength(500)]],
      isAccept: [false, Validators.requiredTrue]
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading.set(true);
      this.fileUploadService.uploadMultiFileOriginal([file], null).subscribe({
        next: (res) => {
          const url = res[0].url;
          this.uploadedFileUrl.set(url);
          this.manuscriptForm.patchValue({ docFile: url });
          this.uiService.success('ফাইল আপলোড সফল হয়েছে।');
          this.isUploading.set(false);
        },
        error: () => {
          this.uiService.wrong('ফাইল আপলোড ব্যর্থ হয়েছে।');
          this.isUploading.set(false);
        }
      });
    }
  }

  onSubmit() {
    if (this.manuscriptForm.invalid) {
      this.uiService.warn('অনুগ্রহ করে সকল সঠিক তথ্য প্রদান করুন।');
      return;
    }

    this.isLoading.set(true);
    this.manuscriptService.addManuscript(this.manuscriptForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.success('আপনার পাণ্ডুলিপিটি সফলভাবে জমা হয়েছে। আমাদের টিম আপনার সাথে যোগাযোগ করবে।');
          this.formElement.resetForm();
          this.uploadedFileUrl.set(null);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}

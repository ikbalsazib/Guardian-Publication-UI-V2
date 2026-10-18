import { Component, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, Observable, shareReplay, Subscription } from 'rxjs';

import { User } from '../../../../interfaces/common/user.interface';
import { UserDataService } from '../../../../services/common/user-data.service';
import { UiService } from '../../../../services/core/ui.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { UserService } from '../../../../services/common/user.service';
import { FileUploadService } from '../../../../services/gallery/file-upload.service';
import { FileData } from '../../../../interfaces/gallery/file-data';
import { ImageCropComponent } from '../../../../pages/user/account/image-crop/image-crop.component';
import { MaterialModule } from '../../../../material/material.module';
import { PipesModule } from '../../../pipes/pipes.module';

@Component({
  selector: 'app-edit-basic-info',
  templateUrl: './edit-basic-info.component.html',
  styleUrls: ['./edit-basic-info.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatDialogModule,
    PipesModule
  ]
})
export class EditBasicInfoComponent implements OnInit, OnDestroy {
  @Output() newEvent = new EventEmitter<User | null>();

  // Dependencies
  private readonly fb = inject(FormBuilder);
  private readonly userDataService = inject(UserDataService);
  private readonly userService = inject(UserService);
  private readonly reloadService = inject(ReloadService);
  private readonly dialog = inject(MatDialog);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly uiService = inject(UiService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Form
  formData!: FormGroup;

  // State Signals
  user = signal<User | null>(null);
  imgPlaceHolder = signal<string>("/assets/images/placeholder/user.png");
  isLoading = signal<boolean>(false);

  // Local State
  imageChangedEvent: any = null;
  pickedImage?: any;
  file: File | null = null;
  newFileName!: string;
  imgBlob: Blob | null = null;

  // BREAKPOINTS
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(['(max-width: 599px)'])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.initForm();
    this.getLoggedInUserInfo();

    const subReload = this.reloadService.refreshData$.subscribe(() => {
      this.getLoggedInUserInfo();
    });
    this.subscriptions.push(subReload);
  }

  initForm() {
    this.formData = this.fb.group({
      name: [null],
      birthDate: [null],
      gender: [null],
      phoneNo: [null],
      email: [null],
    });
  }

  onSubmit() {
    if (this.imgBlob) {
      this.imageUploadOnServer(this.formData.valid ? this.formData.value : undefined);
      return;
    }

    if (this.formData.valid) {
      this.updateLoggedInUserInfo(this.formData.value);
    }
  }

  private getLoggedInUserInfo() {
    const sub = this.userDataService.getLoggedInUserData().subscribe({
      next: (res) => {
        if (res?.data) {
          this.user.set(res.data);
          this.formData.patchValue(res.data);
          this.newEvent.emit(res.data);
          if (res.data.profileImg) {
            this.imgPlaceHolder.set(res.data.profileImg);
          }
        }
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(sub);
  }

  updateLoggedInUserInfo(data: any) {
    this.isLoading.set(true);
    const sub = this.userDataService.updateLoggedInUserInfo(data).subscribe({
      next: (res) => {
        if (res?.success === false) {
          this.uiService.wrong(res?.message || 'দুঃখিত! তথ্য আপডেট করা সম্ভব হয়নি।');
          this.isLoading.set(false);
          return;
        }
        this.uiService.success(res?.message || 'আপনার তথ্য আপডেট করা হয়েছে।');
        this.reloadService.needRefreshData$();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.uiService.wrong('দুঃখিত! তথ্য আপডেট করা সম্ভব হয়নি।');
        this.isLoading.set(false);
        console.log(err);
      }
    });
    this.subscriptions.push(sub);
  }

  fileChangeEvent(event: Event) {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    if (!file) return;

    this.file = file;
    const originalNameWithoutExt = this.file.name.toLowerCase().split(' ').join('-').split('.').shift();
    const fileExtension = this.file.name.split('.').pop();
    this.newFileName = `${Date.now().toString()}_${originalNameWithoutExt}.${fileExtension}`;

    const reader = new FileReader();
    reader.onload = () => {
      this.imgPlaceHolder.set(reader.result as string);
    };
    reader.readAsDataURL(this.file);

    this.openComponentDialog(this.file, element);
  }

  public openComponentDialog(file: File, fileInput?: HTMLInputElement) {
    const dialogRef = this.dialog.open(ImageCropComponent, {
      data: file,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      disableClose: true,
      width: '680px',
      minHeight: '400px'
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (fileInput) {
        fileInput.value = '';
      }

      if (!dialogResult?.imgBlob) {
        return;
      }

      this.imgBlob = dialogResult.imgBlob;

      if (dialogResult.croppedImage) {
        this.pickedImage = dialogResult.croppedImage;
        this.imgPlaceHolder.set(dialogResult.croppedImage);
      }

      this.imageUploadOnServer();
    });
  }

  private imageUploadOnServer(formData?: Record<string, unknown>) {
    if (!this.imgBlob) {
      this.uiService.wrong('দুঃখিত! প্রোফাইল ছবি প্রস্তুত করা যায়নি।');
      return;
    }

    this.isLoading.set(true);
    const data: FileData = {
      fileName: this.newFileName,
      file: this.imgBlob,
      folderPath: 'users'
    };
    const sub = this.fileUploadService.uploadSingleImage(data).subscribe({
      next: (res) => {
        if (res?.url) {
          const updateData = formData
            ? { ...formData, profileImg: res.url }
            : { profileImg: res.url };
          this.updateLoggedInUserInfo(updateData);
          this.imgBlob = null;
          this.pickedImage = undefined;
        } else {
          this.isLoading.set(false);
          this.uiService.wrong('দুঃখিত! প্রোফাইল ছবি আপলোড করা সম্ভব হয়নি।');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.uiService.wrong('দুঃখিত! প্রোফাইল ছবি আপলোড করা সম্ভব হয়নি।');
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

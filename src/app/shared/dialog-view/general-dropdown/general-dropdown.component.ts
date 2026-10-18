import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SelectToggleService } from '../../../services/common/select-toggle.service';
import { ReloadService } from '../../../services/core/reload.service';
import { OutSideClickDirective } from '../../directives/out-side-click.directive';
import { PipesModule } from '../../pipes/pipes.module';

@Component({
  selector: 'app-general-dropdown',
  templateUrl: './general-dropdown.component.html',
  styleUrls: ['./general-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, OutSideClickDirective, PipesModule]
})
export class GeneralDropdownComponent implements OnInit, OnChanges, OnDestroy {
  // DECORATORS
  @Input() inputData: any[] = [];
  @Input() placeHolderId: string | null = null;
  @Input() isSearch: boolean = true;
  @Input() label: string | null = null;
  @Input() patchedValue: any = null;
  @Input() isDisabled: boolean = false;
  @Input() isRequired: boolean = true;
  @Input() placeHolderName: string | null = null;

  @Output() passDataEvent = new EventEmitter();

  // store variables
  dataSelected: any = null;
  errorMsg: boolean = false;
  isSelectShow = '';
  searchQueryHost: string | undefined;

  // Dependencies
  private _selectToggle = inject(SelectToggleService);
  private reloadService = inject(ReloadService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subToggle = this._selectToggle.selectToggle.subscribe((res: string) => {
      this.isSelectShow = res;
    });
    this.subscriptions.push(subToggle);

    const subReload = this.reloadService.refreshSelectData$.subscribe((res: any) => {
      if (res) {
        this.dataSelected = res;
      }
    });
    this.subscriptions.push(subReload);
  }

  ngOnChanges(): void {
    if (this.placeHolderId) {
      this.getSelectedDataById();
    }
  }

  getSelectedDataById() {
    this.dataSelected = this.inputData?.find(
      (data: any) => data.id === this.placeHolderId
    );
  }

  dataErrorShow() {
    this.errorMsg = true;
  }

  dataErrorHide() {
    this.errorMsg = false;
  }

  isSelectToggle(showType: string) {
    if (this.isSelectShow !== showType) {
      this.isSelectShow = showType.toLowerCase();
      this.searchQueryHost = undefined;
      this._selectToggle.selectCountryToggle.next('');
    } else {
      if (this.dataSelected === undefined) {
        this.dataErrorShow();
      }
      this.isSelectShow = '';
    }
  }

  isSelectClose() {
    this.isSelectShow = '';
  }

  onSelectData(data: any) {
    this.dataSelected = data;
    this.passDataEvent.emit(this.dataSelected);
    this.dataErrorHide();
    this.isSelectClose();
  }

  searchMenu(input: HTMLInputElement) {
    if (input.value.trim() === '') {
      this.searchQueryHost = undefined;
    } else {
      this.searchQueryHost = input.value.toLowerCase();
    }
  }

  handleOutsideClick(): void {
    this.isSelectClose();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

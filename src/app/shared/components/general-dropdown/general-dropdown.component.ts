import { Component, EventEmitter, Input, OnInit, Output, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectToggleService } from '../../../services/common/select-toggle.service';
import { ReloadService } from '../../../services/core/reload.service';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-general-dropdown',
  templateUrl: './general-dropdown.component.html',
  styleUrls: ['./general-dropdown.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DirectivesModule,
    PipesModule
  ]
})
export class GeneralDropdownComponent implements OnInit, OnChanges {
  // DECORATORS
  @Input() inputData: any[] = [];
  @Input() placeHolderId: string | null = null;
  @Input() isSearch: boolean = true;
  @Input() label: string | null = null;
  @Input() patchedValue: any = null;
  @Input() isDisabled: boolean = false;
  @Input() isRequired: boolean = true;
  @Input() placeHolderName: string | null = null;

  @Output() passDataEvent = new EventEmitter<any>();

  // Signals or store variables
  dataSelected: any = null;
  errorMsg: boolean = false;
  isSelectShow: string = '';
  searchQuery: string | undefined = undefined;

  // Dependencies
  private readonly _selectToggle = inject(SelectToggleService);
  private readonly reloadService = inject(ReloadService);

  ngOnInit(): void {
    this._selectToggle.selectToggle.subscribe((res: any) => {
      this.isSelectShow = res;
    });

    this.reloadService.refreshSelectData$.subscribe((res: any) => {
      if (res) {
        this.dataSelected = res;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['placeHolderId'] && this.placeHolderId) {
      this.getSelectedDataById();
    }
  }

  getSelectedDataById() {
    this.dataSelected = this.inputData?.find(
      (data: any) => data.id === this.placeHolderId || data._id === this.placeHolderId
    );
  }

  dataErrorShow() {
    this.errorMsg = true;
  }

  dataErrorHide() {
    this.errorMsg = false;
  }

  isSelectToggle(showType: string) {
    if (this.isSelectShow !== showType.toLowerCase()) {
      this.isSelectShow = showType.toLowerCase();
      this.searchQuery = undefined;
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

  // SEARCH MENU
  searchMenu(input: HTMLInputElement) {
    if (input.value.trim() === '') {
      this.searchQuery = undefined;
    } else {
      this.searchQuery = input.value.toLowerCase();
    }
  }

  handleOutsideClick(): void {
    this.isSelectClose();
  }
}

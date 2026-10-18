import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';

import { Address } from '../../../../interfaces/common/address.interface';
import { Area } from '../../../../interfaces/common/area.interface';
import { Division } from '../../../../interfaces/common/division.interface';
import { Zone } from '../../../../interfaces/common/zone.interface';
import { AreaService } from '../../../../services/common/area.service';
import { DivisionService } from '../../../../services/common/division.service';
import { UserDataService } from '../../../../services/common/user-data.service';
import { ZoneService } from '../../../../services/common/zone.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { UiService } from '../../../../services/core/ui.service';

@Component({
  selector: 'app-manage-address',
  templateUrl: './manage-address.component.html',
  styleUrls: ['./manage-address.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ]
})
export class ManageAddressComponent implements OnInit, OnDestroy {
  // Signals
  addresses = signal<Address[]>([]);
  divisions = signal<Division[]>([]);
  areas = signal<Area[]>([]);
  zones = signal<Zone[]>([]);
  isLoading = signal<boolean>(false);
  showForm = signal<boolean>(false);
  editingId = signal<string | null>(null);

  // Form
  addressForm!: FormGroup;

  // Dependencies
  private readonly fb = inject(FormBuilder);
  private readonly divisionService = inject(DivisionService);
  private readonly areaService = inject(AreaService);
  private readonly zoneService = inject(ZoneService);
  private readonly userDataService = inject(UserDataService);
  private readonly reloadService = inject(ReloadService);
  private readonly uiService = inject(UiService);
  private readonly translateService = inject(TranslateService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initForm();
    this.fetchDivisions();
    this.fetchUserAddresses();

    const subReload = this.reloadService.refreshData$.subscribe(() => {
      this.fetchUserAddresses();
    });
    this.subscriptions.push(subReload);
  }

  private initForm() {
    this.addressForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^(01)[0-9]{9}$/)]],
      division: [null, Validators.required],
      area: [null, Validators.required],
      zone: [null],
      address: ['', Validators.required],
      addressType: ['Home'],
      setDefaultAddress: [false]
    });
  }

  private fetchDivisions() {
    this.divisionService.getAllDivisions({ filter: { status: 'publish' } }).subscribe({
      next: (res: any) => {
        this.divisions.set(res.data);
      }
    });
  }

  onDivisionChange(divisionId: string) {
    this.areaService.getAreaByParentId(divisionId, 'name').subscribe({
      next: (res: any) => {
        this.areas.set(res.data);
        this.addressForm.get('area')?.reset();
        this.addressForm.get('zone')?.reset();
        this.zones.set([]);
      }
    });
  }

  onAreaChange(areaId: string) {
    this.zoneService.getZoneByParentId(areaId, 'name').subscribe({
      next: (res: any) => {
        this.zones.set(res.data);
        this.addressForm.get('zone')?.reset();
      }
    });
  }

  private fetchUserAddresses() {
    this.isLoading.set(true);
    this.userDataService.getUserAddress().subscribe({
      next: (res: any) => {
        this.addresses.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onAddAddress() {
    this.editingId.set(null);
    this.addressForm.reset({ addressType: 'Home', setDefaultAddress: false });
    this.showForm.set(true);
  }

  onEditAddress(addr: Address) {
    this.editingId.set(addr._id || null);
    this.showForm.set(true);

    if (addr.division) {
      const divId = (addr.division as any)._id || addr.division;
      this.areaService.getAreaByParentId(divId, 'name').subscribe({
        next: (res: any) => {
          this.areas.set(res.data);
          if (addr.area) {
            const areaId = (addr.area as any)._id || addr.area;
            this.zoneService.getZoneByParentId(areaId, 'name').subscribe({
              next: (resZ: any) => {
                this.zones.set(resZ.data);
                this.addressForm.patchValue({
                  name: addr.name,
                  phone: addr.phone,
                  division: divId,
                  area: areaId,
                  zone: (addr.zone as any)?._id || addr.zone,
                  address: addr.address,
                  addressType: addr.addressType,
                  setDefaultAddress: addr.setDefaultAddress
                });
              }
            });
          }
        }
      });
    }
  }

  onDeleteAddress(id: string) {
    this.userDataService.deleteAddressById(id).subscribe({
      next: (res: any) => {
        this.uiService.success(res.message);
        this.fetchUserAddresses();
      }
    });
  }

  onSetDefault(id: string) {
    this.userDataService.editAddress(id, { setDefaultAddress: true }).subscribe({
      next: () => {
        this.uiService.success(this.translateService.instant('ln.DefaultAddressSet') || 'Default address set successfully.');
        this.fetchUserAddresses();
      }
    });
  }

  onSubmit() {
    if (this.addressForm.invalid) return;

    const data = this.addressForm.value;
    const id = this.editingId();

    if (id) {
      this.userDataService.editAddress(id, data).subscribe({
        next: () => {
          this.uiService.success(this.translateService.instant('ln.AddressUpdated') || 'Address updated successfully.');
          this.showForm.set(false);
          this.fetchUserAddresses();
        }
      });
    } else {
      this.userDataService.addAddress(data).subscribe({
        next: () => {
          this.uiService.success(this.translateService.instant('ln.NewAddressAdded') || 'New address added successfully.');
          this.showForm.set(false);
          this.fetchUserAddresses();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}

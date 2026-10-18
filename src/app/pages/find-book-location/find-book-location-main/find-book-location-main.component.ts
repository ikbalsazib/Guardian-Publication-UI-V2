import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { DivisionService } from 'src/app/services/common/division.service';
import { AreaService } from 'src/app/services/common/area.service';
import { ZoneService } from 'src/app/services/common/zone.service';
import { PraptisthanaService } from 'src/app/services/common/praptisthana.service';
import { Praptisthana } from 'src/app/interfaces/common/praptisthana.interface';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';

@Component({
  selector: 'app-find-book-location-main',
  templateUrl: './find-book-location-main.component.html',
  styleUrls: ['./find-book-location-main.component.scss'],
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
    MatProgressSpinnerModule,
    MatIconModule
  ]
})
export class FindBookLocationMainComponent implements OnInit {
  // Signals
  divisions = signal<any[]>([]);
  areas = signal<any[]>([]);
  zones = signal<any[]>([]);
  praptisthanas = signal<Praptisthana[]>([]);
  isLoading = signal<boolean>(false);

  // Form
  locationForm!: FormGroup;

  // Dependencies
  private fb = inject(FormBuilder);
  private divisionService = inject(DivisionService);
  private areaService = inject(AreaService);
  private zoneService = inject(ZoneService);
  private praptisthanaService = inject(PraptisthanaService);

  ngOnInit(): void {
    this.initForm();
    this.fetchDivisions();
    this.fetchPraptisthanas();
  }

  private initForm() {
    this.locationForm = this.fb.group({
      division: [null],
      area: [null],
      zone: [null],
      searchTerm: [null]
    });

    // Listen to search changes
    this.locationForm.get('searchTerm')?.valueChanges.subscribe(() => {
      this.fetchPraptisthanas();
    });
  }

  private fetchDivisions() {
    this.divisionService.getAllDivisions({ filter: { status: 'publish' } }).subscribe(res => {
      this.divisions.set(res.data);
    });
  }

  onDivisionChange(id: string) {
    this.areaService.getAreaByParentId(id, 'name').subscribe(res => {
      this.areas.set(res.data);
      this.locationForm.get('area')?.reset();
      this.locationForm.get('zone')?.reset();
      this.fetchPraptisthanas();
    });
  }

  onAreaChange(id: string) {
    this.zoneService.getZoneByParentId(id, 'name').subscribe(res => {
      this.zones.set(res.data);
      this.locationForm.get('zone')?.reset();
      this.fetchPraptisthanas();
    });
  }

  onZoneChange() {
    this.fetchPraptisthanas();
  }

  fetchPraptisthanas() {
    this.isLoading.set(true);
    const formValue = this.locationForm.value;
    let filter: any = {};
    
    if (formValue.division) filter['division._id'] = formValue.division;
    if (formValue.area) filter['area._id'] = formValue.area;
    if (formValue.zone) filter['zone._id'] = formValue.zone;

    const filterData: FilterData = {
      filter: Object.keys(filter).length ? filter : null,
      select: { name: 1, phone: 1, address: 1, image: 1, area: 1 },
      sort: { createdAt: -1 },
      pagination: null
    };

    this.praptisthanaService.getAllPraptisthana(filterData, formValue.searchTerm).subscribe({
      next: (res) => {
        this.praptisthanas.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}

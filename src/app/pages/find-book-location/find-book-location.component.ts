import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Area } from '../../interfaces/common/area.interface';
import { Division } from '../../interfaces/common/division.interface';
import { Praptisthana } from '../../interfaces/common/praptisthana.interface';
import { Zone } from '../../interfaces/common/zone.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { AreaService } from '../../services/common/area.service';
import { DivisionService } from '../../services/common/division.service';
import { PraptisthanaService } from '../../services/common/praptisthana.service';
import { ZoneService } from '../../services/common/zone.service';
import { EngBnNumPipe } from '../../shared/pipes/eng-bn-num.pipe';
import { GeneralDropdownComponent } from '../../shared/components/general-dropdown/general-dropdown.component';
import { SeoService } from '../../services/core/seo.service';



@Component({
  selector: 'app-find-book-location',
  templateUrl: './find-book-location.component.html',
  styleUrls: ['./find-book-location.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    EngBnNumPipe,
    GeneralDropdownComponent
  ]
})
export class FindBookLocationComponent implements OnInit, OnDestroy {
  // Signals
  divisions = signal<Division[]>([]);
  areas = signal<Area[]>([]);
  zones = signal<Zone[]>([]);
  locations = signal<Praptisthana[]>([]);
  isLoading = signal<boolean>(false);

  // Form
  filterForm!: FormGroup;

  // Dependencies
  private fb = inject(FormBuilder);
  private divisionService = inject(DivisionService);
  private areaService = inject(AreaService);
  private zoneService = inject(ZoneService);
  private praptisthanaService = inject(PraptisthanaService);
  private seoService = inject(SeoService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.seoService.updateMetaData({
      title: 'বইয়ের অবস্থান খুঁজুন',
      description: 'সারাদেশে Guardian Publications-এর বই কোথায় পাওয়া যায় — লাইব্রেরি ও শোরুমের তালিকা দেখুন।',
      canonicalPath: '/find-book-location',
    });
    this.seoService.setWebPageSchema('/find-book-location', 'বইয়ের অবস্থান খুঁজুন', [
      { label: 'বইয়ের অবস্থান', isCurrent: true },
    ]);
    this.initForm();
    this.fetchDivisions();
    this.fetchLocations();
  }

  private initForm() {
    this.filterForm = this.fb.group({
      division: [null],
      area: [null],
      zone: [null]
    });
  }

  private fetchDivisions() {
    const filter: FilterData = {
      filter: { status: 'publish' },
      select: { name: 1 },
      sort: { name: 1 },
      pagination: null
    };
    this.divisionService.getAllDivisions(filter).subscribe(res => {
      this.divisions.set(res.data);
    });
  }

  onDivisionChange(divisionId: string) {
    this.filterForm.patchValue({ area: null, zone: null });
    this.areas.set([]);
    this.zones.set([]);

    if (divisionId) {
      this.areaService.getAreaByParentId(divisionId, 'name').subscribe(res => {
        this.areas.set(res.data);
      });
    }
    this.fetchLocations();
  }

  onAreaChange(areaId: string) {
    this.filterForm.patchValue({ zone: null });
    this.zones.set([]);

    if (areaId) {
      this.zoneService.getZoneByParentId(areaId, 'name').subscribe(res => {
        this.zones.set(res.data);
      });
    }
    this.fetchLocations();
  }

  onZoneChange() {
    this.fetchLocations();
  }

  onGeneralDropdownChange(data: any, type: string) {
    if (type === 'division') {
      this.filterForm.patchValue({ division: data?._id });
      this.onDivisionChange(data?._id);
    } else if (type === 'area') {
      this.filterForm.patchValue({ area: data?._id });
      this.onAreaChange(data?._id);
    } else if (type === 'zone') {
      this.filterForm.patchValue({ zone: data?._id });
      this.onZoneChange();
    }
  }

  fetchLocations() {
    const { division, area, zone } = this.filterForm.value;
    const mFilter: any = {};
    if (division) mFilter['division._id'] = division;
    if (area) mFilter['area._id'] = area;
    if (zone) mFilter['zone._id'] = zone;

    const filter: FilterData = {
      filter: Object.keys(mFilter).length ? mFilter : null,
      select: { name: 1, phone: 1, address: 1, image: 1, division: 1, area: 1, zone: 1 },
      sort: { createdAt: -1 },
      pagination: null
    };

    this.isLoading.set(true);
    const sub = this.praptisthanaService.getAllPraptisthana(filter, null).subscribe({
      next: (res) => {
        this.locations.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}

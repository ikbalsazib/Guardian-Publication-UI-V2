import { CommonModule } from '@angular/common';
import {Component, Input} from '@angular/core';
import { RouterModule } from '@angular/router';
import { SpecialPackage } from '../../../interfaces/common/special-package.interface';

@Component({
  selector: 'app-special-package-card-one',
  templateUrl: './special-package-card-one.component.html',
  styleUrls: ['./special-package-card-one.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SpecialPackageCardOneComponent {
  @Input() data!: SpecialPackage;
}

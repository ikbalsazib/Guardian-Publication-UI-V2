import { CommonModule } from '@angular/common';
import {Component, Input} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Author } from "../../../interfaces/common/author.interface";

@Component({
  selector: 'app-author-card-one',
  templateUrl: './author-card-one.component.html',
  styleUrls: ['./author-card-one.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule]
})
export class AuthorCardOneComponent {
  @Input() data?: Author;

  constructor(public translateService: TranslateService) {}
}

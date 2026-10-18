import { NgModule } from '@angular/core';
import { HeaderComponent } from './header.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    HeaderComponent,
  ],
  declarations: [],
  exports: [
    HeaderComponent,
    MatIconModule
  ]
})
export class HeaderModule { }

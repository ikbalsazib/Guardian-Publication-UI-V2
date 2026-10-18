import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardOneComponent } from './product-card-one.component';
import { RouterModule } from '@angular/router';
import { PipesModule } from '../../pipes/pipes.module';
import {MatIconModule} from "@angular/material/icon";
import {TranslateModule} from "@ngx-translate/core";
import {MaterialModule} from "../../../material/material.module";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        PipesModule,
        MatIconModule,
        TranslateModule,
        MaterialModule,
        ProductCardOneComponent
    ],
    declarations: [],
    exports: [
        ProductCardOneComponent
    ]
})
export class ProductCardOneModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardTwoComponent } from './product-card-two.component';
import { RouterModule } from '@angular/router';
import { PipesModule } from '../../pipes/pipes.module';
import {TranslateModule} from "@ngx-translate/core";
import {MaterialModule} from "../../../material/material.module";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        PipesModule,
        TranslateModule,
        MaterialModule,
        ProductCardTwoComponent
    ],
    declarations: [],
    exports: [
        ProductCardTwoComponent
    ]
})
export class ProductCardTwoModule { }

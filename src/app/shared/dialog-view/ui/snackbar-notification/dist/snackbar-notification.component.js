"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
exports.SnackbarNotificationComponent = void 0;
var core_1 = require("@angular/core");
var snack_bar_1 = require("@angular/material/snack-bar");
var SnackbarNotificationComponent = /** @class */ (function () {
    function SnackbarNotificationComponent(snackBarRef, data) {
        this.snackBarRef = snackBarRef;
        this.data = data;
    }
    SnackbarNotificationComponent.prototype.ngOnInit = function () {
    };
    SnackbarNotificationComponent = __decorate([
        core_1.Component({
            selector: 'app-snackbar-notification',
            templateUrl: './snackbar-notification.component.html',
            styleUrls: ['./snackbar-notification.component.scss']
        }),
        __param(1, core_1.Inject(snack_bar_1.MAT_SNACK_BAR_DATA))
    ], SnackbarNotificationComponent);
    return SnackbarNotificationComponent;
}());
exports.SnackbarNotificationComponent = SnackbarNotificationComponent;

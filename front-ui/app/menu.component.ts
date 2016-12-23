
/// <reference path="../module/pixi-typescript/pixi.js.d.ts" />

import {Component, ElementRef} from "@angular/core";
import DisplayObject = PIXI.DisplayObject;
import {ErdService} from "./erd.service";

require('module/pixijs-4.3.0/pixi.js');

@Component(
    {
        selector: 'control-menu',
        templateUrl: 'app/menu.component.html',
        styleUrls: ['app/menu.component.css']
    }
)
export class MenuComponent {

    constructor(private erdService: ErdService) {

    }

    public setAddEntityState(): void {
        this.erdService.setAddEntityState();
    }

    public setSelectEntityState(): void {
        this.erdService.setSelectEntityState();
    }

    public setAddRelationState(): void {
        this.erdService.setAddRelationState();
    }
}

/// <reference path="../module/pixi-typescript/pixi.js.d.ts" />

import {Component, ElementRef, Input} from "@angular/core";
import DisplayObject = PIXI.DisplayObject;
import {ErdService} from "./erd.service";
import {EditEntityComponent} from "./dialog/edit-entity.component";
import {XErdStageComponent} from "./erd-stage.component";

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
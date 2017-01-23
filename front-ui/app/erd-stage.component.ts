
/// <reference path="../module/pixi-typescript/pixi.js.d.ts" />

import {Component, ElementRef, Input} from "@angular/core";
import DisplayObject = PIXI.DisplayObject;
import {ErdService} from "./erd.service";
import {EditEntityComponent} from "./dialog/edit-entity.component";

require('module/pixijs-4.3.0/pixi.js');

@Component(
    {
        selector: 'simple-erd-stage',
        template: `
        `
    }
)
export class XErdStageComponent {
    @Input() public dlgEditEntity: EditEntityComponent;

    constructor(private ele: ElementRef, private erdService: ErdService) {
        this.erdService.createStage(ele);
    }

    private openDlgEditEntity(event: any) {
        this.dlgEditEntity.show();
    }

}
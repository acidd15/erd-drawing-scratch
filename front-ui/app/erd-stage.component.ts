
/// <reference path="../module/pixi-typescript/pixi.js.d.ts" />

import {Component, ElementRef} from "@angular/core";
import DisplayObject = PIXI.DisplayObject;
import {ErdService} from "./erd.service";

require('module/pixijs-4.3.0/pixi.js');

@Component(
    {
        selector: 'simple-erd-stage',
        template: `
        `
    }
)
export class XErdStageComponent {

    constructor(private ele: ElementRef, private erdService: ErdService) {
        this.erdService.createStage(ele);
    }

}
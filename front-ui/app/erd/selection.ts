/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

import {XGraphics} from "./graphics";

export class XSelection extends XGraphics {

    constructor() {
        super();
        this.hide();
    }

    public show(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
        this.clear();
        this.lineStyle(1, 0x00, 1);
        this.bringToFront();
        this.visible = true;
    }

    public hide(): void {
        this.visible = false;
    }

    public update(w: number, h: number): void {
        this.clear();
        this.lineStyle(1, 0x00, 1);
        this.drawRect(0, 0, w, h);
    }

}
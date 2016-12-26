/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require('module/pixijs-4.3.0/pixi.js');

import {XGraphics} from "./graphics";

export class XSelection extends XGraphics {

    private _visible: boolean;

    constructor() {
        super();
        this.hide();
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(v: boolean) {
        this._visible = v;
    }

    public show(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
        this.clear();
        this.lineStyle(1, 0x00, 1);
        this.bringToFront();
        this._visible = true;
    }

    public hide(): void {
        this.lineStyle(0, 0x00, 1);
        this._visible = false;
    }

    public update(x: number, y: number): void {
        this.clear();
        this.lineStyle(1, 0x00, 1);
        this.drawRect(0, 0, x, y);
    }

}
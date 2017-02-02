/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

import {XGraphics} from "./graphics";

export class XResizeGuide extends XGraphics {
    private delta: any;

    constructor(x: number, y: number, private w: number, private h: number) {
        super();

        this.delta = {x: 0, y: 0, width: 0, height: 0, xw: 0, yh: 0};

        this.position.set(x,y);
        this.redraw();
    }

    public redraw(): void {
        this.clear();
        this.lineStyle(1, 0xbb, 1);
        this.drawRect(0, 0, this.w, this.h);
    }

    public getDelta(): any {
        return this.delta;
    }

    public resize(x: number, y: number, w: number, h: number): void {
        this.position.x += x;
        this.position.y += y;

        this.w += w;
        this.h += h;

        this.delta.x += x;
        this.delta.y += y;
        this.delta.width += w;
        this.delta.height += h;

        this.redraw();
    }
}
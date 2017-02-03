/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

import {XGraphics} from "./graphics";

export class XResizeGuide extends XGraphics {
    private delta: any;

    constructor(private rects: PIXI.Rectangle[]) {
        super();

        this.delta = {x: 0, y: 0, width: 0, height: 0};

        this.position.set(0, 0);
    }

    public redraw(): void {
        this.clear();
        this.lineStyle(1, 0xa37965, 1);

        for(let v of this.rects) {
            this.drawRect(
                v.x + this.delta.x,
                v.y + this.delta.y,
                v.width + this.delta.width,
                v.height + this.delta.height
                );
        }

    }

    public getDelta(): any {
        return this.delta;
    }

    public resize(x: number, y: number, w: number, h: number): void {
        this.delta.x += x;
        this.delta.y += y;
        this.delta.width += w;
        this.delta.height += h;

        this.redraw();
    }
}

/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

import {XEntity} from "./entity";
require('module/pixijs-4.3.0/pixi.js');

import {XGraphics} from "./graphics";

export class XLine extends XGraphics {
    private linePos: any;

    constructor(private _from: XEntity, private _to: XEntity) {
        super();

        this._from.addLinePoint(this);
        this._to.addLinePoint(this);

        this.linePos = this.getLinePos();

        this.redraw();
    }

    public get from() {
        return this._from;
    }

    public get to() {
        return this._to;
    }

    //@Override
    public redraw(): void {
        this.drawLine();
    }

    public updateLinePos(): void {
        this.linePos = this.getLinePos();
        this.redraw();
    }

    private getLinePos(): any {
        let fromCenter: PIXI.Point = this._from.getCenterPos();
        let toCenter: PIXI.Point = this._to.getCenterPos();

        if (fromCenter.x <= toCenter.x) {
            return {
                fromPos: new PIXI.Point(this._from.position.x + this._from._width, fromCenter.y),
                toPos: new PIXI.Point(this._to.position.x, toCenter.y)
            };
        }
        else {
            return {
                fromPos: new PIXI.Point(this._from.position.x, fromCenter.y),
                toPos: new PIXI.Point(this._to.position.x + this._to._width, toCenter.y)
            };
        }
    }

    private calcCenterXPos(): number {
        return this.linePos.fromPos.x + Math.ceil((this.linePos.toPos.x - this.linePos.fromPos.x)/2);
    }

    private drawLine(): void {
        let xPos: number = this.calcCenterXPos();

        this.clear();
        this.lineStyle(1, 0x00, 1);

        this.moveTo(this.linePos.fromPos.x, this.linePos.fromPos.y);

        this.lineTo(xPos, this.linePos.fromPos.y);
        this.lineTo(xPos, this.linePos.toPos.y);

        this.lineTo(this.linePos.toPos.x, this.linePos.toPos.y);
    }
}
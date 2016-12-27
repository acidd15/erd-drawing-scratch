/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

import {XEntity} from "./entity";
import {XGraphics} from "./graphics";

export class XLine extends XGraphics {
    private linePos: any;

    constructor(private from: XEntity, private to: XEntity) {
        super();

        this.from.addLinePoint(this);
        this.to.addLinePoint(this);

        this.linePos = this.getLinePos();

        this.redraw();
    }

    public getFrom() {
        return this.from;
    }

    public getTo() {
        return this.to;
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
        let fromCenter: PIXI.Point = this.from.getCenterPos();
        let toCenter: PIXI.Point = this.to.getCenterPos();

        if (fromCenter.x <= toCenter.x) {
            return {
                fromPos: new PIXI.Point(this.from.position.x + this.from.getWidth(), fromCenter.y),
                toPos: new PIXI.Point(this.to.position.x, toCenter.y)
            };
        }
        else {
            return {
                fromPos: new PIXI.Point(this.from.position.x, fromCenter.y),
                toPos: new PIXI.Point(this.to.position.x + this.to.getWidth(), toCenter.y)
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
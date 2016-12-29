/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

import {XEntity} from "./entity";
import {XGraphics} from "./graphics";
import {DragState, State} from "./types";
import {XStage} from "./stage";

import {getRectangle, getXYDelta} from "./library";

export class XLine extends XGraphics {

    private linePoints: PIXI.Point[];

    constructor(private from: XEntity, private to: XEntity) {
        super();

        this.interactive = true;
        this.buttonMode = true;
        this.defaultCursor = "default";

        this.from.addLinePoint(this);
        this.to.addLinePoint(this);

        this.linePoints = [,,,];
        this.initLinePoints();

        this.redraw();

        this.on("mousedown", this.onMouseDown);
        this.on("mouseup", this.onMouseUp);
        this.on("mouseupoutside", this.onMouseUpOutside);
        this.on("mousemove", this.onMouseMove);
    }

    public getFrom() {
        return this.from;
    }

    public getTo() {
        return this.to;
    }

    //@Override
    public redraw(): void {
        this.updateHitArea();
        this.drawLine();
    }

    private initLinePoints(): void {
        this.updateLinePoints(undefined, 0, 0);
    }

    public updateLinePoints(target: XEntity, xDelta: number, yDelta: number): void {
        if (target == this.from) {
            this.linePoints[0].x += xDelta;
            this.linePoints[0].y += yDelta;
        } else if(target == this.to) {
            this.linePoints[3].x += xDelta;
            this.linePoints[3].y += yDelta;
        } else {
            let linePos: any = this.getEntityCenterLinePos();
            this.linePoints[0] = linePos.fromPos;
            this.linePoints[3] = linePos.toPos;
        }

        let cx: number = this.calcCenterXPos(this.linePoints[0].x, this.linePoints[3].x);

        this.linePoints[1] = new PIXI.Point(cx, this.linePoints[0].y);
        this.linePoints[2] = new PIXI.Point(cx, this.linePoints[3].y);
    }

    private updateHitArea(): void {
        this.hitArea = getRectangle(this.linePoints[0], this.linePoints[3]);
    }

    private getEntityCenterLinePos(): any {
        let fromCenter: PIXI.Point = this.from.getCenterPos();
        let toCenter: PIXI.Point = this.to.getCenterPos();

        if (fromCenter.x <= toCenter.x) {
            return {
                fromPos: new PIXI.Point(this.from.position.x + this.from.getWidth(), fromCenter.y),
                toPos: new PIXI.Point(this.to.position.x, toCenter.y)
            };
        } else {
            return {
                fromPos: new PIXI.Point(this.from.position.x, fromCenter.y),
                toPos: new PIXI.Point(this.to.position.x + this.to.getWidth(), toCenter.y)
            };
        }
    }

    private calcCenterXPos(fromX: number, toX: number): number {
        return fromX + Math.ceil((toX - fromX)/2);
    }

    private drawLine(): void {
        this.clear();

        this.lineStyle(1, 0x00, 1);

        let i: any;
        for (i in this.linePoints) {
            if (i == 0) {
                this.moveTo(this.linePoints[i].x, this.linePoints[i].y);
            } else {
                this.lineTo(this.linePoints[i].x, this.linePoints[i].y);
            }
        }
    }

    private updateDefaultCursor(localPos: PIXI.Point) {
        /*
        if (this.linePoints[1].x -1 <= localPos.x && localPos.x <= this.linePoints[1].x +1) {
            this.defaultCursor = "col-resize";
        } else */if (
            (this.linePoints[0].y -1 <= localPos.y && localPos.y <= this.linePoints[1].y +1)
            || (this.linePoints[3].y -1 <= localPos.y && localPos.y <= this.linePoints[3].y +1)
        ) {
            this.defaultCursor = "row-resize";
        } else {
            this.defaultCursor = "default";
        }
    }

    protected onMouseDown(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseDown(evt);
    }

    protected onMouseUp(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseUp(evt);
    }

    protected onMouseUpOutside(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseUpOutside(evt);

        this.defaultCursor = "default";
    }

    protected onMouseMove(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseMove(evt);

        let stage: XStage = <XStage>this.parent;

        let localPos: PIXI.Point = evt.data.getLocalPosition(this.parent);

        if (
            this.dragging != DragState.DRAGGING
            && this.defaultCursor != "row-resize"
            && this.defaultCursor != "col-resize"
        ) {
            this.updateDefaultCursor(localPos);
        }

        if (this.dragging == DragState.DRAGGING && stage.getState() == State.SELECT) {
            let newPosition: PIXI.Point  = this.prevInteractionData.getLocalPosition(stage);

            let delta: any = getXYDelta(
                new PIXI.Point(newPosition.x, newPosition.y),
                new PIXI.Point(this.oldPosition.x, this.oldPosition.y)
            );

            if (this.defaultCursor == "row-resize") {
                if (this.linePoints[0].x <= localPos.x && localPos.x <= this.linePoints[1].x) {
                    this.updateLinePoints(this.from, 0, delta.y);
                } else if (this.linePoints[2].x <= localPos.x && localPos.x <= this.linePoints[3].x) {
                    this.updateLinePoints(this.to, 0, delta.y);
                }
            }/* else if (this.defaultCursor == "col-resize") {
            }*/

            this.redraw();

            this.oldPosition = newPosition;

        }
    }

}
/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

import {XEntity} from "./entity";
import {XGraphics} from "./graphics";
import {DragState, State, Direction} from "./types";
import {XStage} from "./stage";

import {getRectanglePoints, getLineIntersectPoint, getXYDelta} from "./library";

export class XLine extends XGraphics {

    private linePoints: PIXI.Point[];
    private lineDirections: Direction[];
    private isFromLineMove: boolean;
    private isToLineMove: boolean;

    constructor(private from: XEntity, private to: XEntity) {
        super();

        this.interactive = true;
        this.buttonMode = true;
        this.defaultCursor = "default";

        this.isFromLineMove = false;
        this.isToLineMove = false;

        this.from.addLinePoint(this);
        this.to.addLinePoint(this);

        this.linePoints = [,,,];
        this.lineDirections = [,,,];
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

    public getPoint(entity: XEntity): PIXI.Point {
        if (this.from == entity) {
            return this.linePoints[0];
        } else if (this.to == entity) {
            return this.linePoints[3];
        }
        return undefined;
    }


    public getDirection(entity: XEntity): Direction {
        if (this.from == entity) {
            return this.lineDirections[0];
        } else if (this.to == entity) {
            return this.lineDirections[3];
        }
        return undefined;
    }

    //@Override
    public redraw(): void {
        this.updateHitArea();
        this.drawLine();
    }

    private initLinePoints(): void {
        this.updateLinePoints(undefined, Direction.NONE, 0, 0);
        this.updateLineDirections();
        this.updateCenterLinePoints();
    }

    public updateLineDirections() {
        let body: PIXI.Rectangle;

        body = this.from.getBodyRectangle();

        if (body.y == this.linePoints[0].y) {
            this.lineDirections[0] = Direction.TOP;
        } else if (body.x == this.linePoints[0].x) {
            this.lineDirections[0] = Direction.LEFT;
        } else if (body.x + body.width - 1 <= this.linePoints[0].x && this.linePoints[0].x <= body.x + body.width + 1) {
            this.lineDirections[0] = Direction.RIGHT;
        } else if (body.y + body.height - 1 <= this.linePoints[0].y && this.linePoints[0].y <= body.y + body.height + 1) {
            this.lineDirections[0] = Direction.BOTTOM;
        } else {
            this.lineDirections[0] = Direction.NONE;
        }

        body = this.to.getBodyRectangle();

        if (body.y == this.linePoints[3].y) {
            this.lineDirections[3] = Direction.TOP;
        } else if (body.x == this.linePoints[3].x) {
            this.lineDirections[3] = Direction.LEFT;
        } else if (body.x + body.width - 1 <= this.linePoints[3].x && this.linePoints[3].x <= body.x + body.width + 1) {
            this.lineDirections[3] = Direction.RIGHT;
        } else if (body.y + body.height - 1 <= this.linePoints[3].y && this.linePoints[3].y <= body.y + body.height + 1) {
            this.lineDirections[3] = Direction.BOTTOM;
        } else {
            this.lineDirections[3] = Direction.NONE;
        }
    }

    private updateFromLine(from: XEntity, xDelta: number, yDelta: number): void {
        let rect: PIXI.Rectangle = from.getBodyRectangle();

        let rectPoints: PIXI.Point[] = getRectanglePoints(rect, -1);

        let p: PIXI.Point = new PIXI.Point(this.linePoints[0].x + xDelta, this.linePoints[0].y + yDelta);

        let result1: any = getLineIntersectPoint(p, this.linePoints[1], rectPoints[0], rectPoints[1]);
        let result2: any = getLineIntersectPoint(p, this.linePoints[1], rectPoints[1], rectPoints[2]);
        let result3: any = getLineIntersectPoint(p, this.linePoints[1], rectPoints[2], rectPoints[3]);
        let result4: any = getLineIntersectPoint(p, this.linePoints[1], rectPoints[3], rectPoints[0]);

        let result5: any = getLineIntersectPoint(this.linePoints[1], this.linePoints[2], rectPoints[0], rectPoints[1]);
        let result6: any = getLineIntersectPoint(this.linePoints[1], this.linePoints[2], rectPoints[1], rectPoints[2]);
        let result7: any = getLineIntersectPoint(this.linePoints[1], this.linePoints[2], rectPoints[2], rectPoints[3]);
        let result8: any = getLineIntersectPoint(this.linePoints[1], this.linePoints[2], rectPoints[3], rectPoints[0]);

        let result9: any = getLineIntersectPoint(this.linePoints[2], this.linePoints[3], rectPoints[0], rectPoints[1]);
        let result10: any = getLineIntersectPoint(this.linePoints[2], this.linePoints[3], rectPoints[1], rectPoints[2]);
        let result11: any = getLineIntersectPoint(this.linePoints[2], this.linePoints[3], rectPoints[2], rectPoints[3]);
        let result12: any = getLineIntersectPoint(this.linePoints[2], this.linePoints[3], rectPoints[3], rectPoints[0]);

        let toBeX: number = 0;
        let toBeY: number = 0;

        if (result1.intersected) {
            toBeX = this.calcCenterPos(rectPoints[0].x, rectPoints[1].x);
            toBeY = result1.y;
        }

        if (result2.intersected) {
            toBeX = result2.x;
            toBeY = this.calcCenterPos(rectPoints[1].y, rectPoints[2].y);
        }

        if (result3.intersected) {
            toBeX = this.calcCenterPos(rectPoints[2].x, rectPoints[3].x);
            toBeY = result3.y;
        }

        if (result4.intersected) {
            toBeX = result4.x;
            toBeY = this.calcCenterPos(rectPoints[3].y, rectPoints[0].y);
        }

        if (result5.intersected) {
            toBeX = this.calcCenterPos(rectPoints[0].x, rectPoints[1].x);
            toBeY = result5.y;
        }

        if (result6.intersected) {
            toBeX = result6.x;
            toBeY = this.calcCenterPos(rectPoints[1].y, rectPoints[2].y);
        }

        if (result7.intersected) {
            toBeX = this.calcCenterPos(rectPoints[2].x, rectPoints[3].x);
            toBeY = result7.y;
        }

        if (result8.intersected) {
            toBeX = result8.x;
            toBeY = this.calcCenterPos(rectPoints[3].y, rectPoints[0].y);
        }

        if (result9.intersected) {
            toBeX = this.calcCenterPos(rectPoints[0].x, rectPoints[1].x);
            toBeY = result9.y;
        }

        if (result10.intersected) {
            toBeX = result10.x;
            toBeY = this.calcCenterPos(rectPoints[1].y, rectPoints[2].y);
        }

        if (result11.intersected) {
            toBeX = this.calcCenterPos(rectPoints[2].x, rectPoints[3].x);
            toBeY = result11.y;
        }

        if (result12.intersected) {
            toBeX = result12.x;
            toBeY = this.calcCenterPos(rectPoints[3].y, rectPoints[0].y);
        }

        console.log([toBeX, toBeY]);

        if (toBeX == 0 && toBeY == 0) {
            toBeX = this.linePoints[0].x + xDelta;
            toBeY = this.linePoints[0].y + yDelta;
        }

        this.linePoints[0].x = toBeX;
        this.linePoints[0].y = toBeY;
    }

    private updateToLine(to: XEntity, xDelta: number, yDelta: number): void {
        let rect: PIXI.Rectangle = to.getBodyRectangle();

        let rectPoints: PIXI.Point[] = getRectanglePoints(rect, -1);

        let p: PIXI.Point = new PIXI.Point(this.linePoints[3].x + xDelta, this.linePoints[3].y + yDelta);

        let result1: any = getLineIntersectPoint(this.linePoints[2], p, rectPoints[0], rectPoints[1]);
        let result2: any = getLineIntersectPoint(this.linePoints[2], p, rectPoints[1], rectPoints[2]);
        let result3: any = getLineIntersectPoint(this.linePoints[2], p, rectPoints[2], rectPoints[3]);
        let result4: any = getLineIntersectPoint(this.linePoints[2], p, rectPoints[3], rectPoints[0]);

        let result5: any = getLineIntersectPoint(this.linePoints[1], this.linePoints[2], rectPoints[0], rectPoints[1]);
        let result6: any = getLineIntersectPoint(this.linePoints[1], this.linePoints[2], rectPoints[1], rectPoints[2]);
        let result7: any = getLineIntersectPoint(this.linePoints[1], this.linePoints[2], rectPoints[2], rectPoints[3]);
        let result8: any = getLineIntersectPoint(this.linePoints[1], this.linePoints[2], rectPoints[3], rectPoints[0]);

        let result9: any = getLineIntersectPoint(this.linePoints[0], this.linePoints[1], rectPoints[0], rectPoints[1]);
        let result10: any = getLineIntersectPoint(this.linePoints[0], this.linePoints[1], rectPoints[1], rectPoints[2]);
        let result11: any = getLineIntersectPoint(this.linePoints[0], this.linePoints[1], rectPoints[2], rectPoints[3]);
        let result12: any = getLineIntersectPoint(this.linePoints[0], this.linePoints[1], rectPoints[3], rectPoints[0]);

        let toBeX: number = 0;
        let toBeY: number = 0;

        if (result1.intersected) {
            toBeX = this.calcCenterPos(rectPoints[0].x, rectPoints[1].x);
            toBeY = result1.y;
        }

        if (result2.intersected) {
            toBeX = result2.x;
            toBeY = this.calcCenterPos(rectPoints[1].y, rectPoints[2].y);
        }

        if (result3.intersected) {
            toBeX = this.calcCenterPos(rectPoints[2].x, rectPoints[3].x);
            toBeY = result3.y;
        }

        if (result4.intersected) {
            toBeX = result4.x;
            toBeY = this.calcCenterPos(rectPoints[3].y, rectPoints[0].y);
        }

        if (result5.intersected) {
            toBeX = this.calcCenterPos(rectPoints[0].x, rectPoints[1].x);
            toBeY = result5.y;
        }

        if (result6.intersected) {
            toBeX = result6.x;
            toBeY = this.calcCenterPos(rectPoints[1].y, rectPoints[2].y);
        }

        if (result7.intersected) {
            toBeX = this.calcCenterPos(rectPoints[2].x, rectPoints[3].x);
            toBeY = result7.y;
        }

        if (result8.intersected) {
            toBeX = result8.x;
            toBeY = this.calcCenterPos(rectPoints[3].y, rectPoints[0].y);
        }

        if (result9.intersected) {
            toBeX = this.calcCenterPos(rectPoints[0].x, rectPoints[1].x);
            toBeY = result9.y;
        }

        if (result10.intersected) {
            toBeX = result10.x;
            toBeY = this.calcCenterPos(rectPoints[1].y, rectPoints[2].y);
        }

        if (result11.intersected) {
            toBeX = this.calcCenterPos(rectPoints[2].x, rectPoints[3].x);
            toBeY = result11.y;
        }

        if (result12.intersected) {
            toBeX = result12.x;
            toBeY = this.calcCenterPos(rectPoints[3].y, rectPoints[0].y);
        }

        if (toBeX == 0 && toBeY == 0) {
            toBeX = this.linePoints[3].x + xDelta;
            toBeY = this.linePoints[3].y + yDelta;
        }

        this.linePoints[3].x = toBeX;
        this.linePoints[3].y = toBeY;
    }

    public updateLinePoints(target: XEntity, controlDirection: Direction, xDelta: number, yDelta: number): void {
        if (target == this.from) {
            if (controlDirection == Direction.NONE) {
                this.updateFromLine(target, xDelta, yDelta);
            } else {
                if (controlDirection == Direction.LEFT_TOP
                    && (this.lineDirections[0] == Direction.LEFT || this.lineDirections[0] == Direction.TOP)) {
                    if (this.lineDirections[0] == Direction.LEFT) {
                        yDelta = 0;
                    } else if (this.lineDirections[0] == Direction.TOP) {
                        xDelta = 0;
                    }
                    this.updateFromLine(target, xDelta, yDelta);
                } else if (controlDirection == Direction.RIGHT_TOP
                    && (this.lineDirections[0] == Direction.RIGHT || this.lineDirections[0] == Direction.TOP)) {
                    if (this.lineDirections[0] == Direction.RIGHT) {
                        yDelta = 0;
                    } else if (this.lineDirections[0] == Direction.TOP) {
                        xDelta = 0;
                    }
                    this.updateFromLine(target, xDelta, yDelta);
                } else if (controlDirection == Direction.LEFT_BOTTOM
                    && (this.lineDirections[0] == Direction.LEFT || this.lineDirections[0] == Direction.BOTTOM)) {
                    if (this.lineDirections[0] == Direction.LEFT) {
                        yDelta = 0;
                    } else if (this.lineDirections[0] == Direction.BOTTOM) {
                        xDelta = 0;
                    }
                    this.updateFromLine(target, xDelta, yDelta);
                } else if (controlDirection == Direction.RIGHT_BOTTOM
                    && (this.lineDirections[0] == Direction.RIGHT || this.lineDirections[0] == Direction.BOTTOM)) {
                    if (this.lineDirections[0] == Direction.RIGHT) {
                        yDelta = 0;
                    } else if (this.lineDirections[0] == Direction.BOTTOM) {
                        xDelta = 0;
                    }
                    this.updateFromLine(target, xDelta, yDelta);
                }
            }
            this.updateToLine(this.to, 0, 0);
        } else if(target == this.to) {
            if (controlDirection == Direction.NONE) {
                this.updateToLine(target, xDelta, yDelta);
            } else {
                yDelta = 0;
                if (controlDirection == Direction.LEFT_TOP
                    && (this.lineDirections[3] == Direction.LEFT || this.lineDirections[3] == Direction.TOP)) {
                    if (this.lineDirections[3] == Direction.LEFT) {
                        yDelta = 0;
                    } else if (this.lineDirections[3] == Direction.TOP) {
                        xDelta = 0;
                    }
                    this.updateToLine(target, xDelta, yDelta);
                } else if (controlDirection == Direction.RIGHT_TOP
                    && (this.lineDirections[3] == Direction.RIGHT || this.lineDirections[3] == Direction.TOP)) {
                    if (this.lineDirections[3] == Direction.RIGHT) {
                        yDelta = 0;
                    } else if (this.lineDirections[3] == Direction.TOP) {
                        xDelta = 0;
                    }
                    this.updateToLine(target, xDelta, yDelta);
                } else if (controlDirection == Direction.LEFT_BOTTOM
                    && (this.lineDirections[3] == Direction.LEFT || this.lineDirections[3] == Direction.BOTTOM)) {
                    if (this.lineDirections[3] == Direction.LEFT) {
                        yDelta = 0;
                    } else if (this.lineDirections[3] == Direction.BOTTOM) {
                        xDelta = 0;
                    }
                    this.updateToLine(target, xDelta, yDelta);
                } else if (controlDirection == Direction.RIGHT_BOTTOM
                    && (this.lineDirections[3] == Direction.RIGHT || this.lineDirections[3] == Direction.BOTTOM)) {
                    if (this.lineDirections[3] == Direction.RIGHT) {
                        yDelta = 0;
                    } else if (this.lineDirections[3] == Direction.BOTTOM) {
                        xDelta = 0;
                    }
                    this.updateToLine(target, xDelta, yDelta);
                }
            }
            this.updateFromLine(this.from, 0, 0);
        } else {
            let linePos: any = this.getEntityCenterLinePos();
            this.linePoints[0] = linePos.fromPos;
            this.linePoints[3] = linePos.toPos;
        }
    }

    public updateCenterLinePoints() {
        if (
            (this.lineDirections[0] == Direction.LEFT || this.lineDirections[0] == Direction.RIGHT)
            && (this.lineDirections[3] == Direction.LEFT || this.lineDirections[3] == Direction.RIGHT)
        ) {
            let cx: number = this.calcCenterPos(this.linePoints[0].x, this.linePoints[3].x);
            
            this.linePoints[1] = new PIXI.Point(cx, this.linePoints[0].y);
            this.linePoints[2] = new PIXI.Point(cx, this.linePoints[3].y);
        } else if (
            (this.lineDirections[0] == Direction.LEFT || this.lineDirections[0] == Direction.RIGHT)
            && (this.lineDirections[3] == Direction.TOP || this.lineDirections[3] == Direction.BOTTOM)
        ) {
            this.linePoints[1] = new PIXI.Point(this.linePoints[3].x, this.linePoints[0].y);
            this.linePoints[2] = new PIXI.Point(this.linePoints[3].x, this.linePoints[0].y);
        } else if (
            (this.lineDirections[0] == Direction.TOP || this.lineDirections[0] == Direction.BOTTOM)
            && (this.lineDirections[3] == Direction.LEFT || this.lineDirections[3] == Direction.RIGHT)
        ) {
            this.linePoints[1] = new PIXI.Point(this.linePoints[0].x, this.linePoints[3].y);
            this.linePoints[2] = new PIXI.Point(this.linePoints[0].x, this.linePoints[3].y);
        } else {
            let cy: number = this.calcCenterPos(this.linePoints[0].y, this.linePoints[3].y);

            this.linePoints[1] = new PIXI.Point(this.linePoints[0].x, cy);
            this.linePoints[2] = new PIXI.Point(this.linePoints[3].x, cy);
        }
    }

    public isLineMoving(): boolean {
            return this.isFromLineMove || this.isToLineMove;
    }

    private updateHitArea(): void {
        this.hitArea = new PIXI.Polygon(this.linePoints);
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

    private calcCenterPos(fromX: number, toX: number): number {
        return fromX + Math.ceil((toX - fromX)/2);
    }

    private drawLine(): void {
        this.clear();

        this.lineStyle(1, 0x00, 1);

        // from point
        this.beginFill(0xff00ff, 1);
        this.drawRect(this.linePoints[0].x - 5, this.linePoints[0].y - 5, 10, 10);
        this.endFill();

        // angled line point
        this.beginFill(0xff, 0);
        this.drawRect(this.linePoints[1].x - 5, this.linePoints[1].y - 5, 10, 10);
        this.endFill();

        this.beginFill(0xff, 0);
        this.drawRect(this.linePoints[2].x - 5, this.linePoints[2].y - 5, 10, 10);
        this.endFill();

        // to point
        this.beginFill(0xffff00, 1);
        this.drawRect(this.linePoints[3].x - 5, this.linePoints[3].y - 5, 10, 10);
        this.endFill();

        let i: any;
        for (i in this.linePoints) {
            if (i == 0) {
                this.moveTo(this.linePoints[i].x, this.linePoints[i].y);
            } else {
                this.lineTo(this.linePoints[i].x, this.linePoints[i].y);
            }
        }
    }

    private isMouseInFromLine(localPos: PIXI.Point) {
        return (this.linePoints[0].y - 5 <= localPos.y && localPos.y <= this.linePoints[1].y + 5)
            && ((this.linePoints[0].x <= localPos.x && localPos.x <= this.linePoints[1].x)
            || (this.linePoints[1].x <= localPos.x && localPos.x <= this.linePoints[0].x));
    }

    private isMouseInToLine(localPos: PIXI.Point) {
        return (this.linePoints[3].y - 5 <= localPos.y && localPos.y <= this.linePoints[3].y + 5)
            && ((this.linePoints[2].x <= localPos.x && localPos.x <= this.linePoints[3].x)
            || (this.linePoints[3].x <= localPos.x && localPos.x <= this.linePoints[2].x));
    }

    private updateDefaultCursor(localPos: PIXI.Point) {
        if (this.isMouseInFromLine(localPos) || this.isMouseInToLine(localPos)) {
            this.defaultCursor = "row-resize";
        } else {
            this.defaultCursor = "default";
        }
    }

    protected onMouseDown(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseDown(evt);

        let localPos: PIXI.Point = evt.data.getLocalPosition(this.parent);

        if (this.isMouseInFromLine(localPos)) {
            this.isFromLineMove = true;
        } else if (this.isMouseInToLine(localPos)) {
            this.isToLineMove = true;
        } else {
            this.isFromLineMove = false;
            this.isToLineMove = false;
        }
    }

    protected onMouseUp(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseUp(evt);

        this.isFromLineMove = false;
        this.isToLineMove = false;
    }

    protected onMouseUpOutside(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseUpOutside(evt);

        this.isFromLineMove = false;
        this.isToLineMove = false;
    }

    protected onMouseMove(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseMove(evt);

        let stage: XStage = <XStage>this.parent;

        let localPos: PIXI.Point = evt.data.getLocalPosition(this.parent);

        if (
            this.dragging != DragState.DRAGGING
            && this.isFromLineMove == false
            && this.isToLineMove == false
        ) {
            this.updateDefaultCursor(localPos);
        }

        if (this.dragging == DragState.DRAGGING && stage.getState() == State.SELECT) {
            let newPosition: PIXI.Point  = this.prevInteractionData.getLocalPosition(stage);

            let delta: any = getXYDelta(
                new PIXI.Point(newPosition.x, newPosition.y),
                new PIXI.Point(this.oldPosition.x, this.oldPosition.y)
            );

            this.oldPosition = newPosition;

            if (this.isFromLineMove) {
                this.updateLinePoints(this.from, Direction.NONE, 0, delta.y);
                this.updateLineDirections();
                this.updateCenterLinePoints();
                this.redraw();
            } else if (this.isToLineMove) {
                this.updateLinePoints(this.to, Direction.NONE, 0, delta.y);
                this.updateLineDirections();
                this.updateCenterLinePoints();
                this.redraw();
            }
        }
    }

}
/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

import {XEntity} from "./entity";
import {XGraphics} from "./graphics";
import {DragState, State, Direction} from "./types";
import {XStage} from "./stage";

import {getRectanglePoints, getLineIntersectPoint, getXYDelta, calcCenterPos} from "./library";

enum LineMoveMode {
    NONE,
    COL,
    ROW
};

export class XLine extends XGraphics {

    private linePoints: PIXI.Point[];
    private lineDirections: Direction[];
    private isFromLineMove: boolean;
    private isToLineMove: boolean;
    private lineMoveMode: LineMoveMode;
    private lineBoundarySize: number;
    private useDebug: boolean;

    constructor(private from: XEntity, private to: XEntity) {
        super();

        this.interactive = true;
        this.buttonMode = true;
        this.defaultCursor = "default";

        this.isFromLineMove = false;
        this.isToLineMove = false;

        this.lineMoveMode = LineMoveMode.NONE;

        this.lineBoundarySize = 20;

        this.useDebug = true;

        this.from.addLinePoint(this);
        this.to.addLinePoint(this);

        this.linePoints = [,,,];
        this.lineDirections = [Direction.NONE, Direction.NONE, Direction.NONE, Direction.NONE];
        this.initLinePoints();

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

    public getJoinPoint(entity: XEntity): PIXI.Point {
        if (this.from == entity) {
            return this.linePoints[0];
        } else if (this.to == entity) {
            return this.linePoints[3];
        }
        return undefined;
    }


    public getJoinDirection(entity: XEntity): Direction {
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
        let linePos: any = this.getEntityCenterLinePosEach();
        this.linePoints[0] = new PIXI.Point(linePos.fromPos.x, linePos.fromPos.y);
        this.linePoints[1] = new PIXI.Point(linePos.fromPos.x, linePos.fromPos.y);
        this.linePoints[2] = new PIXI.Point(linePos.toPos.x, linePos.toPos.y);
        this.linePoints[3] = new PIXI.Point(linePos.toPos.x, linePos.toPos.y);

        this.updateFromLineJoint(this.from, 0, 0);
        this.updateToLineJoint(this.to, 0, 0);
        this.updateMiddleLinePoints();
        this.redraw();
    }

    private updateFromLineJoint(from: XEntity, xDelta: number, yDelta: number,
                                addDeltaToNewLineJoint: boolean = false): void {
        let rect: PIXI.Rectangle = from.getBodyRectangle();

        let rectPoints: PIXI.Point[] = getRectanglePoints(rect, -1);

        let toBeJoinPoint: PIXI.Point = new PIXI.Point(this.linePoints[0].x + xDelta, this.linePoints[0].y + yDelta);

        let result: any[] = [];
        for (let i: number = 0; 3 > i; ++i) {
            for (let j: number = 0; 4 > j; ++j) {
                let x: number = (j == 3 ? 0 : j + 1);
                if (i == 0) {
                    result.push(getLineIntersectPoint(toBeJoinPoint, this.linePoints[i + 1],
                        rectPoints[j], rectPoints[x]));
                } else {
                    result.push(getLineIntersectPoint(this.linePoints[i], this.linePoints[i + 1],
                        rectPoints[j], rectPoints[x]));
                }
            }
        }

        let toBeX: number = 0;
        let toBeY: number = 0;
        let toBeDirection: Direction = Direction.NONE;

        for (let i: number = 0; 12 > i; i += 4) {
            if (result[i + 0].intersected) {
                toBeX = calcCenterPos(rectPoints[0].x, rectPoints[1].x);
                toBeY = result[i + 0].y;
                toBeDirection = Direction.TOP;
            }

            if (result[i + 1].intersected) {
                toBeX = result[i + 1].x;
                toBeY = calcCenterPos(rectPoints[1].y, rectPoints[2].y);
                toBeDirection = Direction.RIGHT;
            }

            if (result[i + 2].intersected) {
                toBeX = calcCenterPos(rectPoints[2].x, rectPoints[3].x);
                toBeY = result[i + 2].y;
                toBeDirection = Direction.BOTTOM;
            }

            if (result[i + 3].intersected) {
                toBeX = result[i + 3].x;
                toBeY = calcCenterPos(rectPoints[3].y, rectPoints[0].y);
                toBeDirection = Direction.LEFT;
            }
        }

        if (toBeX == 0 && toBeY == 0) {
            toBeX = this.linePoints[0].x + xDelta;
            toBeY = this.linePoints[0].y + yDelta;
        } else if (addDeltaToNewLineJoint) {
            toBeX += xDelta;
            toBeY += yDelta;
        }

        if (toBeDirection == Direction.NONE) {
            toBeDirection = this.lineDirections[0];
        }

        if (this.lineMoveMode != LineMoveMode.NONE) {
            if (!(rectPoints[0].x + this.lineBoundarySize <= toBeX 
                && toBeX <= rectPoints[1].x - this.lineBoundarySize)) {
                toBeX -= xDelta;
            }

            if (!(rectPoints[0].y + this.lineBoundarySize <= toBeY 
                && toBeY <= rectPoints[3].y - this.lineBoundarySize)) {
                toBeY -= yDelta;
            }
        }

        this.linePoints[0].x = toBeX;
        this.linePoints[0].y = toBeY;
        this.lineDirections[0] = toBeDirection;
    }

    private updateToLineJoint(to: XEntity, xDelta: number, yDelta: number,
                              addDeltaToNewLineJoint: boolean = false): void {
        let rect: PIXI.Rectangle = to.getBodyRectangle();

        let rectPoints: PIXI.Point[] = getRectanglePoints(rect, -1);

        let toBeJoinPoint: PIXI.Point = new PIXI.Point(this.linePoints[3].x + xDelta, this.linePoints[3].y + yDelta);

        let result: any[] = [];
        for (let i: number = 3; 1 <= i; --i) {
            for (let j: number = 0; 4 > j; ++j) {
                let x: number = (j == 3 ? 0 : j + 1);
                if (i == 3) {
                    result.push(getLineIntersectPoint(this.linePoints[i - 1], toBeJoinPoint,
                        rectPoints[j], rectPoints[x]));
                } else {
                    result.push(getLineIntersectPoint(this.linePoints[i - 1], this.linePoints[i],
                        rectPoints[j], rectPoints[x]));
                }
            }
        }

        let toBeX: number = 0;
        let toBeY: number = 0;
        let toBeDirection: Direction = Direction.NONE;

        for (let i: number = 0; 12 > i; i += 4) {
            if (result[i + 0].intersected) {
                toBeX = calcCenterPos(rectPoints[0].x, rectPoints[1].x);
                toBeY = result[i + 0].y;
                toBeDirection = Direction.TOP;
            }

            if (result[i + 1].intersected) {
                toBeX = result[i + 1].x;
                toBeY = calcCenterPos(rectPoints[1].y, rectPoints[2].y);
                toBeDirection = Direction.RIGHT;
            }

            if (result[i + 2].intersected) {
                toBeX = calcCenterPos(rectPoints[2].x, rectPoints[3].x);
                toBeY = result[i + 2].y;
                toBeDirection = Direction.BOTTOM;
            }

            if (result[i + 3].intersected) {
                toBeX = result[i + 3].x;
                toBeY = calcCenterPos(rectPoints[3].y, rectPoints[0].y);
                toBeDirection = Direction.LEFT;
            }
        }

        if (toBeX == 0 && toBeY == 0) {
            toBeX = this.linePoints[3].x + xDelta;
            toBeY = this.linePoints[3].y + yDelta;
        } else if (addDeltaToNewLineJoint) {
            toBeX += xDelta;
            toBeY += yDelta;
        }

        if (toBeDirection == Direction.NONE) {
            toBeDirection = this.lineDirections[3];
        }

        if (this.lineMoveMode != LineMoveMode.NONE) {
            if (!(rectPoints[0].x + this.lineBoundarySize <= toBeX 
                && toBeX <= rectPoints[1].x - this.lineBoundarySize)) {
                toBeX -= xDelta;
            }

            if (!(rectPoints[0].y + this.lineBoundarySize <= toBeY 
                && toBeY <= rectPoints[3].y - this.lineBoundarySize)) {
                toBeY -= yDelta;
            }
        }

        this.linePoints[3].x = toBeX;
        this.linePoints[3].y = toBeY;
        this.lineDirections[3] = toBeDirection;
    }

    public updateLineJoint(target: XEntity, controlDirection: Direction,
                           xDelta: number, yDelta: number): void {
        if (target == this.from) {
            if (controlDirection == Direction.NONE) {
                this.updateFromLineJoint(target, xDelta, yDelta);
            } else {
                if (controlDirection == Direction.LEFT_TOP
                    && (this.lineDirections[0] == Direction.LEFT 
                        || this.lineDirections[0] == Direction.TOP)) {
                    if (this.lineDirections[0] == Direction.LEFT) {
                        yDelta = 0;
                    } else if (this.lineDirections[0] == Direction.TOP) {
                        xDelta = 0;
                    }
                    this.updateFromLineJoint(target, xDelta, yDelta, true);
                } else if (controlDirection == Direction.RIGHT_TOP
                    && (this.lineDirections[0] == Direction.RIGHT 
                        || this.lineDirections[0] == Direction.TOP)) {
                    if (this.lineDirections[0] == Direction.RIGHT) {
                        yDelta = 0;
                    } else if (this.lineDirections[0] == Direction.TOP) {
                        xDelta = 0;
                    }
                    this.updateFromLineJoint(target, xDelta, yDelta, true);
                } else if (controlDirection == Direction.LEFT_BOTTOM
                    && (this.lineDirections[0] == Direction.LEFT 
                        || this.lineDirections[0] == Direction.BOTTOM)) {
                    if (this.lineDirections[0] == Direction.LEFT) {
                        yDelta = 0;
                    } else if (this.lineDirections[0] == Direction.BOTTOM) {
                        xDelta = 0;
                    }
                    this.updateFromLineJoint(target, xDelta, yDelta, true);
                } else if (controlDirection == Direction.RIGHT_BOTTOM
                    && (this.lineDirections[0] == Direction.RIGHT 
                        || this.lineDirections[0] == Direction.BOTTOM)) {
                    if (this.lineDirections[0] == Direction.RIGHT) {
                        yDelta = 0;
                    } else if (this.lineDirections[0] == Direction.BOTTOM) {
                        xDelta = 0;
                    }
                    this.updateFromLineJoint(target, xDelta, yDelta, true);
                }
            }
            this.updateToLineJoint(this.to, 0, 0);
        } else if(target == this.to) {
            if (controlDirection == Direction.NONE) {
                this.updateToLineJoint(target, xDelta, yDelta);
            } else {
                if (controlDirection == Direction.LEFT_TOP
                    && (this.lineDirections[3] == Direction.LEFT 
                        || this.lineDirections[3] == Direction.TOP)) {
                    if (this.lineDirections[3] == Direction.LEFT) {
                        yDelta = 0;
                    } else if (this.lineDirections[3] == Direction.TOP) {
                        xDelta = 0;
                    }
                    this.updateToLineJoint(target, xDelta, yDelta, true);
                } else if (controlDirection == Direction.RIGHT_TOP
                    && (this.lineDirections[3] == Direction.RIGHT 
                        || this.lineDirections[3] == Direction.TOP)) {
                    if (this.lineDirections[3] == Direction.RIGHT) {
                        yDelta = 0;
                    } else if (this.lineDirections[3] == Direction.TOP) {
                        xDelta = 0;
                    }
                    this.updateToLineJoint(target, xDelta, yDelta, true);
                } else if (controlDirection == Direction.LEFT_BOTTOM
                    && (this.lineDirections[3] == Direction.LEFT 
                        || this.lineDirections[3] == Direction.BOTTOM)) {
                    if (this.lineDirections[3] == Direction.LEFT) {
                        yDelta = 0;
                    } else if (this.lineDirections[3] == Direction.BOTTOM) {
                        xDelta = 0;
                    }
                    this.updateToLineJoint(target, xDelta, yDelta, true);
                } else if (controlDirection == Direction.RIGHT_BOTTOM
                    && (this.lineDirections[3] == Direction.RIGHT 
                        || this.lineDirections[3] == Direction.BOTTOM)) {
                    if (this.lineDirections[3] == Direction.RIGHT) {
                        yDelta = 0;
                    } else if (this.lineDirections[3] == Direction.BOTTOM) {
                        xDelta = 0;
                    }
                    this.updateToLineJoint(target, xDelta, yDelta, true);
                }
            }
            this.updateFromLineJoint(this.from, 0, 0);
        }
    }
    
    public updateMiddleLinePoints() {
        if (
            (this.lineDirections[0] == Direction.LEFT || this.lineDirections[0] == Direction.RIGHT)
            && (this.lineDirections[3] == Direction.LEFT || this.lineDirections[3] == Direction.RIGHT)
        ) {
            let cx: number = calcCenterPos(this.linePoints[0].x, this.linePoints[3].x);
            
            this.linePoints[1].x = cx;
            this.linePoints[1].y = this.linePoints[0].y;
            this.linePoints[2].x = cx;
            this.linePoints[2].y = this.linePoints[3].y;
        } else if (
            (this.lineDirections[0] == Direction.LEFT || this.lineDirections[0] == Direction.RIGHT)
            && (this.lineDirections[3] == Direction.TOP || this.lineDirections[3] == Direction.BOTTOM)
        ) {
            this.linePoints[1].x = this.linePoints[3].x;
            this.linePoints[1].y = this.linePoints[0].y;
            this.linePoints[2].x = this.linePoints[3].x;
            this.linePoints[2].y = this.linePoints[0].y;
        } else if (
            (this.lineDirections[0] == Direction.TOP || this.lineDirections[0] == Direction.BOTTOM)
            && (this.lineDirections[3] == Direction.LEFT || this.lineDirections[3] == Direction.RIGHT)
        ) {
            this.linePoints[1].x = this.linePoints[0].x;
            this.linePoints[1].y = this.linePoints[3].y;
            this.linePoints[2].x = this.linePoints[0].x;
            this.linePoints[2].y = this.linePoints[3].y;
        } else {
            let cy: number = calcCenterPos(this.linePoints[0].y, this.linePoints[3].y);
            this.linePoints[1].x = this.linePoints[0].x;
            this.linePoints[1].y = cy;
            this.linePoints[2].x = this.linePoints[3].x;
            this.linePoints[2].y = cy;
        }
    }

    public isLineMoving(): boolean {
            return this.isFromLineMove || this.isToLineMove;
    }

    private updateHitArea(): void {
        this.hitArea = new PIXI.Polygon(this.linePoints);
    }

    private getEntityCenterLinePosEach(): any {
        let fromCenter: PIXI.Point = this.from.getCenterPos();
        let toCenter: PIXI.Point = this.to.getCenterPos();

        return {fromPos: fromCenter, toPos: toCenter};
    }

    private drawLine(): void {
        this.clear();

        this.lineStyle(1, 0x00, 1);

        let i: any;
        for (i in this.linePoints) {
            if (i == 0) {
                this.moveTo(this.linePoints[i].x, this.linePoints[i].y);
            } else if (!(this.linePoints[i - 1].x == this.linePoints[i].x 
                && this.linePoints[i - 1].y == this.linePoints[i].y)) {
                this.lineTo(this.linePoints[i].x, this.linePoints[i].y);
            }
        }

        if (this.useDebug) {
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
        }
    }

    private isMouseInFromLine(localPos: PIXI.Point) {
        let a: boolean = (this.linePoints[0].y - 5 <= localPos.y && localPos.y <= this.linePoints[1].y + 5)
            && ((this.linePoints[0].x <= localPos.x && localPos.x <= this.linePoints[1].x)
            || (this.linePoints[1].x <= localPos.x && localPos.x <= this.linePoints[0].x));

        let b: boolean = (this.linePoints[0].x - 5 <= localPos.x && localPos.x <= this.linePoints[1].x + 5)
            && ((this.linePoints[0].y <= localPos.y && localPos.y <= this.linePoints[1].y)
            || (this.linePoints[1].y <= localPos.y && localPos.y <= this.linePoints[0].y));
            
        return a || b;
    }

    private isMouseInToLine(localPos: PIXI.Point) {
        let a: boolean = (this.linePoints[3].y - 5 <= localPos.y && localPos.y <= this.linePoints[3].y + 5)
            && ((this.linePoints[2].x <= localPos.x && localPos.x <= this.linePoints[3].x)
            || (this.linePoints[3].x <= localPos.x && localPos.x <= this.linePoints[2].x));

        let b: boolean = (this.linePoints[3].x - 5 <= localPos.x && localPos.x <= this.linePoints[3].x + 5)
            && ((this.linePoints[2].y <= localPos.y && localPos.y <= this.linePoints[3].y)
            || (this.linePoints[3].y <= localPos.y && localPos.y <= this.linePoints[2].y));

        return a || b;
    }

    private updateMouseCursor(localPos: PIXI.Point) {
        if (this.isMouseInFromLine(localPos)) {
            if (this.linePoints[0].x == this.linePoints[1].x) {
                this.defaultCursor = "col-resize";
                this.lineMoveMode = LineMoveMode.COL;
            } else {
                this.defaultCursor = "row-resize";
                this.lineMoveMode = LineMoveMode.ROW;
            }
        } else if (this.isMouseInToLine(localPos)) {
            if (this.linePoints[2].x == this.linePoints[3].x) {
                this.defaultCursor = "col-resize";
                this.lineMoveMode = LineMoveMode.COL;
            } else {
                this.defaultCursor = "row-resize";
                this.lineMoveMode = LineMoveMode.ROW;
            }
        } else {
            this.defaultCursor = "default";
            this.lineMoveMode = LineMoveMode.NONE;
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
            this.updateMouseCursor(localPos);
        }

        if (this.dragging == DragState.DRAGGING && stage.getState() == State.SELECT) {
            let newPosition: PIXI.Point  = this.prevInteractionData.getLocalPosition(stage);

            let delta: any = getXYDelta(
                new PIXI.Point(newPosition.x, newPosition.y),
                new PIXI.Point(this.oldPosition.x, this.oldPosition.y)
            );

            this.oldPosition = newPosition;

            if (this.isFromLineMove) {
                if (this.lineMoveMode == LineMoveMode.ROW) {
                    this.updateLineJoint(this.from, Direction.NONE, 0, delta.y);
                } else {
                    this.updateLineJoint(this.from, Direction.NONE, delta.x, 0);
                }
                this.updateMiddleLinePoints();
                this.redraw();
            } else if (this.isToLineMove) {
                if (this.lineMoveMode == LineMoveMode.ROW) {
                    this.updateLineJoint(this.to, Direction.NONE, 0, delta.y);
                } else {
                    this.updateLineJoint(this.to, Direction.NONE, delta.x, 0);
                }
                this.updateMiddleLinePoints();
                this.redraw();
            }
        }
    }

}
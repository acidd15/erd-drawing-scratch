/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

import {XEntity} from "./entity";
import {XGraphics} from "./graphics";
import {DragState, State, Direction} from "./types";
import {XStage} from "./stage";

import {getHitRectangle, getXYDelta} from "./library";

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
            this.lineDirections[0] = Direction.NONE;
        }
    }

    private updateFromLine(from: XEntity, xDelta: number, yDelta: number): void {
        let rect: PIXI.Rectangle = from.getBodyRectangle();

        let toBeX: number = this.linePoints[0].x + xDelta;
        let toBeY: number = this.linePoints[0].y + yDelta;

        if (rect.y + 10 <= toBeY && toBeY <= rect.y + rect.height - 10) {
            this.linePoints[0].x = toBeX;
            this.linePoints[0].y = toBeY;
        }
    }

    private updateToLine(to: XEntity, xDelta: number, yDelta: number): void {
        let rect: PIXI.Rectangle = to.getBodyRectangle();

        let toBeX: number = this.linePoints[3].x + xDelta;
        let toBeY: number = this.linePoints[3].y + yDelta;

        if (rect.y + 10 <= toBeY && toBeY <= rect.y + rect.height - 10) {
            this.linePoints[3].x = toBeX;
            this.linePoints[3].y = toBeY;
        }
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
        } else {
            let linePos: any = this.getEntityCenterLinePos();
            this.linePoints[0] = linePos.fromPos;
            this.linePoints[3] = linePos.toPos;
        }

        let cx: number = this.calcCenterXPos(this.linePoints[0].x, this.linePoints[3].x);

        this.linePoints[1] = new PIXI.Point(cx, this.linePoints[0].y);
        this.linePoints[2] = new PIXI.Point(cx, this.linePoints[3].y);
    }

    public isLineMoving(): boolean {
            return this.isFromLineMove || this.isToLineMove;
    }

    private updateHitArea(): void {
        this.hitArea = getHitRectangle(this.linePoints[0], this.linePoints[3]);
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

        // from point
        this.beginFill(0xff, 0);
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
        this.beginFill(0xff, 0);
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
                this.redraw();
            } else if (this.isToLineMove) {
                this.updateLinePoints(this.to, Direction.NONE, 0, delta.y);
                this.redraw();
            }
        }
    }

}
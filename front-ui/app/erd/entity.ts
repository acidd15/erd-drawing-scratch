/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

import {XStage} from "./stage";
import {XLine} from "./line";
import {XGraphics} from "./graphics";
import {State, DragState, Direction} from "./types";

import {getXYDelta} from "./library";

export class XEntity extends XGraphics {
    private _width: number;
    private _height: number;
    private color: number;
    private minSize: any;
    private itemCount: number;
    private bodyContainer: PIXI.Graphics;
    private linePoints: XLine[];
    private _name: PIXI.Text;
    private isLeftTopSelected: boolean;
    private isRightTopSelected: boolean;
    private isLeftBottomSelected: boolean;
    private isRightBottomSelected: boolean;

    constructor(x: number, y: number, width: number, height: number, color: number) {
        super();

        this._width = width;
        this._height = height;

        this.position.set(x, y);

        this.color = color || 0xFF0000;
        this.minSize = {width: 50, height: 50};

        this.interactive = true;

        this.itemCount = 0;

        this.bodyContainer = new PIXI.Graphics();
        this.addChild(this.bodyContainer);

        this.linePoints = [];

        this.on("mousedown", this.onMouseDown);
        this.on("mouseup", this.onMouseUp);
        this.on("mouseupoutside", this.onMouseUpOutside);
        this.on("mousemove", this.onMouseMove);

        this.redraw();
    }

    public getWidth(): number {
        return this._width;
    }

    //@Override
    public redraw(): void {
        this.clear();
        this.drawBody();
        this.drawResizeHandle();
    }

    public setName(name: string): void {
        if (typeof this._name != "undefined") {
            this._name.text = name;
            return;
        }

        this._name = new PIXI.Text(
            name,
            <PIXI.ITextStyleStyle>{
                fontFamily: "Arial",
                fontSize: "11px",
                fill: "green",
                align: "left"
            }
        );

        this._name.position.set(0, -15);

        this.addChild(this._name);
    }

    /*
    private addItem(value: string): void {
        var t = new PIXI.Text(
            value,
            {
                fontFamily: 'Arial',
                fontSize: '11px',
                fill: 'green',
                align: 'left'
            }
        );

        t.position.set(5, this.itemCount * 15 + 5);
        // to prevent hit test
        t.containsPoint = () => false;

        this._height += 15;
        this.itemCount++;

        this.bodyContainer.addChild(t);
        this.redraw();
    }
    */

    public addLinePoint(obj: XLine): void {
        this.linePoints.push(obj);
    }

    public getLinePoints(): XLine[] {
        return this.linePoints;
    }

    public getBodyRectangle(): PIXI.Rectangle {
        let gPos: PIXI.Point = this.toGlobal(this.bodyContainer.position);
        return new PIXI.Rectangle(gPos.x, gPos.y, this.bodyContainer.width, this.bodyContainer.height);
    }

    private drawBody(): void {
        if (this.bodyContainer) {
            this.bodyContainer.clear();
            this.bodyContainer.beginFill(this.color, 1);
            this.bodyContainer.lineStyle(1, 0x00, 1);
            this.bodyContainer.drawRect(0, 0, this._width, this._height);
            this.bodyContainer.endFill();

            this.clipBodyContainer();
        }
    }

    private clipBodyContainer(): void {
        let clip: PIXI.Graphics = <PIXI.Graphics>this.bodyContainer.mask;

        if (!clip) {
            clip = new PIXI.Graphics();
        }

        let p: PIXI.Point = this.toGlobal(this.bodyContainer.position);

        clip.clear();
        clip.beginFill(this.color, 1);
        clip.drawRect(p.x -1, p.y, this._width +1, this._height +1);
        clip.endFill();

        this.bodyContainer.mask = clip;
    }

    private drawResizeHandle(): void {
        if (this.isSelected()) {
            this.beginFill(0x00, 1);

            let lt: PIXI.Rectangle = this.getLeftTopHandleRect();
            let rt: PIXI.Rectangle = this.getRightTopHandleRect();
            let lb: PIXI.Rectangle = this.getLeftBottomHandleRect();
            let rb: PIXI.Rectangle = this.getRightBottomHandleRect();

            this.drawRect(lt.x, lt.y, lt.width, lt.height);
            this.drawRect(rt.x, rt.y, rt.width, rt.height);
            this.drawRect(lb.x, lb.y, lb.width, lb.height);
            this.drawRect(rb.x, rb.y, rb.width, rb.height);

            this.endFill();
        }
    }

    public getCenterPos(): PIXI.Point {
        let cx = this.position.x + Math.ceil(this._width /2);
        let cy = this.position.y + Math.ceil(this._height /2);

        return new PIXI.Point(cx, cy);
    }

    private getLeftTopHandleRect(): PIXI.Rectangle {
        return new PIXI.Rectangle(-10, -10, 10, 10);
    }

    private getRightTopHandleRect(): PIXI.Rectangle {
        return new PIXI.Rectangle(this._width, -10, 10, 10);
    }

    private getLeftBottomHandleRect(): PIXI.Rectangle {
        return new PIXI.Rectangle(-10, this._height, 10, 10);
    }

    private getRightBottomHandleRect(): PIXI.Rectangle {
        return new PIXI.Rectangle(this._width, this._height, 10, 10);
    }

    /*
    private isResizeHandle(pos: PIXI.Point): boolean {
        if (
            this.isPosInLeftTop(pos)
            || this.isPosInRightTop(pos)
            || this.isPosInLeftBottom(pos)
            || this.isPosInRightBottom(pos)
        ) {
            return true;
        }
        return false;
    }
    */

    private isPosInRect(rect: PIXI.Rectangle, pos: PIXI.Point): boolean {
        if (
            (rect.x <= pos.x && pos.x <= rect.x + rect.width)
            && (rect.y <= pos.y && pos.y <= rect.y + rect.width)
        ) {
            return true;
        }
        return false;
    }

    private isPosInLeftTop(pos: PIXI.Point): boolean {
        let lt: PIXI.Rectangle = this.getLeftTopHandleRect();
        return this.isPosInRect(lt, pos);
    }

    private isPosInRightTop(pos: PIXI.Point): boolean {
        let rt: PIXI.Rectangle = this.getRightTopHandleRect();
        return this.isPosInRect(rt, pos);
    }

    private isPosInLeftBottom(pos: PIXI.Point): boolean {
        let lb: PIXI.Rectangle = this.getLeftBottomHandleRect();
        return this.isPosInRect(lb, pos);
    }

    private isPosInRightBottom(pos: PIXI.Point): boolean {
        let rb: PIXI.Rectangle = this.getRightBottomHandleRect();
        return this.isPosInRect(rb, pos);
    }

    public moveEntity(xDelta: number, yDelta: number): void {
        this.position.x += xDelta;
        this.position.y += yDelta;
    }

    private getCurrentControlDirection(): Direction {
        if (this.isLeftTopSelected) {
            return Direction.LEFT_TOP;
        } else if (this.isRightTopSelected) {
            return Direction.RIGHT_TOP;
        } else if (this.isLeftBottomSelected) {
            return Direction.LEFT_BOTTOM;
        } else if (this.isRightBottomSelected) {
            return Direction.RIGHT_BOTTOM;
        } else {
            return Direction.NONE;
        }
    }

    private getMinMaxLinePosition() {
        let p: any = {
            x : {
                min: -1,
                max: -1
            },
            y : {
                min: -1,
                max: -1
            }
        };

        for (let v of this.linePoints) {
            let pos: PIXI.Point = v.getPoint(this);
            let dir: Direction = v.getDirection(this);
            if (dir == Direction.TOP || dir == Direction.BOTTOM) {
                if (p.x.min > pos.x || p.x.min == -1) p.x.min = pos.x;
                if (p.x.max < pos.x || p.x.max == -1) p.x.max = pos.x;
            } else if (dir == Direction.LEFT || dir == Direction.RIGHT) {
                if (p.y.min > pos.y || p.y.min == -1) p.y.min = pos.y;
                if (p.y.max < pos.y || p.y.max == -1) p.y.max = pos.y;
            }
        }

        return p;
    }

    private resizeEntity(xDelta: number, yDelta: number, wDelta: number, hDelta: number): void {
        this.position.x += xDelta;
        this._width += wDelta;
        this.position.y += yDelta;
        this._height += hDelta;
    }

    public updateLinePoses(xDelta: number, yDelta: number): void {
        if (this.linePoints) {
            let controlDirection: Direction = this.getCurrentControlDirection();
            for (let v of this.linePoints) {
                v.updateLinePoints(this, controlDirection, xDelta, yDelta);
                v.updateLineDirections();
                v.updateCenterLinePoints();
                v.redraw();
            }
        }
    }

    private setResizeHandleSelection(lPos: PIXI.Point): void {
        if (this.isPosInLeftTop(lPos)) {
            this.isLeftTopSelected = true;
        } else if (this.isPosInRightTop(lPos)) {
            this.isRightTopSelected = true;
        } else if (this.isPosInLeftBottom(lPos)) {
            this.isLeftBottomSelected = true;
        } else if (this.isPosInRightBottom(lPos)) {
            this.isRightBottomSelected = true;
        }
    }

    private unsetResizeHandleSelection(): void {
        this.isLeftTopSelected = false;
        this.isRightTopSelected = false;
        this.isLeftBottomSelected = false;
        this.isRightBottomSelected = false;
    }

    private isAnyResizeHandleSelected(): boolean {
        return this.isLeftTopSelected
            || this.isRightTopSelected
            || this.isLeftBottomSelected
            || this.isRightBottomSelected;
    }

    private calculateDeltaBaseOnLinePoint(p: any, pos: PIXI.Point, delta: any): any {
        if (p.x.min > 0 && p.x.max > 0) {
            if (p.x.min - 50 <= pos.x && pos.x <= p.x.max + 50) {
                delta.x = 0;
            }

            if ((this.isRightTopSelected || this.isRightBottomSelected) && pos.x < p.x.min) {
                delta.x = 0;
            } else if ((this.isLeftTopSelected || this.isLeftBottomSelected) && pos.x > p.x.max) {
                delta.x = 0;
            }
        }

        if (p.y.min > 0 && p.y.max > 0) {
            if (p.y.min - 50 <= pos.y && pos.y <= p.y.max + 50) {
                delta.y = 0;
            }

            if ((this.isLeftBottomSelected || this.isRightBottomSelected) && pos.y < p.y.min) {
                delta.y = 0;
            } else if ((this.isLeftTopSelected || this.isRightTopSelected) && pos.y > p.y.max) {
                delta.y = 0;
            }
        }

        return delta;
    }

    private calculateDeltaBaseOnEntityBox(delta: any): any {
        if (this.isLeftTopSelected) {
            delta.width = -1 * delta.x;
            delta.height = -1 * delta.y;
        } else if (this.isRightTopSelected) {
            delta.width = delta.x;
            delta.height = -1 * delta.y;
            delta.x = 0;
        } else if (this.isLeftBottomSelected) {
            delta.width = -1 * delta.x;
            delta.height = delta.y;
            delta.y = 0;
        } else if (this.isRightBottomSelected) {
            delta.width = delta.x;
            delta.height = delta.y;
            delta.x = 0;
            delta.y = 0;
        } else {
            delta.x = 0;
            delta.y = 0;
        }

        if (!(this.minSize.width <= this._width + delta.width)) {
            delta.x = 0;
            delta.width = 0;
        }

        if (!(this.minSize.height <= this._height + delta.height)) {
            delta.y = 0;
            delta.height = 0;
        }

        return delta;
    }

    private calculateResizeBound(pos: PIXI.Point, delta: any): any {
        let p: any = this.getMinMaxLinePosition();

        delta = this.calculateDeltaBaseOnLinePoint(p, pos, delta);
        delta = this.calculateDeltaBaseOnEntityBox(delta);

        return delta;
    }

    protected onMouseDown(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseDown(evt);

        this.bringToFront();

        let lPos: PIXI.Point = this.toLocal(evt.data.global);
        this.setResizeHandleSelection(lPos);

        this.setSelected(true);

        this.redraw();

    }

    protected onMouseUp(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseUp(evt);

        this.unsetResizeHandleSelection();

        this.redraw();
    }

    protected onMouseUpOutside(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseUpOutside(evt);

        this.unsetResizeHandleSelection();

        this.redraw();
    }

    protected onMouseMove(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseMove(evt);

        let stage: XStage = <XStage>this.parent;

        if (this.dragging == DragState.DRAGGING && stage.getState() == State.SELECT) {
            let newPosition: PIXI.Point = this.prevInteractionData.getLocalPosition(stage);

            let delta: any = getXYDelta(
                new PIXI.Point(newPosition.x, newPosition.y),
                new PIXI.Point(this.oldPosition.x, this.oldPosition.y)
            );

            this.oldPosition = newPosition;

            if (this.isAnyResizeHandleSelected()) {
                delta = this.calculateResizeBound(newPosition, delta);
                this.resizeEntity(delta.x, delta.y, delta.width, delta.height);
                this.updateLinePoses(delta.x || delta.width, delta.y || delta.height);
            } else {
                this.moveEntity(delta.x, delta.y);
                stage.moveSelectedEntityGroup(delta.x, delta.y);
                this.updateLinePoses(delta.x, delta.y);
            }

            this.redraw();
        }
    }
}
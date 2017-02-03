/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

import {XResizeGuide} from "./guide";
require("module/pixijs-4.3.0/pixi.js");

import {XStage} from "./stage";
import {XLine} from "./line";
import {XGraphics} from "./graphics";
import {State, DragState, Direction} from "./types";

import {getXYDelta, calcCenterPosByWidth} from "./library";

export class XEntity extends XGraphics {
    private bodyContainerWidth: number;
    private bodyContainerHeight: number;
    private color: number;
    private minSize: any;
    private itemCount: number;
    private itemWidthMax: number;
    private itemHeight: number;
    private bodyContainer: PIXI.Graphics;
    private jointLines: XLine[];
    private entityName: PIXI.Text;
    private selectedResizeHandle: Direction;
    private resizeHandleSize: number;
    private resizeGuide: XResizeGuide;
    private bodyContainerYPosAdj: number;
    private useDebug: boolean;

    constructor(x: number, y: number, width: number, height: number, color: number) {
        super();

        this.useDebug = false;

        this.position.set(x, y);

        this.color = color || 0xFF0000;
        this.minSize = {width: 50, height: 50};

        this.bodyContainerWidth = this.minSize.width;
        this.bodyContainerHeight = this.minSize.height;

        this.interactive = true;

        this.resizeHandleSize = 10;

        this.itemCount = 0;
        this.itemWidthMax = 0;
        this.itemHeight = 15;

        this.resizeGuide = undefined;

        this.selectedResizeHandle = Direction.NONE;
        this.bodyContainerYPosAdj = 15;

        this.bodyContainer = new PIXI.Graphics();
        this.bodyContainer.position.set(0, this.bodyContainerYPosAdj);
        this.addChild(this.bodyContainer);

        this.jointLines = [];

        this.on("mousedown", this.onMouseDown);
        this.on("mouseup", this.onMouseUp);
        this.on("mouseupoutside", this.onMouseUpOutside);
        this.on("mousemove", this.onMouseMove);

        this.redraw();
    }

    //@Override
    public redraw(): void {
        this.clear();

        if (this.useDebug) {
            this.lineStyle(1, 0xff00ff, 1);
            let d: any = this.toLocal(new PIXI.Point(this.x, this.y));
            this.drawRect(d.x, d.y, this.width, this.height);

            this.lineStyle(1, 0xffff00, 1);
            this.drawRect(this.bodyContainer.x, this.bodyContainer.y, this.bodyContainerWidth, this.bodyContainerHeight);
        }

        this.drawBody();
        this.drawResizeHandle();
    }

    public setName(name: string): void {
        if (typeof this.entityName != "undefined") {
            this.entityName.text = name;
            return;
        }

        this.entityName = new PIXI.Text(
            name,
            <PIXI.ITextStyleStyle>{
                fontFamily: "Arial",
                fontSize: "11px",
                fill: "green",
                align: "left"
            }
        );

        this.entityName.position.set(0, 0);

        this.addChild(this.entityName);
    }

    public addItem(value: string): void {
        var t = new PIXI.Text(
            value,
            {
                fontFamily: 'Arial',
                fontSize: '11px',
                fill: 'green',
                align: 'left'
            }
        );

        t.position.set(5, this.itemCount * this.itemHeight);
        // to prevent hit test
        t.containsPoint = () => false;

        this.itemCount++;

        this.bodyContainer.addChild(t);

        let prevWidth: number = this.bodyContainerWidth;
        let prevHeight: number = this.bodyContainerHeight;

        this.updateBodyContainerWidthHeight();

        this.updateLinePoses(this.bodyContainerWidth - prevWidth, this.bodyContainerHeight - prevHeight,
            Direction.RIGHT_BOTTOM);

        this.redraw();
    }

    private updateBodyContainerWidthHeight() {
        if (this.bodyContainer.width > this.bodyContainerWidth) {
            this.bodyContainerWidth = this.bodyContainer.width;
        }

        if (this.bodyContainer.height > this.bodyContainerHeight) {
            this.bodyContainerHeight = this.bodyContainer.height;
        }
    }

    public removeItems() {
        this.bodyContainer.removeChildren();
        this.itemCount = 0;
        this.itemWidthMax = this.width;

        this.redraw();
    }

    public getItems(): string[] {
        let data: string[] = [];
        for (let v of this.bodyContainer.children) {
            data.push((<PIXI.Text>v).text)
        }
        return data;
    }

    public addLinePoint(obj: XLine): void {
        this.jointLines.push(obj);
    }

    public getLinePoints(): XLine[] {
        return this.jointLines;
    }

    public getBodyRectangle(): PIXI.Rectangle {
        let gPos: PIXI.Point = this.toGlobal(this.bodyContainer.position);
        return new PIXI.Rectangle(gPos.x, gPos.y, this.bodyContainerWidth, this.bodyContainerHeight);
    }

    private drawBody(): void {
        if (this.bodyContainer) {
            this.bodyContainer.clear();
            this.bodyContainer.beginFill(this.color, 1);
            this.bodyContainer.lineStyle(1, 0x00, 1);
            this.bodyContainer.drawRect(0, 0, this.bodyContainerWidth, this.bodyContainerHeight);
            this.bodyContainer.endFill();
        }
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
        let cx = calcCenterPosByWidth(this.position.x, this.width);
        let cy = calcCenterPosByWidth(this.position.y, this.height);

        return new PIXI.Point(cx, cy);
    }

    private getLeftTopHandleRect(): PIXI.Rectangle {
        return new PIXI.Rectangle(-10, -10, 10, 10);
    }

    private getRightTopHandleRect(): PIXI.Rectangle {
        return new PIXI.Rectangle(this.width, -10, 10, 10);
    }

    private getLeftBottomHandleRect(): PIXI.Rectangle {
        return new PIXI.Rectangle(-10, this.height, 10, 10);
    }

    private getRightBottomHandleRect(): PIXI.Rectangle {
        return new PIXI.Rectangle(this.width, this.height, 10, 10);
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
        return this.isPosInRect(rt, new PIXI.Point(pos.x + 20, pos.y));
    }

    private isPosInLeftBottom(pos: PIXI.Point): boolean {
        let lb: PIXI.Rectangle = this.getLeftBottomHandleRect();
        return this.isPosInRect(lb, new PIXI.Point(pos.x, pos.y + 20));
    }

    private isPosInRightBottom(pos: PIXI.Point): boolean {
        let rb: PIXI.Rectangle = this.getRightBottomHandleRect();
        return this.isPosInRect(rb, new PIXI.Point(pos.x + 20, pos.y + 20));
    }

    public moveEntity(xDelta: number, yDelta: number): void {
        this.position.x += xDelta;
        this.position.y += yDelta;
    }

    private getCurrentControlDirection(): Direction {
        return this.selectedResizeHandle;
    }

    private getMinMaxLinePosition() {
        let p: any = {
            x : { min: -1, max: -1 },
            y : { min: -1, max: -1 }
        };

        for (let v of this.jointLines) {
            let pos: PIXI.Point = v.getJoinPoint(this);
            let dir: Direction = v.getJoinDirection(this);
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

    public resizeEntity(xDelta: number, yDelta: number, wDelta?: number, hDelta?: number): void {
        this.position.x += xDelta;
        this.position.y += yDelta;

        if (!(wDelta == undefined && hDelta == undefined)) {
            this.bodyContainerWidth += wDelta;
            this.bodyContainerHeight += hDelta;

            this.visible = false;
            this.redraw();

            this.updateBodyContainerWidthHeight();

            this.visible = true;
            this.redraw();
        }
    }

    public updateLinePoses(xDelta: number, yDelta: number, controlDirection?: Direction): void {
        if (this.jointLines) {
            if (controlDirection == undefined) {
                controlDirection = this.getCurrentControlDirection();
            }
            for (let v of this.jointLines) {
                v.updateLineJoint(this, controlDirection, xDelta, yDelta);
                v.updateMiddleLinePoints();
                v.redraw();
            }
        }
    }

    private setResizeHandleSelection(lPos: PIXI.Point): void {
        if (this.isPosInLeftTop(lPos)) {
            this.selectedResizeHandle = Direction.LEFT_TOP;
        } else if (this.isPosInRightTop(lPos)) {
            this.selectedResizeHandle = Direction.RIGHT_TOP;
        } else if (this.isPosInLeftBottom(lPos)) {
            this.selectedResizeHandle = Direction.LEFT_BOTTOM;
        } else if (this.isPosInRightBottom(lPos)) {
            this.selectedResizeHandle = Direction.RIGHT_BOTTOM;
        } else {
            this.unsetResizeHandleSelection();
        }
    }

    private unsetResizeHandleSelection(): void {
        this.selectedResizeHandle = Direction.NONE;
    }

    private isAnyResizeHandleSelected(): boolean {
        return this.selectedResizeHandle != Direction.NONE;
    }

    private isRightSideResizeHandleSelected(): boolean {
        return this.selectedResizeHandle == Direction.RIGHT_TOP
            || this.selectedResizeHandle == Direction.RIGHT_BOTTOM;
    }

    private isLeftSideResizeHandleSelected(): boolean {
        return this.selectedResizeHandle == Direction.LEFT_TOP
            || this.selectedResizeHandle == Direction.LEFT_BOTTOM;
    }

    private isTopSideResizeHandleSelected(): boolean {
        return this.selectedResizeHandle == Direction.LEFT_TOP
            || this.selectedResizeHandle == Direction.RIGHT_TOP;
    }

    private isBottomSideResizeHandleSelected(): boolean {
        return this.selectedResizeHandle == Direction.LEFT_BOTTOM
            || this.selectedResizeHandle == Direction.RIGHT_BOTTOM;
    }

    private calculateDeltaBaseOnLinePoint(p: any, pos: PIXI.Point, delta: any): any {
        if (p.x.min > 0 && p.x.max > 0) {
            if (p.x.min - 50 <= pos.x && pos.x <= p.x.max + 50) {
                delta.x = 0;
            }

            if ((this.isRightSideResizeHandleSelected()) && pos.x < p.x.min) {
                delta.x = 0;
            } else if ((this.isLeftSideResizeHandleSelected()) && pos.x > p.x.max) {
                delta.x = 0;
            }
        }

        if (p.y.min > 0 && p.y.max > 0) {
            if (p.y.min - 50 <= pos.y && pos.y <= p.y.max + 50) {
                delta.y = 0;
            }

            if ((this.isBottomSideResizeHandleSelected()) && pos.y < p.y.min) {
                delta.y = 0;
            } else if ((this.isTopSideResizeHandleSelected()) && pos.y > p.y.max) {
                delta.y = 0;
            }
        }

        return delta;
    }

    private calculateDeltaBaseOnEntityBox(delta: any): any {
        if (this.selectedResizeHandle == Direction.LEFT_TOP) {
            delta.width = -1 * delta.x;
            delta.height = -1 * delta.y;
        } else if (this.selectedResizeHandle == Direction.RIGHT_TOP) {
            delta.width = delta.x;
            delta.height = -1 * delta.y;
            delta.x = 0;
        } else if (this.selectedResizeHandle == Direction.LEFT_BOTTOM) {
            delta.width = -1 * delta.x;
            delta.height = delta.y;
            delta.y = 0;
        } else if (this.selectedResizeHandle == Direction.RIGHT_BOTTOM) {
            delta.width = delta.x;
            delta.height = delta.y;
            delta.x = 0;
            delta.y = 0;
        } else {
            delta.x = 0;
            delta.y = 0;
        }

        if (!(this.minSize.width <= this.width + delta.width)) {
            delta.x = 0;
            delta.width = 0;
        }

        if (!(this.minSize.height <= this.height + delta.height)) {
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

        if (this.parent instanceof XStage) {
            if (!this.isSelected() && (<XStage>this.parent).getState() == State.SELECT) {
                (<XStage>this.parent).deselect([]);
            }

            if (this.isAnyResizeHandleSelected()) {
                this.resizeGuide = (<XStage>this.parent).createResizeGuide(this);
            } else {
                this.setSelected(true);
                this.resizeGuide = (<XStage>this.parent).createResizeGuide();
            }
        }

        this.setSelected(true);

        this.redraw();
    }

    protected onMouseUp(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseUp(evt);

        if (this.parent instanceof XStage && this.resizeGuide) {
            let _self = this;
            if (this.isAnyResizeHandleSelected()) {
                (<XStage>this.parent).commitResizeGuide(this.resizeGuide, (delta: any) => {
                    _self.resizeEntity(delta.x, delta.y, delta.width, delta.height);
                    _self.updateLinePoses(delta.x || delta.width, delta.y || delta.height);
                });
            } else {
                (<XStage>this.parent).commitResizeGuide(this.resizeGuide, (delta: any) => {
                    _self.resizeEntity(delta.x, delta.y);
                    _self.updateLinePoses(delta.x, delta.y);
                    (<XStage>_self.parent).moveSelectedEntityGroup(delta.x, delta.y);
                });
            }
            this.resizeGuide = undefined;
        }

        this.unsetResizeHandleSelection();

        this.redraw();
    }

    protected onMouseUpOutside(evt: PIXI.interaction.InteractionEvent): void {
        super.onMouseUpOutside(evt);

        if (this.parent instanceof XStage && this.resizeGuide) {
            let _self = this;
            if (this.isAnyResizeHandleSelected()) {
                (<XStage>this.parent).commitResizeGuide(this.resizeGuide, (delta: any) => {
                    _self.resizeEntity(delta.x, delta.y, delta.width, delta.height);
                    _self.updateLinePoses(delta.x || delta.width, delta.y || delta.height);
                });
            } else {
                (<XStage>this.parent).commitResizeGuide(this.resizeGuide, (delta: any) => {
                    _self.resizeEntity(delta.x, delta.y);
                    _self.updateLinePoses(delta.x, delta.y);
                    (<XStage>(_self.parent)).moveSelectedEntityGroup(delta.x, delta.y);
                });
            }
            this.resizeGuide = undefined;
        }

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

            if (this.resizeGuide) {
                if (this.isAnyResizeHandleSelected()) {
                    delta = this.calculateResizeBound(newPosition, delta);
                    this.resizeGuide.resize(delta.x, delta.y, delta.width, delta.height);
                } else {
                    this.resizeGuide.resize(delta.x, delta.y, 0, 0);
                }
            }

            this.redraw();
        }
    }
}
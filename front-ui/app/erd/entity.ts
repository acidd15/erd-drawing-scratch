/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

import {XStage} from "./stage";
import {XLine} from "./line";
import {XGraphics} from "./graphics";
import {State, EventType, DragState} from "./types";

import {getXYDelta} from "./library";

export class XEntity extends XGraphics {
    private _width: number;
    private _height: number;
    private color: number;
    //private minSize: any;
    private itemCount: number;
    private bodyContainer: PIXI.Graphics;
    private linePoints: XLine[];
    private _name: PIXI.Text;
    private dragging: DragState;
    private isLeftTopSelected: boolean;
    private isRightTopSelected: boolean;
    private isLeftBottomSelected: boolean;
    private isRightBottomSelected: boolean;
    private data: any;
    private oldPosition: any;

    constructor(x: number, y: number, width: number, height: number, color: number) {
        super();

        this._width = width;
        this._height = height;

        this.position.set(x, y);

        this.color = color || 0xFF0000;
        //this.minSize = {width: 50, height: 50};

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

    public addLinePoint(obj: any): void {
        this.linePoints.push(obj);
    }

    public getLinePoints(): any {
        return this.linePoints;
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

    private clipBodyContainer() {
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

            let lt: any = this.getLeftTopHandleRect();
            let rt: any = this.getRightTopHandleRect();
            let lb: any = this.getLeftBottomHandleRect();
            let rb: any = this.getRightBottomHandleRect();

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

    private getLeftTopHandleRect(): Object{
        return {
            x: -10,
            y: -10,
            width: 10,
            height: 10
        };
    }

    private getRightTopHandleRect(): Object {
        return {
            x: this._width,
            y: -10,
            width: 10,
            height: 10
        };
    }

    private getLeftBottomHandleRect(): Object {
        return {
            x: -10,
            y: this._height,
            width: 10,
            height: 10
        };
    }

    private getRightBottomHandleRect(): Object {
        return {
            x: this._width,
            y: this._height,
            width: 10,
            height: 10
        };
    }

    /*
    private isResizeHandle(pos: any): boolean {
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

    private isPosInRect(rect: any, pos: any): boolean {
        if (
            (rect.x <= pos.x && pos.x <= rect.x + rect.width)
            && (rect.y <= pos.y && pos.y <= rect.y + rect.width)
        ) {
            return true;
        }
        return false;
    }

    private isPosInLeftTop(pos: any): boolean {
        let lt: any = this.getLeftTopHandleRect();
        return this.isPosInRect(lt, pos);
    }

    private isPosInRightTop(pos: any): boolean {
        let rt: any = this.getRightTopHandleRect();
        return this.isPosInRect(rt, pos);
    }

    private isPosInLeftBottom(pos: any): boolean {
        let lb: any = this.getLeftBottomHandleRect();
        return this.isPosInRect(lb, pos);
    }

    private isPosInRightBottom(pos: any): boolean {
        let rb: any = this.getRightBottomHandleRect();
        return this.isPosInRect(rb, pos);
    }

    public moveEntity(x: number, y: number): void {
        this.position.x += x;
        this.position.y += y;
    }

    private resizeEntity(x: number, y: number): void {
        if (this.isLeftTopSelected) {
            this.position.x += x;
            this.position.y += y;
            this._width += (-1 * x);
            this._height += (-1 * y);
        } else if (this.isRightTopSelected) {
            this.position.y += y;
            this._width += x;
            this._height += (-1 * y);
        } else if (this.isLeftBottomSelected) {
            this.position.x += x;
            this._width += (-1 * x);
            this._height += y;
        } else if (this.isRightBottomSelected) {
            this._width += x;
            this._height += y;
        }
    }

    public updateLinePoses(): void {
        if (this.linePoints) {
            let i: any;
            for (i in this.linePoints) {
                this.linePoints[i].updateLinePos();
            }
        }
    }

    private onMouseDown(evt: any): void {
        this.bringToFront();

        this.data = evt.data;

        var lPos = this.toLocal(evt.data.global);

        if (this.isPosInLeftTop(lPos)) {
            this.isLeftTopSelected = true;
        } else if (this.isPosInRightTop(lPos)) {
            this.isRightTopSelected = true;
        } else if (this.isPosInLeftBottom(lPos)) {
            this.isLeftBottomSelected = true;
        } else if (this.isPosInRightBottom(lPos)) {
            this.isRightBottomSelected = true;
        }

        this.oldPosition = this.data.getLocalPosition(<XStage>this.parent);

        this.setSelected(true);

        this.dragging = DragState.READY;

        this.redraw();

    }

    private onMouseUp(evt: any): any {
        this.dragging = DragState.ENDED;
        this.isLeftTopSelected = false;
        this.isRightTopSelected = false;
        this.isLeftBottomSelected = false;
        this.isRightBottomSelected = false;
        this.redraw();
    }

    private onMouseUpOutside(evt: any): any {
        this.dragging = DragState.ENDED;
        this.setSelected(false);
        this.redraw();
    }

    public onMouseMove(evt: any): any {
        if (this.dragging == DragState.READY) {
            this.dragging = DragState.DRAGGING;
        }

        let stage: XStage = <XStage>this.parent;

        if (this.dragging == DragState.DRAGGING && stage.getState() == State.SELECT) {
            let newPosition: any  = this.data.getLocalPosition(stage);

            let delta: any = getXYDelta(
                newPosition.x, newPosition.y,
                this.oldPosition.x, this.oldPosition.y
            );

            if (
                this.isLeftTopSelected
                || this.isRightTopSelected
                || this.isLeftBottomSelected
                || this.isRightBottomSelected
            ) {
                this.resizeEntity(delta.x, delta.y);
            } else {
                this.moveEntity(delta.x, delta.y);
                stage.moveSelectedEntity(delta.x, delta.y);
            }

            this.updateLinePoses();

            this.oldPosition = newPosition;

            this.redraw();
        }
    }
}
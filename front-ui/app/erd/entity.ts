/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require('module/pixijs-4.3.0/pixi.js');

import {XStage} from "./stage";
import {XLine} from './line';
import {XGraphics} from "./graphics";
import {State, EventType} from './const';

import {clickAndDblClickHandler, getXYDelta} from "./library";

import DisplayObject = PIXI.DisplayObject;
import Point = PIXI.Point;
import ITextStyleStyle = PIXI.ITextStyleStyle;

export class XEntity extends XGraphics {
    private __width: number;
    private __height: number;
    private color: number;
    //private minSize: any;
    private itemCount: number;
    private bodyContainer: PIXI.Graphics;
    private linePoints: XLine[];
    private _name: PIXI.Text;
    private _dragging: boolean;
    private isLeftTopSelected: boolean;
    private isRightTopSelected: boolean;
    private isLeftBottomSelected: boolean;
    private isRightBottomSelected: boolean;
    private data: any;
    private oldPosition: any;

    constructor(x: number, y: number, width: number, height: number, color: number) {
        super();

        this.__width = width;
        this.__height = height;

        this.position.set(x, y);

        this.color = color || 0xFF0000;
        //this.minSize = {width: 50, height: 50};

        this.interactive = true;

        this.itemCount = 0;

        this.bodyContainer = new PIXI.Graphics();
        this.addChild(this.bodyContainer);

        this.linePoints = [];

        this.on('mousedown', (evt:any) => this.onMouseDown(evt));
        this.on('mouseup', (evt:any) => this.onMouseUp(evt));
        this.on('mouseupoutside', (evt:any) => this.onMouseUpOutside(evt));
        this.on('mousemove', (evt:any) => this.onMouseMove(evt));

        this.redraw();
    }

    public get _width(): number {
        return this.__width;
    }

    public get _height(): number {
        return this.__height;
    }

    public get dragging(): boolean {
        return this._dragging;
    }

    public set dragging(v: boolean) {
        this._dragging = v;
    }

    /*
    private getName(): string {
        return this._name.text;
    }

    private getItems(): DisplayObject[] {
        return this.bodyContainer.children;
    }
    */

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

        var t = new PIXI.Text(
            name,
            <ITextStyleStyle>{
                fontFamily: 'Arial',
                fontSize: '11px',
                fill: 'green',
                align: 'left'
            }
        );

        t.position.set(0, -15);

        this.addChild(t);

        this._name = t;
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

        this.__height += 15;
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
            this.bodyContainer.drawRect(0, 0, this.__width, this.__height);
            this.bodyContainer.endFill();

            this.clipBodyContainer();
        }
    }

    private clipBodyContainer() {
        let clip: PIXI.Graphics = <PIXI.Graphics>this.bodyContainer.mask;

        if (!clip) {
            clip = new PIXI.Graphics();
        }

        let d: Point = this.toGlobal(this.bodyContainer.position);

        clip.clear();
        clip.beginFill(this.color, 1);
        clip.drawRect(d.x -1, d.y, this.__width +1, this.__height +1);
        clip.endFill();

        this.bodyContainer.mask = clip;
    }

    private drawResizeHandle(): void {
        if (this.selected) {
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
        let cx = this.position.x + Math.ceil(this.__width /2);
        let cy = this.position.y + Math.ceil(this.__height /2);

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
            x: this.__width,
            y: -10,
            width: 10,
            height: 10
        };
    }

    private getLeftBottomHandleRect(): Object {
        return {
            x: -10,
            y: this.__height,
            width: 10,
            height: 10
        };
    }

    private getRightBottomHandleRect(): Object {
        return {
            x: this.__width,
            y: this.__height,
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
            this.__width += (-1 * x);
            this.__height += (-1 * y);
        } else if (this.isRightTopSelected) {
            this.position.y += y;
            this.__width += x;
            this.__height += (-1 * y);
        } else if (this.isLeftBottomSelected) {
            this.position.x += x;
            this.__width += (-1 * x);
            this.__height += y;
        } else if (this.isRightBottomSelected) {
            this.__width += x;
            this.__height += y;
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

        // {{{
        let stage: XStage = <XStage>this.parent;

        this.oldPosition = this.data.getLocalPosition(stage);

        clickAndDblClickHandler.call(
            this,
            function () {

            },
            function () {
                console.log("hi");
                stage.emitEvent(EventType.EVT_EDIT_ENTITY, this);
                this.redraw();
            }
        );

        stage.entitySelected(this, this.selected == false);
        // }}}

        this.selected = true;
        this._dragging = true;

        this.redraw();

    }

    private onMouseUp(evt: any): any {
        this._dragging = false;
        this.isLeftTopSelected = false;
        this.isRightTopSelected = false;
        this.isLeftBottomSelected = false;
        this.isRightBottomSelected = false;
        this.redraw();
    }

    private onMouseUpOutside(evt: any): any {
        this._dragging = false;
        this.selected = false;
        this.redraw();
    }

    public onMouseMove(evt: any): any {
        let stage: XStage = <XStage>this.parent;

        if (this._dragging && stage.state == State.SELECT) {
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
                stage.moveAnotherEntityIfExist(delta.x, delta.y);
            }

            if (this.linePoints) {
                let i: any;
                for (i in this.linePoints) {
                    this.linePoints[i].updateLinePos();
                }
            }

            this.oldPosition = newPosition;

            this.redraw();
        }
    }
}
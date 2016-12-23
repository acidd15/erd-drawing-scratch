/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

import {XContainer} from "./container";
import {XEntity} from './entity';
import {XLine} from './line';
import {State, EventType} from './const';
import {XGraphics} from "./graphics";

require('module/pixijs-4.3.0/pixi.js');

class Position2D {
    constructor(private _x: number, private _y: number) {

    }

    public get x(): number {
        return this._x;
    }

    public set x(v) {
        this._x = v;
    }

    public get y(): number {
        return this._y;
    }

    public set y(v) {
        this._y = v;
    }
}

export class XStage extends XContainer {

    private dragging: boolean;
    private oldPosition: Position2D;
    //private hitArea: PIXI.Rectangle;
    private _curSelectedEntity: XEntity;
    private _isChildSelected: boolean;
    private _state: State;
    //private relationData: Object[];
    private eventMap: any;
    private _keyboard: any;
    private selectionRect: PIXI.Graphics;

    constructor(x: number, y: number, width: number, height: number, color: number) {
        super();

        this.interactive = true;

        this.dragging = false;
        this.oldPosition = new Position2D(0, 0);
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);
        this._isChildSelected = false;
        this._state = State.SELECT;
        //this.relationData = [];
        this.eventMap = {};
        this._keyboard = {
            ctrlKey: false
        };

        this.on('mousedown', this.onMouseDown);
        this.on('mouseup', this.onMouseUp);
        this.on('mousemove', this.onMouseMove);
    }

    public get state() {
        return this._state;
    }

    public get keyboard() {
        return this._keyboard;
    }

    public get curSelectedEntity(): XEntity {
        return this._curSelectedEntity;
    }

    public set curSelectedEntity(v: XEntity) {
        this._curSelectedEntity = v;
    }

    /*
    public get isChildSelected(): boolean {
        return this._isChildSelected;
    }
    */

    public set isChildSelected(v: any) {
        this._isChildSelected = v;
    }

    public emitEvent(evtType: EventType, data: any): void {
        if (this.eventMap[evtType]) {
            this.eventMap[evtType].call(this, data);
        }
    }

    public setState(_state: State): void {
        this._state = _state;
    }

    private addEntity(pos: any): void {
        let entity: XEntity = new XEntity(pos.x, pos.y, 200, 300, 0xcccccc);
        entity.setName("Unnamed Entity");
        this.addChild(entity);
    }

    public addRelation(from: XEntity, to: XEntity): void {
        if (from && to && from != to) {
            let fromLinePoints: XLine[] = from.getLinePoints();
            //let toLinePoints: XLine[] = to.getLinePoints();

            for (let i in fromLinePoints) {
                if (
                    (
                        fromLinePoints[i].from == from
                        || fromLinePoints[i].to == from
                    )
                    &&
                    (
                        fromLinePoints[i].from == to
                        || fromLinePoints[i].to == to
                    )
                ) {
                    return;
                }
            }

            let line: XLine = new XLine(from, to);
            if (line != null) {
                this.addChild(line);
                line.sendToBack();
            }
        }
    }

    /*
    private setEventHandler(evtType: any, handler: any): void {
        this.eventMap[evtType] = handler;
    }
    */

    private onMouseDown(evt: any): void {
        this.dragging = true;

        this.oldPosition.x = evt.data.global.x;
        this.oldPosition.y = evt.data.global.y;

        if (!this._isChildSelected) {
            this.selectionRect = new PIXI.Graphics();
            this.selectionRect.position.x = this.oldPosition.x;
            this.selectionRect.position.y = this.oldPosition.y;
            this.addChild(this.selectionRect);
        }

        if (
            this._state == State.SELECT
            || this._state == State.ADD_RELATION
        ) {
            if (this._isChildSelected == false) {
                //console.log(this.children);
                let i: any;
                for (i in this.children) {
                    let graphicsItem: any = this.children[i];

                    if (graphicsItem instanceof XEntity) {
                        graphicsItem.selected = false;
                        graphicsItem.redraw();
                    }
                }
                this._curSelectedEntity = undefined;
            } else {
                if (this._keyboard.ctrlKey == false) {
                    let i: any;
                    for (i in this.children) {
                        let graphicsItem: any = this.children[i];

                        if (graphicsItem instanceof XEntity) {
                            if (graphicsItem != this._curSelectedEntity) {
                                graphicsItem.selected = false;
                                graphicsItem.redraw();
                            }
                        }
                    }
                }

                this._isChildSelected = false;
            }
        } else if (this._state == State.ADD_ENTITY) {
            this.addEntity(evt.data.global);
        }
    }

    private onMouseUp(evt: any): void {
        this.dragging = false;

        //console.log(this.selectionRect);
        //console.log(this._state);
        //console.log(this.children.length);

        if (this.selectionRect) {
            if (this._state == State.SELECT) {
                let invFactor: any = {
                    x: 1,
                    y: 1
                };

                if (evt.data.global.x < this.selectionRect.position.x) {
                    invFactor.x = -1;
                }

                if (evt.data.global.y < this.selectionRect.position.y) {
                    invFactor.y = -1;
                }

                let x1: number = this.selectionRect.position.x;
                let x2: number = this.selectionRect.position.x + (invFactor.x * this.selectionRect.width);
                let y1: number = this.selectionRect.position.y;
                let y2: number = this.selectionRect.position.y + (invFactor.y * this.selectionRect.height);

                let sel: any = {
                    xMin: Math.min(x1, x2),
                    xMax: Math.max(x1, x2),
                    yMin: Math.min(y1, y2),
                    yMax: Math.min(y1, y2)
                };

                //console.log(this.children);

                let i: any;
                for (i in this.children) {
                    let graphicsItem: any = this.children[i];

                    let x: number = graphicsItem.position.x;
                    let y: number = graphicsItem.position.y;

                    if (
                        (sel.xMin <= x && x <= sel.xMax)
                        && (sel.yMin <= y && y <= sel.yMax)
                    ) {
                        if (graphicsItem instanceof XEntity) {
                            graphicsItem.selected = true;
                            graphicsItem.redraw();
                        }
                    }
                }
            }

            this.removeChild(this.selectionRect);
            this.selectionRect = undefined;
        }

        this.oldPosition.x = 0;
        this.oldPosition.y = 0;
    }

    private onMouseMove(evt: any): void {
        if (this.dragging) {
            let newPosition: any = evt.data.global;

            let delta: any =  {
                x: newPosition.x - this.oldPosition.x,
                y: newPosition.y - this.oldPosition.y
            };

            if (this.selectionRect) {
                this.selectionRect.clear();
                this.selectionRect.lineStyle(1, 0x00, 1);
                this.selectionRect.drawRect(0, 0, delta.x, delta.y);
            }
        }
    }

    /*
    private onKeyDown(evt): void {
        this._keyboard.ctrlKey = evt.ctrlKey;

        if (evt.keyCode == 8) {
            for (let i: number = this.children.length-1; 0 <= i; --i) {
                let graphicsItem: XGraphics = <XGraphics>this.children[i];

                if (graphicsItem.selected == true) {
                    this.removeChildAt(i);
                }
            }
        }
    }

    private onKeyUp(evt): void {
        this._keyboard.ctrlKey = evt.ctrlKey;
    }
    */

}
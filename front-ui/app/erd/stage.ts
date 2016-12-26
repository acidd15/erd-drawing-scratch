/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require('module/pixijs-4.3.0/pixi.js');

import {XContainer} from "./container";
import {XEntity} from './entity';
import {XLine} from './line';
import {State, EventType, DragState} from './const';
import {XSelection} from "./selection";

import {getXYDelta} from "./library";

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

    private dragging: DragState;
    private oldPosition: Position2D;
    //private hitArea: PIXI.Rectangle;
    private _curSelectedEntity: XEntity;
    private _isChildSelected: boolean;
    private _state: State;
    //private relationData: Object[];
    private eventMap: any;
    private _keyboard: any;
    private selectionRect: XSelection;
    private selectionQueue: any[];
    private relationQueue: any[];

    constructor(x: number, y: number, width: number, height: number, color: number) {
        super();

        this.interactive = true;

        this.dragging = DragState.ENDED;
        this.oldPosition = new Position2D(0, 0);
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);
        this._isChildSelected = false;
        this._state = State.SELECT;
        //this.relationData = [];
        this.eventMap = {};
        this._keyboard = {
            ctrlKey: false
        };

        this.selectionQueue = [];
        this.relationQueue = [];

        this.selectionRect = new XSelection();
        this.selectionRect.visible = false;
        this.addChild(this.selectionRect);

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

    public entitySelected(entity: XEntity, isNewlySelected: boolean): void {
        if (this._state == State.SELECT) {
            this.selectionQueue.push({entity: entity, isNewlySelected: isNewlySelected});
        } else if (this._state == State.ADD_RELATION) {
            this.relationQueue.push(entity);
        }
    }

    public moveAnotherEntityIfExist(x: number, y: number): void {
        let i: any;
        for (i in this.children) {
            let graphicsItem: any = this.children[i];

            if (
                graphicsItem instanceof XEntity
                && graphicsItem.selected == true
                && this._curSelectedEntity != graphicsItem
            ) {
                graphicsItem.moveEntity(x, y);
                graphicsItem.redraw();
            }
        }
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
                    (fromLinePoints[i].from == from || fromLinePoints[i].to == from)
                    && (fromLinePoints[i].from == to || fromLinePoints[i].to == to)
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

    private evaluateSelect(invFactor: any): void {
        let x1: number = this.selectionRect.position.x;
        let x2: number = x1 + (invFactor.x * this.selectionRect.width);
        let y1: number = this.selectionRect.position.y;
        let y2: number = y1 + (invFactor.y * this.selectionRect.height);

        let sel: any = {
            xMin: Math.min(x1, x2),
            xMax: Math.max(x1, x2),
            yMin: Math.min(y1, y2),
            yMax: Math.max(y1, y2)
        };

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

    private getInvFactor(x1: number, y1: number, x2: number, y2: number): any {
        return {
            x: (x1 < x2) ? -1 : 1,
            y: (y1 < y2) ? -1 : 1
        };
    }

    private onMouseDown(evt: any): void {
        this.dragging = DragState.READY;

        this.oldPosition.x = evt.data.global.x;
        this.oldPosition.y = evt.data.global.y;

        let q: any = this.selectionQueue.pop();
        this._curSelectedEntity = q ? q.entity : q;

        if (this._curSelectedEntity) {
            this._isChildSelected = true;
        } else {
            this._isChildSelected = false;
        }

        if (!this._isChildSelected) {
            this.selectionRect.show(this.oldPosition.x, this.oldPosition.y);
        }

        if (this._state == State.ADD_RELATION) {
            console.log(this.relationQueue);
            if (this.relationQueue.length == 2) {
                let v2 = this.relationQueue.pop();
                let v1 = this.relationQueue.pop();

                this.addRelation(v1, v2);

                v1.selected = false;
                v1.redraw();

                v2.selected = false;
                v2.redraw();
            }
        } else if (this._state == State.SELECT) {
            if (this._isChildSelected == false) {
                let i: any;
                for (i in this.children) {
                    let graphicsItem: any = this.children[i];

                    if (graphicsItem instanceof XEntity) {
                        graphicsItem.selected = false;
                        graphicsItem.redraw();
                    }
                }
            } else {
                if (this._keyboard.ctrlKey == false && q.isNewlySelected == true) {
                    let i: any;
                    for (i in this.children) {
                        let graphicsItem: any = this.children[i];

                        if (graphicsItem instanceof XEntity && graphicsItem != this._curSelectedEntity) {
                            graphicsItem.selected = false;
                            graphicsItem.redraw();
                        }
                    }
                }
            }
        } else if (this._state == State.ADD_ENTITY) {
            this.addEntity(evt.data.global);
        }
    }

    private onMouseUp(evt: any): void {
        this.dragging = DragState.ENDED;

        if (this.selectionRect.visible) {
            if (this._state == State.SELECT) {
                let invFactor: any = this.getInvFactor(
                    evt.data.global.x, evt.data.global.y,
                    this.selectionRect.position.x, this.selectionRect.position.y
                );

                this.evaluateSelect(invFactor);
            }

            this.selectionRect.hide();
        }

        this.oldPosition.x = 0;
        this.oldPosition.y = 0;
    }

    private onMouseMove(evt: any): void {
        if (this.dragging == DragState.READY) {
            this.dragging = DragState.DRAGGING;
        }

        if (this.dragging == DragState.DRAGGING && this._state == State.SELECT) {
            let newPosition: any = evt.data.global;

            let delta: any = getXYDelta(
                newPosition.x, newPosition.y,
                this.oldPosition.x, this.oldPosition.y
            );

            if (this.selectionRect.visible) {
                this.selectionRect.update(delta.x, delta.y);
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
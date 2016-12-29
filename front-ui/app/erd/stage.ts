/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

import {XGraphics} from "./graphics";
require("module/pixijs-4.3.0/pixi.js");

import {XContainer} from "./container";
import {XEntity} from "./entity";
import {XLine} from "./line";
import {State, EventType, DragState} from "./types";
import {XSelection} from "./selection";

import {getXYDelta, getInvFactor} from "./library";

export class XStage extends XContainer {

    private dragging: DragState;
    private oldPosition: PIXI.Point;
    private prevSelectedByClick: XGraphics;
    private curSelectedByClick: XGraphics;
    private childSelected: boolean;
    private state: State;
    private eventMap: any;
    private keyboard: any;
    private selectionRect: XSelection;

    constructor(width: number, height: number) {
        super();

        this.interactive = true;

        this.dragging = DragState.ENDED;
        this.oldPosition = new PIXI.Point(0, 0);
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);
        this.childSelected = false;
        this.state = State.SELECT;
        this.eventMap = {};
        this.keyboard = {
            ctrlKey: false
        };
        
        this.selectionRect = new XSelection();
        this.selectionRect.visible = false;
        this.addChild(this.selectionRect);

        this.on("mousedown", this.onMouseDown);
        this.on("mouseup", this.onMouseUp);
        this.on("mousemove", this.onMouseMove);
    }

    public getState() {
        return this.state;
    }

    public getKeyboard() {
        return this.keyboard;
    }

    public emitEvent(evtType: EventType, data: Function): void {
        if (this.eventMap[evtType]) {
            this.eventMap[evtType].call(this, data);
        }
    }

    public setState(state: State): void {
        this.state = state;
    }

    public moveSelectedEntity(xDelta: number, yDelta: number): void {
        for (let v of this.children) {
            if (
                v instanceof XEntity
                && (<XEntity>v).isSelected() == true
                && this.curSelectedByClick != (<XEntity>v)
            ) {
                (<XEntity>v).moveEntity(xDelta, yDelta);
                (<XEntity>v).redraw();
                (<XEntity>v).updateLinePoses(xDelta, yDelta);
            }
        }
    }

    private addUnnamedEntity(pos: PIXI.Point): void {
        let entity: XEntity = new XEntity(pos.x, pos.y, 200, 300, 0xcccccc);
        entity.setName("Unnamed Entity");
        this.addChild(entity);
    }

    public addRelation(from: XEntity, to: XEntity): void {
        if (from && to && from != to) {
            let fromLinePoints: XLine[] = from.getLinePoints();

            for (let v of fromLinePoints) {
                if (
                    (v.getFrom() == from || v.getTo() == from)
                    && (v.getFrom() == to || v.getTo() == to)
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

    public setEventHandler(evtType: EventType, handler: (evt: PIXI.interaction.InteractionEvent) => void): void {
        this.eventMap[evtType] = handler;
    }

    private evaluateSelection(invFactor: any): boolean {
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

        let selected: boolean = false;

        for (let v of this.children) {
            let x: number = v.position.x;
            let y: number = v.position.y;

            if (
                (sel.xMin <= x && x <= sel.xMax)
                && (sel.yMin <= y && y <= sel.yMax)
            ) {
                if (v instanceof XEntity) {
                    (<XEntity>v).setSelected(true);
                    (<XEntity>v).redraw();
                    selected = true;
                }
            }
        }

        return selected;
    }

    public deselect(excepts: XEntity[]): void {
        for (let v of this.children) {
            if (v instanceof XEntity && !excepts.find(x => x == v)) {
                (<XEntity>v).setSelected(false);
                (<XEntity>v).redraw();
            }
        }

        if (excepts.length == 0) {
            this.childSelected = false;
            this.curSelectedByClick = undefined;
            this.prevSelectedByClick = undefined;
        }
    }

    protected onMouseDown(evt: PIXI.interaction.InteractionEvent): void {
        this.dragging = DragState.READY;

        this.oldPosition.x = evt.data.global.x;
        this.oldPosition.y = evt.data.global.y;

        this.curSelectedByClick = !(evt.target instanceof XStage) ? <XGraphics>evt.target : undefined;

        if (this.curSelectedByClick) {
            if (this.curSelectedByClick instanceof XEntity) {
                this.childSelected = true;
            } else {
                this.childSelected = false;
            }
        } else {
            this.childSelected = false;
        }

        if (!this.childSelected) {
            if (
                (
                    this.curSelectedByClick
                    && this.curSelectedByClick instanceof XLine
                    && this.curSelectedByClick.defaultCursor != "col-resize"
                    && this.curSelectedByClick.defaultCursor != "row-resize"
                )
                || !this.curSelectedByClick
            ) {
                this.selectionRect.show(this.oldPosition.x, this.oldPosition.y);
            }
        }

        if (this.state == State.ADD_RELATION) {
            if (this.curSelectedByClick instanceof XEntity) {
                this.curSelectedByClick.setSelected(false);
                if (this.prevSelectedByClick instanceof XEntity) {
                    this.prevSelectedByClick.setSelected(false);
                    this.addRelation(<XEntity>this.prevSelectedByClick, <XEntity>this.curSelectedByClick);
                }
            }
        } else if (this.state == State.SELECT) {
            if (this.childSelected == false) {
                this.deselect([]);
            } else {
                if (this.keyboard.ctrlKey == false && this.curSelectedByClick.isSelectedNewly() == true) {
                    this.deselect([<XEntity>this.curSelectedByClick]);
                }
            }
        } else if (this.state == State.ADD_ENTITY) {
            this.addUnnamedEntity(evt.data.global);
        }

        super.onMouseDown(evt);
    }

    private onMouseUp(evt: PIXI.interaction.InteractionEvent): void {
        this.dragging = DragState.ENDED;

        if (this.selectionRect.visible) {
            if (this.state == State.SELECT) {
                let invFactor: any = getInvFactor(
                    new PIXI.Point(evt.data.global.x, evt.data.global.y),
                    new PIXI.Point(this.selectionRect.position.x, this.selectionRect.position.y)
                );

                if (this.evaluateSelection(invFactor)) {
                    this.curSelectedByClick = undefined;
                    this.prevSelectedByClick = undefined;
                }
            }

            this.selectionRect.hide();
        }

        this.oldPosition.x = 0;
        this.oldPosition.y = 0;

        this.prevSelectedByClick = this.curSelectedByClick;
    }

    private onMouseMove(evt: PIXI.interaction.InteractionEvent): void {
        if (this.dragging == DragState.READY) {
            this.dragging = DragState.DRAGGING;
        }

        if (this.dragging == DragState.DRAGGING && this.state == State.SELECT) {
            let newPosition: PIXI.Point = evt.data.global;

            let delta: any = getXYDelta(
                new PIXI.Point(newPosition.x, newPosition.y),
                new PIXI.Point(this.oldPosition.x, this.oldPosition.y)
            );

            if (this.selectionRect.visible) {
                this.selectionRect.update(delta.x, delta.y);
            }
        }
    }

    protected onMouseDblClick(evt: PIXI.interaction.InteractionEvent): void {
        if (evt.target instanceof XEntity && this.eventMap[EventType.EVT_EDIT_ENTITY]) {
            this.eventMap[EventType.EVT_EDIT_ENTITY](evt);
        }

        super.onMouseDblClick(evt);
    }

    /*
    private onKeyDown(evt): void {
        this.keyboard.ctrlKey = evt.ctrlKey;

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
        this.keyboard.ctrlKey = evt.ctrlKey;
    }
    */

}
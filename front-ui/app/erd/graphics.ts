/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />


require("module/pixijs-4.3.0/pixi.js");

import {XStage} from "./stage";
import {DragState} from "./types";

export class XGraphics extends PIXI.Graphics {
    private selected: boolean;
    private selectedNewly: boolean;
    protected dragging: DragState;
    protected oldPosition: PIXI.Point;
    protected prevInteractionData: PIXI.interaction.InteractionData;

    constructor() {
        super();
        this.selected = false;
        this.selectedNewly = false;
    }

    public isSelected() {
        return this.selected;
    }

    public setSelected(v: boolean): void {
        if (this.selected == false) {
            this.selectedNewly = true;
        } else {
            this.selectedNewly = false;
        }
        this.selected = v;
    }

    public isSelectedNewly(): boolean {
        return this.selectedNewly;
    }

    public redraw(): void {

    }

    //@Override
    public bringToFront(): void {
        if (this.parent) {
            var parent = this.parent;
            parent.removeChild(this);
            parent.addChild(this);
        }
    }

    //@Override
    public sendToBack(): void {
        if (this.parent) {
            if (this.parent.children.length) {
                let i: any;
                for (i in this.parent.children) {
                    if (this.parent.children[i] === this) {
                        this.parent.children.splice(i, 1);
                        break;
                    }
                }
                this.parent.children.splice(0, 0, this);
            }
        }
    }

    protected onMouseDown(evt: PIXI.interaction.InteractionEvent): void {
        this.dragging = DragState.READY;
        this.prevInteractionData = evt.data;
        this.oldPosition = evt.data.getLocalPosition(<XStage>this.parent);
    }

    protected onMouseUp(evt: PIXI.interaction.InteractionEvent): void {
        this.dragging = DragState.ENDED;
    }

    protected onMouseUpOutside(evt: PIXI.interaction.InteractionEvent): void {
        this.dragging = DragState.ENDED;
    }

    protected onMouseMove(evt: PIXI.interaction.InteractionEvent): void {
        if (this.dragging == DragState.READY) {
            this.dragging = DragState.DRAGGING;
        }
    }


}
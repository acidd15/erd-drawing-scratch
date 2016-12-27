/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

export class XGraphics extends PIXI.Graphics {
    private selected: boolean;
    private selectedNewly: boolean;

    constructor() {
        super();
        this.selected = false;
        this.selectedNewly = false;
    }

    public isSelected() {
        return this.selected;
    }

    public setSelected(v: boolean) {
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
            this.parent.removeChild(this);
            this.parent.addChild(this);
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
}
/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require('module/pixijs-4.3.0/pixi.js');

export class XGraphics extends PIXI.Graphics {
    private _selected: boolean;

    constructor() {
        super();
        this._selected = false;
    }

    public get selected() {
        return this._selected;
    }

    public set selected(v) {
        this._selected = v;
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
}
/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

export class XContainer extends PIXI.Container {
    private clickCount: number;

    //@Override
    public bringToFront(): void {
        if (this.parent) {
            let parent: PIXI.Container = this.parent;
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

    protected onMouseDown(evt: any): void {
        if (typeof this.clickCount == "undefined") {
            this.clickCount = 1;

            let _self: any = this;
            setTimeout(
                () => {
                    // double click
                    if (_self.clickCount == 2) {
                        this.onMouseDblClick(evt);
                    }
                    _self.clickCount = undefined;
                },
                300
            );

            return;
        }
        this.clickCount = 2;
    }

    protected onMouseDblClick(evt: any): void {

    }
}
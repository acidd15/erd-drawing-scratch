/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

/*
 * https://github.com/kittykatattack/learningPixi#keyboard
 */
import Point = PIXI.Point;
export function keyboard(keyCode: any): any {
    let key: any = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    //The `downHandler`
    key.downHandler = (event: any) => {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = (event: any) => {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );

    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );

    return key;
}

export function getXYDelta(from: PIXI.Point, to: PIXI.Point): any {
    return {
        x: from.x - to.x,
        y: from.y - to.y
    };
}

export function getInvFactor(from: PIXI.Point, to: PIXI.Point): any {
    return {
        x: (from.x < to.x) ? -1 : 1,
        y: (from.y < to.y) ? -1 : 1
    };
}

export function getHitRectangle(from: PIXI.Point, to: PIXI.Point): PIXI.Rectangle {
    let inv: any  = getInvFactor(from, to);

    return new PIXI.Rectangle(
        (inv.x == 1 ? to.x : from.x) - 5,
        (inv.y == 1 ? to.y : from.y) - 5,
        (inv.x == 1 ? from.x - to.x : to.x - from.x) + 10,
        (inv.y == 1 ? from.y - to.y : to.y - from.y) + 10
    );
}
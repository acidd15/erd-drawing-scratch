/// <reference path="../../module/pixi-typescript/pixi.js.d.ts" />

require("module/pixijs-4.3.0/pixi.js");

/*
 * https://github.com/kittykatattack/learningPixi#keyboard
 */

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

export function getRectangle(from: PIXI.Point, to: PIXI.Point, volume: number): PIXI.Rectangle {
    let inv: any  = getInvFactor(from, to);

    return new PIXI.Rectangle(
        (inv.x == 1 ? to.x : from.x) - volume,
        (inv.y == 1 ? to.y : from.y) - volume,
        (inv.x == 1 ? from.x - to.x : to.x - from.x) + 2 * volume,
        (inv.y == 1 ? from.y - to.y : to.y - from.y) + 2 * volume
    );
}

// referred from http://jsfiddle.net/justin_c_rounds/Gd2S2/light/
// http://jsfiddle.net/m8cdu8z7/
export function getLineIntersectPoint(line1P1: PIXI.Point, line1P2: PIXI.Point, line2P1: PIXI.Point, line2P2: PIXI.Point): any {

    let result: any = {x: null, y: null, intersected: false};

    let denom: number = ((line2P2.y - line2P1.y) * (line1P2.x - line1P1.x)) - ((line2P2.x - line2P1.x) * (line1P2.y - line1P1.y));

    if (denom == 0) {
        return result;
    }

    let a: number = line1P1.y - line2P1.y;
    let b: number = line1P1.x - line2P1.x;

    let numer1: number = ((line2P2.x - line2P1.x) * a) - ((line2P2.y - line2P1.y) * b);
    let numer2: number = ((line1P2.x - line1P1.x) * a) - ((line1P2.y - line1P1.y) * b);

    a = numer1 / denom;
    b = numer2 / denom;

    result.x = line1P1.x + (a * (line1P2.x - line1P1.x));
    result.y = line1P1.y + (a * (line1P2.y - line1P1.y));

    if ((a > 0 && a < 1) && (b > 0 && b < 1)) {
        result.intersected = true;
    }

    return result;
}

export function getRectanglePoints(rect: PIXI.Rectangle, adj: number): PIXI.Point[] {
    let d: PIXI.Point[] = [,,,]

    d[0] = new PIXI.Point(rect.x, rect.y);
    d[1] = new PIXI.Point(rect.x + rect.width + adj, rect.y);
    d[2] = new PIXI.Point(rect.x + rect.width + adj, rect.y + rect.height + adj);
    d[3] = new PIXI.Point(rect.x, rect.y + rect.height + adj);

    return d;
}

export function calcCenterPos(from: number, to: number): number {
    return calcCenterPosByWidth(from, to - from);
}

export function calcCenterPosByWidth(from: number, width: number): number {
    return from + Math.ceil(width / 2);
}
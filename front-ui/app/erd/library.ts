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

export function getXYDelta(x1: number, y1: number, x2: number, y2: number): any {
    return {
        x: x1 - x2,
        y: y1 - y2
    };
}

export function getInvFactor(x1: number, y1: number, x2: number, y2: number): any {
    return {
        x: (x1 < x2) ? -1 : 1,
        y: (y1 < y2) ? -1 : 1
    };
}
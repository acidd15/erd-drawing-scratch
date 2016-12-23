
import {Injectable, ElementRef} from "@angular/core";
import {XStage} from "./erd/stage";
import {State} from "./erd/const";

@Injectable()
export class ErdService {
    private stage: XStage;
    private renderer: PIXI.CanvasRenderer;

    constructor() {

    }

    public createStage(ele: ElementRef): void {
        this.renderer = <PIXI.CanvasRenderer>PIXI.autoDetectRenderer(1000, 1000, {backgroundColor: 0xff, antialias: false});
        ele.nativeElement.appendChild(this.renderer.view);

        this.stage = new XStage(0, 0, 1000, 1000, 0xff00ff);

        this.animate();
    }

    private animate(): void {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.stage);
    }

    public setAddEntityState(): void {
        this.stage.setState(State.ADD_ENTITY);
    }

    public setSelectEntityState(): void {
        this.stage.setState(State.SELECT);
    }

    public setAddRelationState(): void {
        this.stage.setState(State.ADD_RELATION);
    }
}
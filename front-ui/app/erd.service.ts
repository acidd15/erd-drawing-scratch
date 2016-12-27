
import {Injectable, ElementRef} from "@angular/core";
import {XStage} from "./erd/stage";
import {State, EventType} from "./erd/types";

@Injectable()
export class ErdService {
    private stage: XStage;
    private renderer: PIXI.CanvasRenderer;

    constructor() {

    }

    public createStage(ele: ElementRef): void {
        this.renderer = <PIXI.CanvasRenderer>PIXI.autoDetectRenderer(1000, 1000, {backgroundColor: 0xffffff, antialias: false});
        ele.nativeElement.appendChild(this.renderer.view);

        this.stage = new XStage(1000, 1000);

        this.animate();

        this.setEventHandler();
    }

    private animate(): void {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.stage);
    }

    public setAddEntityState(): void {
        if (this.stage.getState() != State.ADD_ENTITY) {
            this.stage.setState(State.ADD_ENTITY);
            this.stage.deselect([]);
        }
    }

    public setSelectEntityState(): void {
        if (this.stage.getState() != State.SELECT) {
            this.stage.setState(State.SELECT);
            this.stage.deselect([]);
        }
    }

    public setAddRelationState(): void {
        if (this.stage.getState() != State.ADD_RELATION) {
            this.stage.setState(State.ADD_RELATION);
            this.stage.deselect([]);
        }
    }

    private setEventHandler(): void {
        this.stage.setEventHandler(EventType.EVT_EDIT_ENTITY, (evt: any) => {
            console.log(evt);
        });
    }
}
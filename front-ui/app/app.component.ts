
import {Component, Input} from "@angular/core";
import {OnChange} from "ng2-bootstrap";

@Component(
    {
        selector: 'simple-erd',
        template: `
            <div>
                <control-menu [dlgEditEntity]="dlgEditEntity" [stage]="stage"></control-menu>
            </div>
            <div>
                <simple-erd-stage #stage [dlgEditEntity]="dlgEditEntity"></simple-erd-stage>
            </div>
            <dlg-edit-entity #dlgEditEntity></dlg-edit-entity>
        `
    }
)
export class AppComponent {
    constructor() {

    }
}
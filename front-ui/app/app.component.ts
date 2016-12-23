
import {Component} from "@angular/core";

@Component(
    {
        selector: 'simple-erd',
        template: `
            <div>
                <control-menu></control-menu>
            </div>
            <div>
                <simple-erd-stage></simple-erd-stage>
            </div>
        `
    }
)
export class AppComponent {

    constructor() {

    }

}
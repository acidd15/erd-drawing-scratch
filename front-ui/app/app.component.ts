
import {Component, Input, ViewChild} from "@angular/core";
import {OnChange} from "ngx-bootstrap";
import {ErdService} from "./erd.service";
import {EditEntityComponent} from "./dialog/edit-entity.component";

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
            <div>
                <dlg-edit-entity #dlgEditEntity></dlg-edit-entity>
            </div>
        `
    }
)
export class AppComponent {
    @ViewChild("dlgEditEntity") private dlgEditEntity: EditEntityComponent;

    constructor(private erdService: ErdService) {
        let _self: AppComponent = this;
        this.erdService.editEntityObservable.subscribe((data: any) => {
            _self.dlgEditEntity.show(data[0], data[1]);
        })
    }
}

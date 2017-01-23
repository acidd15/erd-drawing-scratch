import {Component, ViewChild, Input, Output} from "@angular/core";
import {ModalDirective} from "ng2-bootstrap";

@Component({
    selector: "dlg-edit-entity",
    templateUrl: "/app/dialog/edit-entity.component.html"
})
export class EditEntityComponent {
    @ViewChild("modal") public modal:ModalDirective;
    constructor() {
    }

    public show() {
        this.modal.show();
    }
}

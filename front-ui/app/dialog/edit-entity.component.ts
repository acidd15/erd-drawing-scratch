import {Component, ViewChild, Input, Output} from "@angular/core";
import {ModalDirective} from "ngx-bootstrap";
import {isUndefined} from "util";
import {ErdService} from "../erd.service";

@Component({
    selector: "dlg-edit-entity",
    templateUrl: "app/dialog/edit-entity.component.html",
    styleUrls: ["app/dialog/edit-entity.component.css"]
})
export class EditEntityComponent {
    @ViewChild("modal") public modal:ModalDirective;

    private target: any;
    private models: string[] = [];

    constructor(private erdService: ErdService) {
    }

    public appendItem(): void {
        this.models.push("");
    }

    public removeLastItem(): void {
        this.models.pop();
    }

    public removeItem(index: number): void {
        this.models.splice(index, 1);
    }

    public updateItem(index: number, value: string): void {
        this.models[index] = value;
    }

    public save(): void {
        if (confirm("Do you proceed to save?")) {
            this.erdService.saveEntity(this.target, this.models);
            this.modal.hide();
        }
    }

    public show(target: any, data: string[]) {
        this.target = target;
        this.models = data;
        this.modal.show();
    }
}

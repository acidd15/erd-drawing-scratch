
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {XErdStageComponent} from './erd-stage.component';
import {EditEntityComponent} from "./dialog/edit-entity.component";
import {MenuComponent} from "./menu.component";
import {ErdService} from "./erd.service";
import {ButtonsModule, ModalModule} from 'ngx-bootstrap';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ButtonsModule,
        ModalModule.forRoot()
    ],
    declarations: [
        AppComponent, XErdStageComponent, MenuComponent, EditEntityComponent
    ],
    providers: [
        ErdService
    ],
    bootstrap: [AppComponent]

})
export class AppModule {}

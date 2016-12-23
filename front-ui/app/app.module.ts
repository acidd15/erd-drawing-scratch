
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {XErdStageComponent} from './erd-stage.component';
import {MenuComponent} from "./menu.component";
import {ErdService} from "./erd.service";
import {ButtonsModule} from 'ng2-bootstrap';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ButtonsModule
    ],
    declarations: [
        AppComponent, XErdStageComponent, MenuComponent
    ],
    providers: [
        ErdService
    ],
    bootstrap: [AppComponent]

})
export class AppModule {}
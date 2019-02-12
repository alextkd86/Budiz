import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { DataTableModule } from 'ng2-data-table';
import { ButtonsModule } from 'ngx-bootstrap';

import { AngularOpenlayersModule } from 'angular2-openlayers';
// Importamos nuestros servicios
import { CongestionService } from './_services/index';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationPageComponent } from './configurationPage/configurationPage';
import { PrincipalPageComponent } from './principalPage/principalPage';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { UiSwitchModule } from '../../node_modules/angular2-ui-switch/src'; 
import { HttpModule, JsonpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import { translationConfig } from './app.translate';


const appRoutes: Routes = [
  { path: '', component: PrincipalPageComponent },
  { path: 'configurationPage', component: ConfigurationPageComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    ConfigurationPageComponent,
    PrincipalPageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AngularOpenlayersModule,
    HttpModule,
    JsonpModule, 
    DataTableModule,
    RouterModule.forRoot(appRoutes),
    TranslateModule.forRoot(translationConfig),
    ButtonsModule.forRoot(),
    Ng2Bs3ModalModule, 
    UiSwitchModule
  ],
  providers: [CongestionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
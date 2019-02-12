import { Component } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {Constants} from './_utils/index'; 

// Importacion de openlayer
declare const ol: any;

@Component({
  moduleId: 'module_id',
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	constructor(private translate: TranslateService) {
		// idiomas disponibles
	    translate.addLangs([Constants.LANGUAGE_EN, Constants.LANGUAGE_ES, Constants.LANGUAGE_FR]);
	    // idioma por defecto
	    translate.setDefaultLang(Constants.LANGUAGE_EN);
	    // idioma del navegador
	    const browserLang = translate.getBrowserLang();
	    // idioma que vamos a utilizar ahora
	    translate.use(browserLang.match(/en|es|fr/) ? browserLang : Constants.LANGUAGE_EN);
	}

}

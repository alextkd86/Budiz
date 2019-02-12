// Archivo de configuración del i18n. Aquí le decimos en qué carpeta vamos a guardar los json con los mensajes en distintos idiomas
// Esto lo importamos luego al app.module.ts
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import { Http } from '@angular/http';

export function translateLoaderFactory(http: Http) {
  return new TranslateStaticLoader(http, '/assets/i18n', '.json');
}

export const translationConfig: TranslateModule = {
    provide: TranslateLoader,
    useFactory: translateLoaderFactory,
    deps: [Http]
}

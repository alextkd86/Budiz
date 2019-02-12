/**
 * Created by apascual on 25/08/2017.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions, Jsonp } from '@angular/http';
import { Constants } from '../_utils/index';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class CongestionService {

  constructor(private http: Http, private jsonp: Jsonp) {
  }

  /**
   * Devuelve los atascos que se produzcan. Tiramos de un servicio externo de microsoft. Mapas (BING)
   * @returns {Observable<R|T>}
   */
  getCongestionByBing(): Observable<any[]> {
    const url = 'http://dev.virtualearth.net/REST/v1/Traffic/Incidents/35.8852717,-6.7016894,38.3490356,-3.8866548?type=2,4&key=Ateggm95gwlb7bGd6sPtVFD-IO5L2vTzkq5k6FrG9FRlW6ytzUh06c3mxjt2Pamx&jsonp=JSONP_CALLBACK';
    //Tenemos que usar JSONP  como técnica de comunicación utilizada en los programas JavaScript para realizar llamadas asíncronas a dominios diferentes
    return this.jsonp.get(url)
      .map(function(res: Response){
        return res.json() || {};
      }).catch(function(error: any){return Observable.throw(error);
    });
  }

}

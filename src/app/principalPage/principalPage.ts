import { Component, OnInit } from '@angular/core';
import { CongestionService } from '../_services/index';
import { Observable } from 'rxjs/Rx';
import { TranslateService } from 'ng2-translate';


// Importacion de openlayer
declare const ol: any;

@Component({
  moduleId: 'module_id',
  templateUrl: './principalPage.html',
  styleUrls: ['./principalPage.css']
})
export class PrincipalPageComponent implements OnInit {

  // Punto inicial que queremos mostrar
  coordenadaInicial = ol.proj.fromLonLat([-5.5032477, 36.845294]);
  // Zoom carga mapa, este zoom lo necesitaremos, ya que cuando se muestran los eventos durante el vuelo llegara hasta esta posicion
  zoomCarga = 6;
  // Zoom inicial que queremos mostrar
  zoomInicial = 9;
  // Zoom al mostrar evento
  zoomMostrarEvento = 14;
  // Duracion vuelo para mostrar evento
  duracionMostrarEvento = 8200;
  // Duracion vuelo para quitar evento
  duracionQuitarEvento = 3000;
  // Vista del mapa
  view: any;
  // Mapa
  map: any;

  // Marker
  markerOverlay: any;

  // Popup para la informacion del evento
  popUpOverlay: any;

  // Variables para coordenadas unidas
  lineString: any;
  lineStringFeature: any;
  lineStringFeatureStyle: any;
  lineStringVector: any;
  lineStringLayer: any;

  // Variables para mostrar el inicio y el final de un rango
  vectorInicioFinRango: any;
  layerInicioFinRango: any;

  // Variables para mostrar trafico
  quadKeyLayer: any;
  quadKeysource: any;

  // Variables para mostrar las precipitaciones
  precipitacionesLayer: any;
  precipitacionesSource: any;

  // Variables para mostrar las temperaturas
  temperaturasLayer: any;
  temperaturasSource: any;

  //Lista para almacenar los atascos que se produzcan
  listAtascos: any = [];

  constructor(private congestionService: CongestionService, private translate: TranslateService) {
    console.log(this.translate)
  }

  ngOnInit(): void {
    // Variables que permiten mostrar tramos en el mapa
    this.lineString = new ol.geom.LineString([]);
    this.lineStringFeature = new ol.Feature(this.lineString);
    this.lineStringFeatureStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [32, 64, 128, 255],
        width: 6
      })
    });
    this.lineStringFeature.setStyle(this.lineStringFeatureStyle);
    this.lineStringVector = new ol.source.Vector({
      features: [this.lineStringFeature]
    });
    // Si queremos un KML en vez de una lista de coordenadas
    /*
    this.lineStringVector = new ol.source.Vector({
      url: './assets/A-373C.kml',
      format: new ol.format.KML()
    });
    */
    this.lineStringLayer = new ol.layer.Vector({
      source: this.lineStringVector
    });

    // Variables para mostrar el inicio y el final de un rango
    this.vectorInicioFinRango = new ol.source.Vector();
    this.layerInicioFinRango = new ol.layer.Vector({
      source: this.vectorInicioFinRango
    });

    // Variables que permiten mostrar eventos en el mapa
    // Marker como overlay
    this.markerOverlay = new ol.Overlay({
      position: this.coordenadaInicial,
      positioning: 'center-center',
      element: document.getElementById('marker'),
      stopEvent: false,
      autopan: true
    });

    this.popUpOverlay = new ol.Overlay({
      element: document.getElementById('popup'),
      positioning: 'bottom-center',
      stopEvent: false
    });

    // Capa para mostrar el trafico
    this.quadKeyLayer = new ol.layer.Tile({
      source: null
    });

    // Capa para mostrar precipitacioens
    this.precipitacionesLayer = new ol.layer.Tile({
      source: null
    });

    // Capa para mostrar la temperatura
    this.temperaturasLayer = new ol.layer.Tile({
      source: null
    });

    // Definicion de la vista y el map
    this.view = new ol.View({
      center: this.coordenadaInicial,
      zoom: this.zoomCarga
    });

    // Definimos el mapa con la vista
    this.map = new ol.Map({
      layers: [
        new ol.layer.Tile({source: new ol.source.OSM()}),
        this.lineStringLayer,
        this.quadKeyLayer,
        this.precipitacionesLayer,
        this.temperaturasLayer,
        this.layerInicioFinRango
      ],
      view:  this.view,
      target: 'map',
      controls: [new ol.control.FullScreen()],
      overlays: [this.popUpOverlay, this.markerOverlay]
    });

    // Realizamos un primer zoom para que cuando se realizen los eventos, esa parte del mapa se encuentre cargada
    setTimeout(() => {
      this.view.animate({
        zoom: this.zoomInicial,
        duration: 2000
      });
    }  , 1000);

    //Llamada periódica al web service externo de microsoft para informar si hay atascos y donde se están dando
    const timerAtascos = Observable.timer(5000, 300000);
    timerAtascos.subscribe(t => this.recoverAtascos());
  }

  //Recuperamos los atascos
  recoverAtascos() {
    console.log('LLamada para obtener los atascos desde la api de microsoft BING');
    this.listAtascos = [];
    this.congestionService.getCongestionByBing().subscribe(
      data => {
        const listAtascosAux: any = data;
        if(listAtascosAux.resourceSets !== null && listAtascosAux.resourceSets[0].estimatedTotal !== 0 ){
          //recorremos cada objeto
          for (const atasco of listAtascosAux.resourceSets[0].resources) {
            console.log("Descripcion: " + atasco.description + ". Coordenadas inicio: " + atasco.point.coordinates + ". Coordenadas fin: " + atasco.toPoint.coordinates);
            let objectAtasco = {
              "description": atasco.description, 
              "coordenadasIni": atasco.point.coordinates, 
              "coordenadasFin": atasco.toPoint.coordinates
            }
            this.listAtascos.push(objectAtasco);
            //Muestro una alerta que dure unos 5 segundos
            //setTimeout(function(){ alert(objectAtasco.description + "\n" + objectAtasco.coordenadasIni+"-"+objectAtasco.coordenadasFin); }, 5000);
          }
        }else{
          console.log("No hay atascos");  
        }
      },
      err => {
        console.log('Error durante la recuperacion de los atascos desde el web service de microsoft BING');
        console.log(err);
      },
      () => {
        console.log('Llamada al web service de microsoft BING');
      }
    );
  }

  // Vuelo hacia el evento
  volarALocation(location, duration, zoomFinal, view) {
    return new Promise(function (resolve, reject) {
      if (location !== undefined  && location !== null) {
        let numPartes = 2;
        const zoomInicial = view.getZoom();
        // Parte 1
        view.animate(
          {
            center: location,
            duration: duration
          }, function control(terminada) {
              // console.log('Comprobamos si ha terminado');
              --numPartes;
              if (numPartes === 0 && terminada) {
                resolve('Finished');
              }
          } );
        // Parte 2
        view.animate({
          zoom: zoomInicial - 1,
          duration: duration / 2
        }, {
          zoom: zoomFinal,
          duration: duration / 2
        }, function control(terminada) {
          // console.log('Comprobamos si ha terminado');
          --numPartes;
          if (numPartes === 0 && terminada) {
            resolve('Finished');
          }
        } );

      }else {
        reject('Coordenada is undefined or null');
      }
    });
  }

  // Volver a inicio
  volverAInicio(location, duration, zoomFinal, view) {
    return new Promise(function (resolve, reject) {
      if (location !== undefined  && location !== null) {
        let numPartes = 2;
        // Parte 1
        view.animate(
          {
            center: location,
            duration: duration
          }, function control(terminada) {
            // console.log('Comprobamos si ha terminado');
            --numPartes;
            if (numPartes === 0 && terminada) {
              resolve('Finished');
            }
          } );
        // Parte 2
        view.animate({
          zoom: zoomFinal,
          duration: duration
        }, function control(terminada) {
          // console.log('Comprobamos si ha terminado');
          --numPartes;
          if (numPartes === 0 && terminada) {
            resolve('Finished');
          }
        } );

      }else {
        reject('Coordenada is undefined or null');
      }
    });
  }

  // Reproducir sonido al mostrar evento
  playSound (eventoActual) {
    const prioridadEvento = eventoActual.tipoEvento.prioridad.id;
    // console.log('La prioridad del evento es ' + prioridadEvento);
    const audio = new Audio();
    if (prioridadEvento === 1) {
      audio.src = './assets/audio/baja.wav';
    } else if (prioridadEvento === 2) {
      audio.src = './assets/audio/media.wav';
    } else if (prioridadEvento === 3) {
      audio.src = './assets/audio/alta.wav';
    } else {
      audio.src = './assets/audio/urgente.wav';
    }
    audio.load();
    audio.play();
  }

  // Indica si hay algun evento Mostrandose
  // Si se esta mostrando o bien un marker o un recorrido
  eventoMostrandose() {
    return document.getElementById('marker').style.background !== '' || this.lineString.getCoordinates().length > 0;
  }

  // Muestra el pop up donde se indica toda la información del evento
  mostrarPopUp(eventoActual, overlay, coordenada) {
    overlay.setPosition(coordenada);
    overlay.setPositioning('bottom-center');
    const via = eventoActual.ubicacionesEvento.length === 1 ? eventoActual.ubicacionesEvento[0].via.carretera : 'Varios';
    let pk = '';
    if (eventoActual.ubicacionesEvento.length === 1) {
      if (eventoActual.ubicacionesEvento[0].pkInicial === eventoActual.ubicacionesEvento[0].pkFinal) {
        pk = eventoActual.ubicacionesEvento[0].pkInicial;
      } else {
        pk = eventoActual.ubicacionesEvento[0].pkInicial + ' - ' + eventoActual.ubicacionesEvento[0].pkFinal;
      }
    } else {
      pk = 'Varios';
    }
    const sentido = eventoActual.ubicacionesEvento.length === 1 ?
      (eventoActual.ubicacionesEvento[0].sentido === -1 ? 'Decreciente' : 'Creciente') : 'Varios';
    document.getElementById('popup-content').innerHTML =
      '<div><label class="negrita">- FECHA EVENTO: </label>' + eventoActual.fechaEventoString + '</div>' +
      '<div><label class="negrita">- TIPO EVENTO: </label>' + eventoActual.tipoEvento.desc + '</div>' +
      '<div><label class="negrita">- VIA: </label>' + via + '</div>' +
      '<div><label class="negrita">- PK: </label>' + pk + '</div>' +
      '<div><label class="negrita">- SENTIDO: </label>' + sentido + '</div>' +
      eventoActual.descripcion;
    document.getElementById('popup').style.display = 'block';
  }

  // Pinta una lista de coordenadas unidas por lineas en el mapa
  // También pintara un circulo verde en su coordenada inicial y otro en su coordenada final
  generateTramo(coordenates) {
    this.lineString.setCoordinates(coordenates);

    // Defino Circulo verde incial
    const circleIniStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 20,
        fill: new ol.style.Fill({
          color: 'rgba(95,218,51,0.5)'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(0,0,0,1)',
          width: 3
        })
      })
    });

    const circleIni = new ol.geom.Point(coordenates[0]);
    const circleIniFeature = new ol.Feature(circleIni);
    circleIniFeature.setStyle(circleIniStyle);

    // Defino circulo rojo final
    const circleFinStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 20,
        fill: new ol.style.Fill({
          color: 'rgba(191,22,22,0.5)'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(0,0,0,1)',
          width: 3
        })
      })
    });

    const circleFin = new ol.geom.Point(coordenates[coordenates.length - 1]);
    const circleFinFeature = new ol.Feature(circleFin);
    circleFinFeature.setStyle(circleFinStyle);

    // Añado circulos
    this.vectorInicioFinRango.addFeature(circleIniFeature);
    this.vectorInicioFinRango.addFeature(circleFinFeature);
  }

  // Funciones para mostrar trafico
  tileUrlFunction = function(tileCoord, pixelRatio, projection) {
    const computeQuadKey = function(x, y, z) {
      const quadKeyDigits = [];
      for (let i = z; i > 0; i--) {
        let digit = 0;
        const mask = 1 << (i - 1);

        if ((x & mask) !== 0) {
          digit++;
        }
        if ((y & mask) !== 0) {
          digit = digit + 2;
        }
        quadKeyDigits.push(digit);
      }
      return quadKeyDigits.join('');
    };
    const z = tileCoord[0];
    const x = tileCoord[1];
    const y = -tileCoord[2] - 1;
    // Necesitamos poner un numero aleatorio para que no coja la imagen de la cache
    const aleatorio = Math.random();
    return 'http://t0.tiles.virtualearth.net/tiles/t' + computeQuadKey(x, y, z) + '.png?' + aleatorio;
  }

  // Actualizar Capa trafico
  updateCapaTrafico(event) {
    this.quadKeyLayer.setSource(null);
    if(event === true) {
      this.quadKeysource = new ol.source.XYZ({
            maxZoom: 19,
            tileUrlFunction: this.tileUrlFunction
          });
          this.quadKeyLayer.setSource(this.quadKeysource);
    }
    
  }

  // Actualiza capa precipitaciones
  updateCapaPrecipitaciones(event) {
    this.precipitacionesLayer.setSource(null);
    if(event === true) {
      this.precipitacionesSource = new ol.source.XYZ({
        url: 'http://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=387e3a4d79dd899f25f68e15f3b387ed',
      });
      this.precipitacionesLayer.setSource(this.precipitacionesSource);
    }
  }

  // Actualiza capa temperaturas
  updateCapaTemperaturas(event) {
    this.temperaturasLayer.setSource(null);
    if(event === true) {
      this.temperaturasSource = new ol.source.XYZ({
        url: 'http://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=387e3a4d79dd899f25f68e15f3b387ed',
      });
      this.temperaturasLayer.setSource(this.temperaturasSource);
    }
  }

  // Deja una marca mientras el evento no haya finalizado
  dejarMarcaEvento(map, coordenada, eventoActual) {
    // Preparamos el div
    const div = document.createElement('div');
    const fechaActual = new Date();
    div.id = '' + fechaActual.getTime();
    div.style.display = 'block';
    div.style.width = '500px';
    div.style.height = '500px';
    document.getElementById('map').appendChild(div);
    div.style.backgroundPosition = 'center';
    // Creamos un overlay con el div anterior
    const marcaAgua = new ol.Overlay({
      position: coordenada,
      positioning: 'center-center',
      element: div,
      stopEvent: false
    });
    // Anyamimos al map el overlay
    map.addOverlay(marcaAgua);
    // Ponemos la img al div
    if (eventoActual.tipoEvento.id === 1) {
      div.style.background = 'url(\'../assets/TpteCentenarioMarca.gif\') no-repeat center';
    } else if (eventoActual.tipoEvento.id === 5) {
      div.style.background = 'url(\'../assets/celeb_festivosMarca.gif\') no-repeat center';
    } else if (eventoActual.tipoEvento.id === 6) {
      div.style.background = 'url(\'../assets/interrup_serviciosMarca.gif\') no-repeat center';
    } else if (eventoActual.tipoEvento.id === 7) {
      div.style.background = 'url(\'../assets/medidasEspMarca.gif\') no-repeat center';
    } else if (eventoActual.tipoEvento.id === 8) {
      div.style.background = 'url(\'../assets/militaresMarca.gif\') no-repeat center';
    } else if (eventoActual.tipoEvento.id === 12) {
      div.style.background = 'url(\'../assets/accidentesMarca.gif\') no-repeat center';
    } else if (eventoActual.tipoEvento.id === 4) {
      div.style.background = 'url(\'../assets/regicarMarca.gif\') no-repeat center';
    }
    setTimeout(() => {
      // Una vez terminada la duracion del evento se quitaría la marca
      map.removeOverlay(marcaAgua);
    }, eventoActual.duracionEvento);
  }

}

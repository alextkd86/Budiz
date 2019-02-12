import { Component, /*OnInit,*/ ViewChild } from '@angular/core';
//import { ConfiguracionEventoService, ConfiguracionCapaService } from '../_services/index';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  moduleId: 'module_id',
  templateUrl: './configurationPage.html',
  styleUrls: ['./configurationPage.css']
})
export class ConfigurationPageComponent /*implements OnInit*/ {

/*  errores: any;

  // Variables para la configuracion de los eventos
  listTipoEventoConfiguracion: any;

  @ViewChild('modalSuccess')
  modalSuccess: ModalComponent;

  @ViewChild('modalErrorComprobacion')
  modalErrorComprobacion: ModalComponent;

  @ViewChild('modalErrorServidor')
  modalErrorServidor: ModalComponent;

  // Variables para la configuracion de las capas
  listCapas: any;

  constructor(private configuracionEventoService: ConfiguracionEventoService, private configuracionCapaService: ConfiguracionCapaService) {
  }

  ngOnInit(): void {
    // En un primer momento no tendremos ningun error
    this.errores = [];
    // EVENTOS
    // Inicializamos la lista de parametros de configuracion
    this.listTipoEventoConfiguracion = [];
    this.configuracionEventoService.getConfiguracionesEvento().subscribe(
      data => {
        console.log('Se han recuperado los parametros de configuracion');
        this.listTipoEventoConfiguracion = data;
        // Pasamos los string de mostrar a boolean
        for (const tipoEventoConfiguracion of this.listTipoEventoConfiguracion){
          const mostrar: boolean = tipoEventoConfiguracion.mostrar.valor === 'true';
          tipoEventoConfiguracion.mostrar.valor = mostrar;
        }

      },
      err => {
        console.log('Error durante la recuperacion de la configuracion');
        console.log(err);
      },
      () => {
        console.log('Llamada a parametros de configuracion finalizada');
      });
    // CAPAS
    this.listCapas = [];
    this.configuracionCapaService.getCapas().subscribe(
      capas => {
        console.log('Se han recuperado las capas');
        this.listCapas = capas;
      },
      err => {
        console.log('Error durante la recuperacion de las capas');
        console.log(err);
      },
      () => {
        console.log('Llamada para la recuperacion de las capas finalizada');
      }
    );
  }

  // Revertir cambios en la configuracion, se debería llamar al service
  revertCambios() {
    console.log('LLamar a revertir cambios');
    // Recuperas configuracion eventos
    this.configuracionEventoService.getConfiguracionesEvento().subscribe(
      data => {
        this.listTipoEventoConfiguracion = data;
        // Pasamos los string de mostrar a boolean
        for (const tipoEventoConfiguracion of this.listTipoEventoConfiguracion){
          const mostrar: boolean = tipoEventoConfiguracion.mostrar.valor === 'true';
          tipoEventoConfiguracion.mostrar.valor = mostrar;
        }
      },
      err => {
        console.log(err);
      },
      () => {
        console.log('Llamada a configuracion de eventos finalizada');
      });
    // Recuperar configuracion Capas
    this.configuracionCapaService.getCapas().subscribe(
      capas => {
        this.listCapas = capas;
      },
      err => {
        console.log(err);
      },
      () => {
        console.log('Llamada para la recuperacion de las capas finalizada');
      }
    );
  }

  // Actualiza los parametros de configuracion
  actualizarParametros() {
    console.log('Llamara a actualizar los parametros de configuracion si la tabla no tiene ningun error');
    // Inicializamos la lista de errores a vacio y comprobamos la tabla de configuracion
    this.errores = [];
    this.checkConfiguracion();
    if (this.errores.length !== 0) {
      // Mostramos los errores
      this.modalErrorComprobacion.open();
    } else {
      // Hacemos la llamada al web service para actualizar los parametros
      this.configuracionEventoService.updateConfiguracionEvento(this.listTipoEventoConfiguracion).subscribe(
        data => {
          console.log('Se han actualizado los parametros de configuracion');
          if (data.length === 0) {
            // Una vez que los parametros se han actualizado correctamente procedemos a actualizar las capas
            // La actualizacion de capas nunca debe fallar. Esa es la razon de que se ponga al final
            this.configuracionCapaService.updateCapas(this.listCapas).subscribe(
              dataCapa => {
                console.log('Se han actualizado la configuracion de las capas de configuracion');
                if (data.length === 0) {
                  this.modalSuccess.open();
                }else {
                  // Existen errores
                  console.log(data);
                  this.errores = data;
                  this.modalErrorServidor.open();
                }
              },
              errCapa => {
                console.log(errCapa);
              },
              () => {
                console.log('Llamada a la actualizacion de los parametros de configuracion finalizada');
              }
            );
          }else {
            // Existen errores
            console.log(data);
            this.errores = data;
            this.modalErrorServidor.open();
          }
        },
        err => {
          console.log(err);
        },
        () => {
          console.log('Llamada a la actualizacion de los parametros de configuracion finalizada');
       }
      );
    }
  }

  // Comprueba que listTipoEventoConfiguracion tenga todos los valores correctos
  checkConfiguracion() {
    for (const tipoEventoConfiguracion of this.listTipoEventoConfiguracion) {
      // Comprobamos preaviso es numerioo
      const preaviso = tipoEventoConfiguracion.preaviso.valor;
      if (!isNaN(preaviso)) {
        // Compprobamos que preaviso es un numero entero
        if (Number(preaviso) === parseInt(preaviso, 10)) {
          // Comprobamos que preaviso es un numero mayor que 0
          if ( Number(preaviso) < 0) {
            this.errores.push('Preaviso para el tipo de evento ' + tipoEventoConfiguracion.tipoEventoDto.desc
              + ' debe ser un valor positivo');
          }
        } else {
          this.errores.push('Preaviso para el tipo de evento ' + tipoEventoConfiguracion.tipoEventoDto.desc
            + ' debe ser un valor entero');
        }
      } else {
        this.errores.push('Preaviso para el tipo de evento ' + tipoEventoConfiguracion.tipoEventoDto.desc
          + ' debe ser un valor numérico');
      }

      // Comprobamos duracionAlerta es numerioo
      const duracionAlerta = tipoEventoConfiguracion.duracionAlerta.valor;
      if (!isNaN(duracionAlerta)) {
        // Compprobamos que duracionAlerta es un numero entero
        if (Number(duracionAlerta) === parseInt(duracionAlerta, 10)) {
          // Comprobamos que duracionAlerta es un numero mayor que 0
          if ( Number(duracionAlerta) < 0) {
            this.errores.push('Duración Alerta para el tipo de evento '
              + tipoEventoConfiguracion.tipoEventoDto.desc
            +  ' debe ser un valor positivo');
          }
        } else {
          this.errores.push('Duración Alerta para el tipo de evento '
            + tipoEventoConfiguracion.tipoEventoDto.desc
            + ' debe ser un valor entero');
        }
      } else {
        this.errores.push('Duración Alerta para el tipo de evento ' + tipoEventoConfiguracion.tipoEventoDto.desc
          + ' debe ser un valor numérico');
      }

      // Comprobamos prioridad
      const prioridad = tipoEventoConfiguracion.tipoEventoDto.prioridad.id;
      if (Number(prioridad) < 1 ||  Number(prioridad) > 4) {
        this.errores.push('Prioridad para el tipo de evento ' + tipoEventoConfiguracion.tipoEventoDto.desc + ' tiene un valor incorrecto');
      }
    }
  }
*/
}

// General
import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  HostBinding
} from '@angular/core';
import {
  Plex
} from '@andes/plex/src/lib/core/service';
import * as Enums from './../../utils/enumerados';
import * as moment from 'moment';
import { environment } from './../../../environments/environment';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray
} from '@angular/forms';
import {
  Router,
  ActivatedRoute,
  Params
} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {
  Observable
} from 'rxjs/Observable';
// Interfaces
import {
  IProfesional
} from '../../interfaces/IProfesional';
// Services
import {
  ProfesionalService
} from './../../services/profesional.service';
import { Auth } from '@andes/auth';
import { ExcelService } from '../../services/excel.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-listar-profesionales',
  templateUrl: 'listar-profesionales.html',
  styleUrls: ['listar-profesionales.scss']

})
export class ListarProfesionalesComponent implements OnInit {
  @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
  private profesionales: IProfesional[] = [];
  private profesionalElegido: IProfesional;
  private showListado: Boolean = true;
  public dni: string = null;
  public estadoSeleccionadoG;
  public estadoSeleccionadoE;
  public apellido: string = null;
  public nombre: string = null;
  public vieneDeListado = null;
  public totalProfesionales = null;
  public estadoEspecialidad: {
    id: null,
    nombre: null
  };
  $subject: Subject<void> = new Subject<void>();
  public nuevoProfesional = false;
  public totalProfesionalesRematriculados = null;
  public totalProfesionalesMatriculados = null;
  public matriculaVencida = null;
  public hoy = null;
  public muestraFiltro = false;
  public estado: {
    id: null,
    nombre: null
  };
  public editable = false;
  public confirmar = false;
  public estadosMatriculas: any;
  public verBajas = false;
  public verExportador = false;
  public estaRematriculado;
  public estaMatriculado;
  public mostrarRestablecer;
  public verDeshabilitado;
  modalScrollDistance = 2;
  modalScrollThrottle = 10;
  public limit = 50;
  public exportSisa = {
    fechaDesde: '',
    fechaHasta: ''
  };
  searchForm: FormGroup;
  value;
  constructor(
    private _profesionalService: ProfesionalService,
    private excelService: ExcelService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: Auth,
    public plex: Plex,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      apellido: [''],
      nombre: [''],
      documento: [''],
      estado: '',
      estadoEspecialidad: '',
      verBajas: false,
      verDeshabilitado: false,
      numeroMatriculaGrado: '',
      numeroMatriculaEspecialidad: ''
    });

    this.searchForm.valueChanges.debounceTime(900).subscribe(
      (value) => {
        this.value = value;
        if (this.value.estado.nombre === 'Todos') {
          this.value.estado.nombre = '';
        }
        if (this.value.estadoEspecialidad.nombre === 'Todos') {
          this.value.estadoEspecialidad.nombre = '';
        }
        this.buscar();
      });

    this.buscar();
    this.vieneDeListado = true;
    this.hoy = new Date();
    this.estadosMatriculas = Enums.getObjEstadosMatriculas();
    this._profesionalService.getEstadisticas().subscribe((data) => {
      this.totalProfesionales = data.total;
      this.totalProfesionalesMatriculados = data.totalMatriculados;
      this.totalProfesionalesRematriculados = data.totalRematriculados;
    });
  }

  showProfesional(profesional: any) {
    this.router.navigate(['/profesional', profesional.id]);
  }

  seleccionar(profesional: any) {
    this.profesionalElegido = profesional;
    this.verExportador = false;
  }

  buscar(event?: any) {
    this.verBajas = this.value ? this.value.verBajas : false;
    this.profesionalElegido = null;
    const doc = this.dni ? this.dni : '';
    const apellidoProf = this.apellido ? this.apellido : '';
    this._profesionalService.getProfesional({
      documento: this.value ? this.value.documento : '',
      apellido: this.value ? this.value.apellido : '',
      nombre: this.value ? this.value.nombre : '',
      estado: this.value ? this.value.estado.nombre : '',
      estadoE: this.value ? this.value.estadoEspecialidad.nombre : '',
      bajaMatricula: this.value ? this.value.verBajas : false,
      rematriculado: this.estaRematriculado ? this.estaRematriculado : 0,
      matriculado: this.estaMatriculado ? this.estaMatriculado : 0,
      habilitado: this.value ? this.value.verDeshabilitado : false,
      numeroMatriculaGrado: this.value ? this.value.numeroMatriculaGrado : '',
      numeroMatriculaEspecialidad: this.value ? this.value.numeroMatriculaEspecialidad : '',
      matriculacion: true,
      limit: this.limit

    }).subscribe((data) => {
      this.profesionales = data;
      // this.totalProfesionales = data.length;
      let totalR = 0;
      let totalM = 0;
      for (let _i = 0; _i < this.profesionales.length; _i++) {
        if (this.profesionales[_i].rematriculado === 1) {
          totalR += 1;
        } else {
          totalM += 1;
        }
      }
      // this.totalProfesionalesRematriculados = totalR;
      // this.totalProfesionalesMatriculados = totalM;


      if (environment.production === true) {
        // this.comprebaVenciomientoGrado();
        // this.comprebaVenciomientoPosGrado();

      }

    });


  }
  cerrarResumenProfesional() {
    this.profesionalElegido = null;
  }

  sobreTurno(profesional: any) {
    this.router.navigate(['/solicitarTurnoRenovacion', profesional.id]);
  }


  comprebaVenciomientoGrado() {
    for (let _n = 0; _n < this.profesionales.length; _n++) {
      if (this.profesionales[_n].habilitado === true) {
        for (let _i = 0; _i < this.profesionales[_n].formacionGrado.length; _i++) {
          if (this.profesionales[_n].formacionGrado[_i].matriculacion) {
            // tslint:disable-next-line:max-line-length
            if (environment.production === true) {
              // tslint:disable-next-line:max-line-length
              const notificado = this.profesionales[_n].formacionGrado[_i].matriculacion[this.profesionales[_n].formacionGrado[_i].matriculacion.length - 1].notificacionVencimiento;
              const fechaFin = moment(this.profesionales[_n].formacionGrado[_i].matriculacion[this.profesionales[_n].formacionGrado[_i].matriculacion.length - 1].fin);
              const hoy = moment(this.hoy);
              const contactos = this.profesionales[_n].contactos;
              let tieneEmail = false;
              let tieneCelular = false;
              let numeroCelular;
              // Comprueba si tiene email y celular
              contactos.forEach(element => {
                if (element.tipo === 'email') {
                  tieneEmail = true;
                }
                if (element.tipo === 'celular') {
                  tieneCelular = true;
                  numeroCelular = Number(element.valor);
                }
              });

              // si faltan 5 dias,tiene un celular asignado y no esta notificado envia el mensaje
              if (fechaFin.diff(hoy, 'days') <= 5 && notificado === false && tieneCelular) {
                const nombreCompleto = this.profesionales[_n].apellido + ' ' + this.profesionales[_n].nombre;
                const smsParams = {
                  telefono: numeroCelular,
                  // tslint:disable-next-line:max-line-length
                  mensaje: 'Estimado ' + nombreCompleto + ', una de sus matriculas esta por vencer, por favor sacar un turno para realizar la renovacion de la misma.',
                };
                this._profesionalService.enviarSms(smsParams).subscribe();
                // tslint:disable-next-line:max-line-length
                this.profesionales[_n].formacionGrado[_i].matriculacion[this.profesionales[_n].formacionGrado[_i].matriculacion.length - 1].notificacionVencimiento = true;
                const cambio = {
                  'op': 'updateEstadoGrado',
                  'data': this.profesionales[_n].formacionGrado,
                };

                this._profesionalService.patchProfesional(this.profesionales[_n].id, cambio).subscribe((data) => {

                });

              }

              // si faltan 5 dias,tiene un celular asignado y no esta notificado envia el mail
              if (fechaFin.diff(hoy, 'days') <= 5 && notificado === false && tieneEmail) {
                // tslint:disable-next-line:max-line-length
                this.profesionales[_n].formacionGrado[_i].matriculacion[this.profesionales[_n].formacionGrado[_i].matriculacion.length - 1].notificacionVencimiento = true;

                this._profesionalService.enviarMail({ profesional: this.profesionales[_n] }).subscribe();
                const cambio = {
                  'op': 'updateEstadoGrado',
                  'data': this.profesionales[_n].formacionGrado,
                };

                this._profesionalService.patchProfesional(this.profesionales[_n].id, cambio).subscribe((data) => {

                });
              }
            }
            // si se vence la matricula o se da de baja cambia estados de la misma
            // tslint:disable-next-line:max-line-length
            if (this.profesionales[_n].formacionGrado[_i].matriculado === true && this.profesionales[_n].formacionGrado[_i].matriculacion[this.profesionales[_n].formacionGrado[_i].matriculacion.length - 1].fin <= this.hoy) {
              this.profesionales[_n].formacionGrado[_i].matriculado = false;
              this.profesionales[_n].formacionGrado[_i].papelesVerificados = false;

              const cambio = {
                'op': 'updateEstadoGrado',
                'data': this.profesionales[_n].formacionGrado,
              };

              this._profesionalService.patchProfesional(this.profesionales[_n].id, cambio).subscribe((data) => {

              });

            }

          }

        }
      }

    }
  }

  comprebaVenciomientoPosGrado() {
    for (let _n = 0; _n < this.profesionales.length; _n++) {
      if (this.profesionales[_n].habilitado === true) {
        if (this.profesionales[_n].formacionPosgrado) {
          for (let _i = 0; _i < this.profesionales[_n].formacionPosgrado.length; _i++) {
            if (this.profesionales[_n].formacionPosgrado[_i].matriculacion.length > 0) {
              if (environment.production === true) {
                // tslint:disable-next-line:max-line-length
                const notificado = this.profesionales[_n].formacionPosgrado[_i].matriculacion[this.profesionales[_n].formacionPosgrado[_i].matriculacion.length - 1].notificacionVencimiento;
                const fechaFin = moment(this.profesionales[_n].formacionPosgrado[_i].matriculacion[this.profesionales[_n].formacionPosgrado[_i].matriculacion.length - 1].fin);
                const hoy = moment(this.hoy);
                const contactos = this.profesionales[_n].contactos;
                let tieneEmail = false;
                let tieneCelular = false;
                let numeroCelular;
                contactos.forEach(element => {
                  if (element.tipo === 'email') {
                    tieneEmail = true;
                  }
                  if (element.tipo === 'celular') {
                    tieneCelular = true;
                    numeroCelular = Number(element.valor);
                  }
                });

                if (fechaFin.diff(hoy, 'days') <= 5 && notificado === false && tieneCelular) {
                  const nombreCompleto = this.profesionales[_n].apellido + ' ' + this.profesionales[_n].nombre;
                  const smsParams = {
                    telefono: numeroCelular,
                    // tslint:disable-next-line:max-line-length
                    mensaje: 'Estimado ' + nombreCompleto + ', una de sus matriculas esta por vencer, por favor sacar un turno para realizar la renovacion de la misma.',
                  };
                  this._profesionalService.enviarSms(smsParams).subscribe();
                  // tslint:disable-next-line:max-line-length
                  this.profesionales[_n].formacionPosgrado[_i].matriculacion[this.profesionales[_n].formacionPosgrado[_i].matriculacion.length - 1].notificacionVencimiento = true;
                  const cambio = {
                    'op': 'updateEstadoPosGrado',
                    'data': this.profesionales[_n].formacionPosgrado,
                  };

                  this._profesionalService.patchProfesional(this.profesionales[_n].id, cambio).subscribe((data) => {

                  });


                }
                if (fechaFin.diff(hoy, 'days') <= 5 && notificado === false && tieneEmail) {
                  // tslint:disable-next-line:max-line-length
                  this.profesionales[_n].formacionPosgrado[_i].matriculacion[this.profesionales[_n].formacionPosgrado[_i].matriculacion.length - 1].notificacionVencimiento = true;

                  this._profesionalService.enviarMail({ profesional: this.profesionales[_n] }).subscribe();
                  const cambio = {
                    'op': 'updateEstadoPosGrado',
                    'data': this.profesionales[_n].formacionPosgrado,
                  };

                  this._profesionalService.patchProfesional(this.profesionales[_n].id, cambio).subscribe((data) => {

                  });



                }
              }
              // tslint:disable-next-line:max-line-length
              if (this.profesionales[_n].formacionPosgrado[_i].matriculado === true && this.profesionales[_n].formacionPosgrado[_i].matriculacion[this.profesionales[_n].formacionPosgrado[_i].matriculacion.length - 1].fin.getFullYear() <= this.hoy.getFullYear()) {
                this.profesionales[_n].formacionPosgrado[_i].matriculado = false;
                this.profesionales[_n].formacionPosgrado[_i].papelesVerificados = false;
                const cambio = {
                  'op': 'updateEstadoPosGrado',
                  'data': this.profesionales[_n].formacionPosgrado,
                };

                this._profesionalService.patchProfesional(this.profesionales[_n].id, cambio).subscribe((data) => {

                });


              }
            }
          }
        }
      }

    }
  }

  matriculadoGrado() {
    if (this.estado == null) {
      this.estadoSeleccionadoG = null;
    } else {
      if (this.estado.nombre === 'Suspendidas') {
        this.estadoSeleccionadoG = this.estado.nombre;
      }
      if (this.estado.nombre === 'Vigentes') {
        this.estadoSeleccionadoG = this.estado.nombre;
      }
      if (this.estado.nombre === 'Todos') {
        this.estadoSeleccionadoG = null;
      }
    }
    this.buscar();
  }

  matriculadoEspecialidad() {
    if (this.estadoEspecialidad == null) {
      this.estadoSeleccionadoE = null;
    } else {
      if (this.estadoEspecialidad.nombre === 'Suspendidas') {
        this.estadoSeleccionadoE = this.estadoEspecialidad.nombre;
      }
      if (this.estadoEspecialidad.nombre === 'Vigentes') {
        this.estadoSeleccionadoE = this.estadoEspecialidad.nombre;
      }
      if (this.estadoEspecialidad.nombre === 'Todos') {
        this.estadoSeleccionadoE = null;
      }
    }
    this.buscar();
  }

  filtrarRematriculados() {
    // this.filtroRematriculados = true;
    // this.filtroMatriculados = false;
    this.estaRematriculado = true;
    this.estaMatriculado = false;
    this.mostrarRestablecer = true;
    this.buscar();
  }

  filtrarMatriculados() {

    this.estaMatriculado = true;
    this.estaRematriculado = false;
    this.mostrarRestablecer = true;
    this.buscar();
  }

  filtrarTodos() {
    this.estaMatriculado = false;
    this.estaRematriculado = false;
    this.mostrarRestablecer = false;
    this.buscar();
  }

  mostrarFiltros() {
    if (this.muestraFiltro === false) {
      this.muestraFiltro = true;
    } else {
      this.muestraFiltro = false;
    }

  }


  verNuevoProfesional(valor) {
    if (valor === true) {
      this.nuevoProfesional = true;
      this.confirmar = true;
    } else {
      this.nuevoProfesional = false;

    }

  }

  onModalScrollDown() {
    this.limit = this.limit + 15;
    this.buscar();
  }

  // exportarSisa() {
  //   this._profesionalService.getProfesionalesSisa(this.exportSisa).subscribe((data) => {
  //     console.log(data);
  //     this.excelService.exportAsExcelFile(data, 'profesionales');
  //     this.plex.toast('success', 'se genero con exito el reporte!', 'informacion', 1000);


  //   });
  // }


}

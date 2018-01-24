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
  public vieneDeListado = null;
  public totalProfesionales = null;
  public estadoEspecialidad: {
    id: null,
    nombre: null
  };
  public totalProfesionalesRematriculados = null;
  public totalProfesionalesMatriculados = null;
  public profesionalesRematriculados = [];
  public profesionalesMatriculados = [];
  public matriculaVencida = null;
  public hoy = null;
  public muestraFiltro = false;
  public estado: {
    id: null,
    nombre: null
  };
  public estadosMatriculas: any;
  public filtroRematriculados;
  public filtroMatriculados;
  public filtroTodos;
  public verBajas = false;
  constructor(
    private _profesionalService: ProfesionalService,
    private excelService: ExcelService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: Auth,
    public plex: Plex) { }

  ngOnInit() {

    this.buscar();
    this.vieneDeListado = true;
    this.hoy = new Date();
    this.estadosMatriculas = Enums.getObjEstadosMatriculas();

  }

  showProfesional(profesional: any) {
    this.router.navigate(['/profesional', profesional.id]);
  }

  seleccionar(profesional: any) {
    this.profesionalElegido = profesional;
  }

  buscar(event?: any) {

    this.profesionalesMatriculados = [];
    this.profesionalesRematriculados = [];
    this.profesionalElegido = null;
    const doc = this.dni ? this.dni : '';
    const apellidoProf = this.apellido ? this.apellido : '';
    this._profesionalService.getProfesional({
      documento: doc,
      apellido: apellidoProf,
      estado: this.estadoSeleccionadoG,
      estadoE: this.estadoSeleccionadoE,
      bajaMatricula: this.verBajas ? this.verBajas : false
    })
      .subscribe((data) => {
        this.profesionales = data;
        this.totalProfesionales = data.length;
        let totalR = 0;
        let totalM = 0;
        for (let _i = 0; _i < this.profesionales.length; _i++) {
          if (this.profesionales[_i].rematriculado !== false) {
            this.profesionalesRematriculados.push(this.profesionales[_i]);
            totalR += 1;
          } else {
            this.profesionalesMatriculados.push(this.profesionales[_i]);
            totalM += 1;
          }



        }
        this.totalProfesionalesRematriculados = totalR;
        this.totalProfesionalesMatriculados = totalM;
        if (this.filtroTodos === true) {
          this.profesionales = data;
        }
        if (this.filtroRematriculados === true) {
          this.profesionales = this.profesionalesRematriculados;
        }
        if (this.filtroMatriculados === true) {
          this.profesionales = this.profesionalesMatriculados;
        }


        this.comprebaVenciomientoGrado();
        this.comprebaVenciomientoPosGrado();


        // this.excelService.exportAsExcelFile(this.profesionales,'profesionales')
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
      for (let _i = 0; _i < this.profesionales[_n].formacionGrado.length; _i++) {
        if (this.profesionales[_n].formacionGrado[_i].matriculacion) {
          // tslint:disable-next-line:max-line-length

          // tslint:disable-next-line:max-line-length
          const notificado = this.profesionales[_n].formacionGrado[_i].matriculacion[this.profesionales[_n].formacionGrado[_i].matriculacion.length - 1].notificacionVencimiento;
          const fechaFin = moment(this.profesionales[_n].formacionGrado[_i].matriculacion[this.profesionales[_n].formacionGrado[_i].matriculacion.length - 1].fin);
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
            this.profesionales[_n].formacionGrado[_i].matriculacion[this.profesionales[_n].formacionGrado[_i].matriculacion.length - 1].notificacionVencimiento = true;
            this._profesionalService.putProfesional(this.profesionales[_n])
              .subscribe(resp => {
                this.profesionales[_n] = resp;
              });

          }

          if (fechaFin.diff(hoy, 'days') <= 5 && notificado === false && tieneEmail) {
            // tslint:disable-next-line:max-line-length
            this.profesionales[_n].formacionGrado[_i].matriculacion[this.profesionales[_n].formacionGrado[_i].matriculacion.length - 1].notificacionVencimiento = true;
            this._profesionalService.putProfesional(this.profesionales[_n])
              .subscribe(resp => {
                this.profesionales[_n] = resp;
              });
            this._profesionalService.enviarMail({ profesional: this.profesionales[_n] }).subscribe();

          }

          // tslint:disable-next-line:max-line-length
          if (this.profesionales[_n].formacionGrado[_i].matriculado === true && this.profesionales[_n].formacionGrado[_i].matriculacion[this.profesionales[_n].formacionGrado[_i].matriculacion.length - 1].fin <= this.hoy) {
            this.profesionales[_n].formacionGrado[_i].matriculado = false;
            this.profesionales[_n].formacionGrado[_i].papelesVerificados = false;
            this._profesionalService.putProfesional(this.profesionales[_n])
              .subscribe(resp => {
                this.profesionales[_n] = resp;
              });

          }
        }
      }

    }
  }

  comprebaVenciomientoPosGrado() {
    for (let _n = 0; _n < this.profesionales.length; _n++) {
      if (this.profesionales[_n].formacionPosgrado) {
        for (let _i = 0; _i < this.profesionales[_n].formacionPosgrado.length; _i++) {
          if (this.profesionales[_n].formacionPosgrado[_i].matriculacion.length > 0) {
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
              this._profesionalService.putProfesional(this.profesionales[_n])
                .subscribe(resp => {
                  this.profesionales[_n] = resp;
                });

            }
            if (fechaFin.diff(hoy, 'days') <= 5 && notificado === false && tieneEmail) {
              // tslint:disable-next-line:max-line-length
              this.profesionales[_n].formacionPosgrado[_i].matriculacion[this.profesionales[_n].formacionPosgrado[_i].matriculacion.length - 1].notificacionVencimiento = true;
              this._profesionalService.putProfesional(this.profesionales[_n])
                .subscribe(resp => {
                  this.profesionales[_n] = resp;
                });
              this._profesionalService.enviarMail({ profesional: this.profesionales[_n] }).subscribe();

            }
            // tslint:disable-next-line:max-line-length
            if (this.profesionales[_n].formacionPosgrado[_i].matriculado === true && this.profesionales[_n].formacionPosgrado[_i].matriculacion[this.profesionales[_n].formacionPosgrado[_i].matriculacion.length - 1].fin.getFullYear() <= this.hoy.getFullYear()) {
              this.profesionales[_n].formacionPosgrado[_i].matriculado = false;
              this.profesionales[_n].formacionPosgrado[_i].papelesVerificados = false;
              this._profesionalService.putProfesional(this.profesionales[_n])
                .subscribe(resp => {
                  this.profesionales[_n] = resp;
                });

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
    this.filtroRematriculados = true;
    this.filtroMatriculados = false;
    this.buscar();
  }

  filtrarMatriculados() {
    this.filtroMatriculados = true;
    this.filtroRematriculados = false;
    this.buscar();
  }

  filtrarTodos() {
    this.filtroTodos = true;
    this.filtroRematriculados = false;
    this.filtroMatriculados = false;
    this.buscar();
  }

  mostrarFiltros() {
    if (this.muestraFiltro === false) {
      this.muestraFiltro = true;
    } else {
      this.muestraFiltro = false;
    }

  }

  bajas() {
    this.buscar();
  }


}

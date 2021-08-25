import { Component, OnInit, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

// Services
import { ProfesionalService } from './../../../services/profesional.service';
import { TurnoService } from './../../../services/turno.service';

// Utils
import { PDFUtils } from './../../../utils/PDFUtils';
import * as Enums from './../../../utils/enumerados';
import { IProfesional } from './../../../interfaces/IProfesional';
import { Params, ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

import { jsPDF } from 'jspdf';
@Component({
  selector: 'app-seleccion-profesional',
  templateUrl: './seleccion-profesional.component.html'
})
export class SeleccionProfesionalComponent implements OnInit {
  @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
  public tipoTurno: Enums.TipoTurno;
  private formTurno: FormGroup;
  public turnoSeleccionado: boolean;
  public turnoGuardado: boolean;
  private _turnoSeleccionado: Date;
  private _profesionalID: string;
  public _nuevoProfesional: any;
  public id = null;
  public fecha = null;
  public documento;
  public nombre;
  public apellido;
  public profEncontrado: any = [];
  public horarioElegido: string;

  public profesional: IProfesional = {
    id: null,
    habilitado: true,
    // profesionalMatriculado: null,
    nombre: null,
    apellido: null,
    tipoDocumento: null,
    documento: null,
    documentoVencimiento: null,
    cuit: null,
    fechaNacimiento: null,
    lugarNacimiento: '',
    nacionalidad: {
      nombre: null,
      codigo: null,
    },
    sexo: undefined,
    contactos: [{
      tipo: 'celular',
      valor: '',
      rank: 0,
      activo: true,
      ultimaActualizacion: new Date()
    }],
    domicilios: [{
      tipo: 'real',
      valor: '',
      codigoPostal: '',
      ubicacion: {
        localidad: null,
        provincia: null,
        pais: null,
      },
      ultimaActualizacion: new Date(),
      activo: true
    },
    {
      tipo: 'legal',
      valor: null,
      codigoPostal: null,
      ubicacion: {
        localidad: null,
        provincia: null,
        pais: null,
      },
      ultimaActualizacion: new Date(),
      activo: true
    },
    {
      tipo: 'profesional',
      valor: null,
      codigoPostal: null,
      ubicacion: {
        localidad: null,
        provincia: null,
        pais: null,
      },
      ultimaActualizacion: new Date(),
      activo: true
    }
    ],
    fotoArchivo: null,
    firmas: null,
    formacionGrado: [{
      profesion: {
        nombre: null,
        codigo: null,
        tipoDeFormacion: null
      },
      entidadFormadora: {
        nombre: null,
        codigo: null,
      },
      titulo: null,
      fechaEgreso: null,
      fechaTitulo: null,
      renovacion: false,
      papelesVerificados: false,
      matriculacion: null,
      matriculado: false
    }],
    formacionPosgrado: null,
    origen: null,
    sanciones: null,
    notas: null,
    rematriculado: 0,
    agenteMatriculador: '',
    OtrosDatos: null,
    idRenovacion: null,
    // createdAT: null,
    documentoViejo: null
  };
  public profElegido;
  public noEncontrado = false;

  constructor(private _formBuilder: FormBuilder,
    private _turnosService: TurnoService,
    private route: ActivatedRoute,
    private _profesionalService: ProfesionalService,
    private _pdfUtils: PDFUtils,
    private plex: Plex,
    private router: Router) {

    this.tipoTurno = Enums.TipoTurno.renovacion;

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });

    this.route.queryParams.subscribe(params => {
      this.fecha = params['fecha'];
      this.onTurnoSeleccionado(this.fecha);
    });
  }

  onTurnoSeleccionado(turno: Date) {
    this._turnoSeleccionado = turno;
    this.turnoSeleccionado = true;
    this.horarioElegido = moment(this.fecha).format('LLLL');
    if (this.id) {
      this.saveSobreTurno();
    }
  }

  saveTurno() {

    this.formTurno = this._formBuilder.group({
      fecha: this._turnoSeleccionado,
      tipo: this.tipoTurno,
      profesional: this._nuevoProfesional._id
    });

    this._turnosService.saveTurnoMatriculacion({ turno: this.formTurno.value })
      .subscribe(turno => {
        const pdf = this._pdfUtils.comprobanteTurnoRenovacion(turno);
        pdf.save('Turno ' + this._nuevoProfesional.nombre + ' ' + this._nuevoProfesional.apellido + '.pdf');
      });
  }

  isSelected() {
    return this.profElegido;
  }

  saveSobreTurno() {

    this._profesionalService.getProfesional({ id: this.id }).subscribe(
      (profesional: any) => {
        profesional[0].idRenovacion = this.id;
        profesional[0].id = null;
        delete profesional[0]._id;
        this._turnosService.saveTurnoSolicitados(profesional[0])
          .subscribe((nuevoProfesional) => {
            this.formTurno = this._formBuilder.group({
              fecha: this._turnoSeleccionado,
              tipo: this.tipoTurno,
              profesional: nuevoProfesional._id
            });
          });
      });
  }

  buscar($event) {
    if ($event.formValid) {
      this._profesionalService.getResumenProfesional({ documento: this.documento, nombre: this.nombre, apellido: this.apellido }).subscribe(resp => {
        if (resp.length === 0) {
          this.noEncontrado = true;
        }
        this.profEncontrado = resp;
        this.profElegido = resp[0];
        this.profesionalEncontrado(this.profElegido);
      });
    }
  }

  onProfesionalCompleto() {
    const parametros = {
      documento: this.profesional.documento,
      tipoTurno: 'renovacion',
      sexo: this.profesional.sexo
    };
    this._turnosService.getTurnosPorDocumento(parametros).subscribe((resultado: any) => {
      if (resultado.length === 0) {
        this._turnosService.saveTurnoSolicitados(this.profesional)
          .subscribe((nuevoProfesional) => {
            if (nuevoProfesional == null) {
              this.plex.info('info', 'El profesional que quiere agregar ya existe(verificar dni)');
            } else {

              this._nuevoProfesional = nuevoProfesional;
              this.turnoGuardado = true;
              if (this._turnoSeleccionado && this._nuevoProfesional) {
                this.saveTurno();
              }
              this.plex.toast('success', 'Se registro con exito!', 'informacion', 1000);
              this.router.navigate(['requisitosGenerales']);
            }
          });
      } else {
        this.plex.info('info', 'Usted ya tiene un turno para el día <strong>' + moment(resultado.fecha).format('DD MMMM YYYY, h:mm a' + '</strong>'));

      }
    });

  }

  profesionalEncontrado(profEncontrado) {
    if (profEncontrado) {
      this.profElegido = profEncontrado;
      this.profesional.idRenovacion = profEncontrado.idRenovacion;
      this.profesional.nombre = profEncontrado.nombre;
      this.profesional.apellido = profEncontrado.apellido;
      this.profesional.documento = profEncontrado.documento;
      this.profesional.fechaNacimiento = profEncontrado.fechaNacimiento;
      this.profesional.sexo = profEncontrado.sexo;
      this.profesional.formacionGrado = profEncontrado.formacionGrado;
    }
  }
}

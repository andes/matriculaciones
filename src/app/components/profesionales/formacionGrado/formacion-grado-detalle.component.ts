// Angular
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';
// Plex
import {
  Plex
} from '@andes/plex';

// Interfaces
import {
  IProfesional
} from './../../../interfaces/IProfesional';

// Services
import { ProfesionalService } from './../../../services/profesional.service';
import { NumeracionMatriculasService } from './../../../services/numeracionMatriculas.service';

// Utils
import { PDFUtils } from './../../../utils/PDFUtils';
import { Auth } from '@andes/auth';

@Component({
  selector: 'app-formacion-grado-detalle',
  templateUrl: 'formacion-grado-detalle.html',
  styleUrls: ['grado.scss']
})
export class FormacionGradoDetalleComponent implements OnInit {

  @Input() formacion: any;
  @Input() index: any;
  @Input() profesional: IProfesional;
  @Output() matriculacion = new EventEmitter();
  @Output() cerrarDetalle = new EventEmitter();
  public esSupervisor;
  public motivoBaja;
  edit = false;
  private hoy = null;
  public edicionBajas = false;
  public edicionGestion = false;
  public indexGestion;
  public indexBaja;
  public tieneBajas = false;
  constructor(private _profesionalService: ProfesionalService,
    private _numeracionesService: NumeracionMatriculasService,
    private _pdfUtils: PDFUtils, private plex: Plex, public auth: Auth) { }



  ngOnInit() {
    this.hoy = new Date();
    this.compruebaBajas();
    this.esSupervisor = this.auth.check('matriculaciones:supervisor:aprobar');
  }

  cerrar() {
    this.cerrarDetalle.emit(false);
  }


  matricularProfesional(formacion: any, mantenerNumero) {
    let texto = '¿Desea agregar una nueva matricula?';
    if (mantenerNumero) {
      texto = '¿Desea mantener el numero de la matricula?';
    }

    this.plex.confirm(texto).then((resultado) => {
      if (resultado) {
        let revNumero = null;
        if (formacion.matriculacion === null) {
          revNumero = 0;
        } else {
          if (formacion.matriculacion[formacion.matriculacion.length - 1].revalidacionNumero) {
            revNumero = formacion.matriculacion[formacion.matriculacion.length - 1].revalidacionNumero;
          } else {
            revNumero = formacion.matriculacion.length;
          }
        }
        this._numeracionesService.getOne({ codigoSisa: formacion.profesion.codigo })
          .subscribe((num) => {

            num = num.data;
            if (num.length === 0) {
              this.plex.info('info', 'No tiene ningun numero de matricula asignado');
            } else {
              let matriculaNumero;
              if (mantenerNumero === false) {
                matriculaNumero = num[0].proximoNumero;
                num[0].proximoNumero = matriculaNumero + 1;
                this.formacion.fechaDeInscripcion = new Date();
              }

              if (mantenerNumero) {
                matriculaNumero = this.formacion.matriculacion[this.formacion.matriculacion.length - 1].matriculaNumero;
              }
              const vencimientoAnio = (new Date()).getUTCFullYear() + 5;
              const oMatriculacion = {
                matriculaNumero: matriculaNumero,
                libro: '',
                folio: '',
                inicio: new Date(),
                baja: {
                  motivo: '',
                  fecha: ''
                },
                notificacionVencimiento: false,
                fin: new Date(new Date(this.profesional.fechaNacimiento).setFullYear(vencimientoAnio)),
                revalidacionNumero: revNumero + 1
              };


              this._numeracionesService.putNumeracion(num[0])
                .subscribe(newNum => {
                  this.formacion.renovacion = false;
                  this.formacion.matriculado = true;
                  this.profesional.formacionGrado[this.index] = this.formacion;
                  if (this.profesional.formacionGrado[this.index].matriculacion === null) {
                    this.profesional.formacionGrado[this.index].matriculacion = [oMatriculacion];
                  } else {
                    this.profesional.formacionGrado[this.index].matriculacion.push(oMatriculacion);
                  }
                  this.actualizar();

                });
            }
          });

      }
    });
  }

  papelesVerificados() {
    this.formacion.papelesVerificados = true;
    this.formacion.matriculado = false;
    this.profesional.supervisor = {
      id: this.auth.usuario.id,
      nombreCompleto: this.auth.usuario.nombreCompleto
    };
    this.profesional.formacionGrado[this.index] = this.formacion;
    this._profesionalService.putProfesional(this.profesional)
      .subscribe(resp => {
        this.profesional = resp;
      });

  }

  renovar() {
    this.formacion.papelesVerificados = false;
    this.formacion.renovacion = true;
    this.profesional.formacionGrado[this.index] = this.formacion;
    this.actualizar();
  }

  editarMatriculacion(index) {
    this.edicionGestion = true;
    this.indexGestion = index;
  }

  editarBaja(index) {
    this.edicionBajas = true;
    this.indexBaja = index;
  }

  guardarBaja() {
    this.actualizar();
    this.edicionBajas = false;
  }

  guardarGestion() {
    let vencimientoAnio = (new Date(this.formacion.matriculacion[this.indexGestion].inicio)).getUTCFullYear() + 5;
    this.formacion.matriculacion[this.indexGestion].fin = new Date(new Date(this.profesional.fechaNacimiento).setFullYear(vencimientoAnio));
    this.actualizar();
    this.edicionGestion = false;
  }

  cancelarEdicionBaja() {
    this.edicionBajas = false;
    this.indexBaja = null;
  }

  cancelarEdicionGestion() {
    this.edicionGestion = false;
    this.indexGestion = null;
  }

  darDeBaja() {
    this.plex.confirm('¿Desea dar de baja esta matrícula?').then((resultado) => {
      if (resultado) {
        this.profesional.formacionGrado[this.index].matriculado = false;
        this.profesional.formacionGrado[this.index].papelesVerificados = false;
        this.profesional.formacionGrado[this.index].matriculacion[this.profesional.formacionGrado[this.index].matriculacion.length - 1].baja.motivo = this.motivoBaja;
        this.profesional.formacionGrado[this.index].matriculacion[this.profesional.formacionGrado[this.index].matriculacion.length - 1].baja.fecha = new Date();
        this.actualizar();
        this.compruebaBajas();
      }
    });


  }

  renovarAntesVencimiento() {
    this.plex.confirm('¿Desea renovar antes de la fecha del vencimiento?').then((resultado) => {
      if (resultado) {
        this.formacion.papelesVerificados = false;
        this.formacion.renovacion = true;
        this.profesional.formacionGrado[this.index] = this.formacion;
        this.actualizar();
      }
    });
  }

  actualizar() {
    const cambio = {
      'op': 'updateEstadoGrado',
      'data': this.profesional.formacionGrado,
      'agente': this.auth.usuario.nombreCompleto
    };
    this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
      this.profesional = data;
    });

  }

  compruebaBajas() {
    let contador = 0;
    if (this.profesional.formacionGrado[this.index].matriculacion) {
      for (let _n = 0; _n < this.profesional.formacionGrado[this.index].matriculacion.length; _n++) {
        if (this.profesional.formacionGrado[this.index].matriculacion[_n].baja && this.profesional.formacionGrado[this.index].matriculacion[_n].baja.motivo !== '') {
          contador += 1;
        }
      }
      if (contador > 0) {
        this.tieneBajas = true;
      }
    }
  }



}

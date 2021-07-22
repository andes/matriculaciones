import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

// Services
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProfesionService } from './../../services/profesion.service';
import { EntidadFormadoraService } from './../../services/entidadFormadora.service';
import { ProfesionalService } from './../../services/profesional.service';
import { TurnoService } from './../../services/turno.service';
import * as moment from 'moment';

// Utils
import { PDFUtils } from './../../utils/PDFUtils';
import * as Enums from './../../utils/enumerados';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sabado'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const jsPDF = require('jspdf');

@Component({
  selector: 'app-solicitar-turno-matriculacion',
  templateUrl: 'solicitar-turno-matriculacion.html'
})
export class SolicitarTurnoMatriculacionComponent implements OnInit {
  @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
  public tipoTurno: Enums.TipoTurno;
  public tipoMatricula: string;
  public fecha = null;
  public profesionalRegistrado = null;
  public fechaElegida = null;
  private formTurno: FormGroup;
  public turnoSeleccionado: boolean;
  public turnoGuardado: boolean;
  private _turnoSeleccionado: Date;
  public _nuevoProfesional: any;
  public horarioElegido: string;
  constructor(private _formBuilder: FormBuilder,
    private _turnosService: TurnoService,
    private router: Router,
    private route: ActivatedRoute,
    private _pdfUtils: PDFUtils,
    private plex: Plex) {

    this.tipoTurno = Enums.TipoTurno.matriculacion;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {

      if (params['tipoMatricula']) {
        if (params['tipoMatricula'] === 'universitaria') {
          this.tipoMatricula = 'universitaria';
        } else {
          this.tipoMatricula = 'tecnicaaux';
        }
      }
      if (params['profesional']) {
        const profJson = JSON.parse(params['profesional']);
        this.profesionalRegistrado = profJson;
        this.fechaElegida = params['fechaElegida'];
        this.onTurnoSeleccionado(this.fechaElegida);
        this.onProfesionalCompleto(this.profesionalRegistrado);
      }
    });
  }

  onTurnoSeleccionado(turno: Date) {
    this._turnoSeleccionado = turno;
    this.turnoSeleccionado = true;
    this.horarioElegido = moment(this._turnoSeleccionado).format('llll');
  }

  saveTurno() {

    this.formTurno = this._formBuilder.group({
      fecha: this._turnoSeleccionado,
      tipo: this.tipoTurno,
      profesional: this._nuevoProfesional._id
    });

    this._turnosService.saveTurnoMatriculacion({ turno: this.formTurno.value }).pipe(
      catchError((err) => {
        this.plex.info('warning', err);
        this.router.navigate(['requisitosGenerales']);
        return null;
      })
    ).subscribe((turno) => {
      if (turno) {
        const pdf = this._pdfUtils.comprobanteTurno(turno);
        pdf.save('Turno ' + this._nuevoProfesional.nombre + ' ' + this._nuevoProfesional.apellido + '.pdf');
        this.plex.toast('success', 'Se registro con exito!', 'informacion', 1000);
        this.router.navigate(['requisitosGenerales']);
      }
    });


  }

  onProfesionalCompleto(profesional: any) {
    const parametros = {
      documento: profesional.documento,
      tipoTurno: 'matriculacion',
      sexo: profesional.sexo
    };
    this._turnosService.getTurnosPorDocumento(parametros).subscribe((resultado: any) => {
      if (resultado.length === 0) {
        this._turnosService.saveTurnoSolicitados(profesional)
          .subscribe((nuevoProfesional) => {
            if (nuevoProfesional == null) {
              this.plex.info('info', 'El profesional que quiere agregar ya existe(verificar dni)');
            } else {
              this._nuevoProfesional = nuevoProfesional;
              this.turnoGuardado = true;
              if (this._turnoSeleccionado && this._nuevoProfesional) {
                this.saveTurno();
              }
            }
          });
      } else {
        this.plex.info('info', 'usted ya tiene un turno para el dia <strong>' + moment(resultado[0].fecha).format('DD MMMM YYYY, h:mm a' + '</strong>'));
      }
    });
  }
}

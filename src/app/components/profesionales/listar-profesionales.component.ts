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
  templateUrl: 'listar-profesionales.html'
})
export class ListarProfesionalesComponent implements OnInit {
  @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
  private profesionales: IProfesional[] = [];
  private profesionalElegido: IProfesional;
  private showListado: Boolean = true;
  public dni: string = null;
  public apellido: string = null;
  public vieneDeListado = null;
  public totalProfesionales = null;
  public profesionalesRematriculados = [];
  public profesionalesMatriculados = [];
  public matriculaVencida = null;
  constructor(
    private _profesionalService: ProfesionalService,
    private excelService: ExcelService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: Auth) {}

  ngOnInit() {
    this.buscar();
    this.vieneDeListado = true;
  }

  showProfesional(profesional: any) {
    this.router.navigate(['/profesional', profesional.documento]);
  }

  seleccionar(profesional: any) {
    this.profesionalElegido = profesional;
  }

  buscar(event ?: any) {
    this.profesionalesMatriculados = [];
    this.profesionalesRematriculados = [];
    this.profesionalElegido = null;
    const doc = this.dni ? this.dni : '';
    const apellidoProf = this.apellido ? this.apellido : '';
    this._profesionalService.getProfesional({documento: doc, apellido: apellidoProf})
      .subscribe((data) => {
        this.profesionales = data;
        this.totalProfesionales = data.length;

        for (var _i = 0; _i < this.profesionales.length; _i++) {
          if (this.profesionales[_i].rematriculado !== false) {
            this.profesionalesRematriculados.push(this.profesionales[_i]);

          }else {
            this.profesionalesMatriculados.push(this.profesionales[_i]);
          }

       }
        // this.excelService.exportAsExcelFile(this.profesionales,'profesionales')
      });
  }
  cerrarResumenProfesional() {
    this.profesionalElegido = null;
  }

  sobreTurno(profesional: any) {
    this.router.navigate(['/solicitarTurnoRenovacion', profesional.id]);
  }
}

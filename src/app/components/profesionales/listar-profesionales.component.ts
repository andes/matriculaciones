// General
import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter
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

@Component({
  selector: 'app-listar-profesionales',
  templateUrl: 'listar-profesionales.html'
})
export class ListarProfesionalesComponent implements OnInit {
  private profesionales: IProfesional[] = [];
  private profesionalElegido: IProfesional;
  private showListado: Boolean = true;
  public dni: string = null;
  public apellido: string = null;
  constructor(
    private _profesionalService: ProfesionalService,
    private route: ActivatedRoute,
    private router: Router) {}

  ngOnInit() {
    this.buscar();
  }

  showProfesional(profesional: any) {
    this.router.navigate(['/profesional', profesional.id]);
  }

  seleccionar(profesional: any) {
    this.profesionalElegido = profesional;
  }

  buscar(event ?: any) {
    this.profesionalElegido = null;
    const doc = this.dni ? this.dni : '';
    const apellidoProf = this.apellido ? this.apellido : '';
    this._profesionalService.getProfesional({documento: doc, apellido: apellidoProf})
      .subscribe((data) => {
        this.profesionales = data;
      });
  }
}

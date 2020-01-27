// Angular
import {
  OnInit,
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

// Plex
import { Plex } from '@andes/plex';

// Interfaces
import { IProfesional } from './../../../interfaces/IProfesional';
import { ISiisa } from './../../../interfaces/ISiisa';

// Services
import { SIISAService } from './../../../services/siisa.service';
import { ProfesionalService } from './../../../services/profesional.service';
import { EntidadFormadoraService } from './../../../services/entidadFormadora.service';
import { ProfesionService } from '../../../services/profesion.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-formacion-grado-form',
  templateUrl: 'formacion-grado-form.html'
})
export class FormacionGradoFormComponent implements OnInit {
  formPosgrado: FormGroup;
  @Input() profesional: IProfesional;
  activeAcc = false;
  profesiones: any[];
  public showOtraEntidadFormadora = false;
  profesionalGrado: any = {
    exportadoSisa: false,
    profesion: null,
    entidadFormadora: null,
    titulo: null,
    fechaEgreso: null,
    fechaTitulo: null,
    renovacion: false,
    papelesVerificados: false,
    matriculacion: null,
  };

  @Output() submitGrado = new EventEmitter();

  constructor(private _fb: FormBuilder,
    private _siisaSrv: SIISAService,
    private _profSrv: ProfesionalService,
    private _entidadFormadoraService: EntidadFormadoraService,
    private plex: Plex,
    private _profesionService: ProfesionService, private _profesionalService: ProfesionalService, ) { }

  ngOnInit() {
    if (this.profesional) {
      this.profesiones = this.profesional.formacionGrado.map((value) => {
        return value.profesion;
      });
    }
  }

  onSubmit($event, form) {
    if ($event.formValid) {
      const existeProfesion = this.profesional.formacionGrado.find(x => x.profesion.codigo === this.profesionalGrado.profesion.codigo);
      if (existeProfesion) {
        this.plex.info('warning', 'El usuario ya posee esta profesion asignada');
      } else {
        this.submitGrado.emit(this.profesionalGrado);
        this.plex.toast('success', 'la solicitud se envio con exito!', 'informacion', 1000);
      }
    }

  }


  loadEntidadesFormadoras(event) {
    this._entidadFormadoraService.getEntidadesFormadoras().pipe(catchError(() => of(null))).subscribe(event.callback);
  }

  loadProfesiones(event) {
    this._profesionService.getProfesiones().subscribe(event.callback);
  }


  otraEntidad(f) {
    f.entidadFormadora = {
      nombre: null,
      codigo: null
    };
  }
}

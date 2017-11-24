import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';

// Services
import { ProfesionalService } from './../../services/profesional.service';

@Component({
    selector: 'app-listar-profesionales',
    templateUrl: 'listar-profesionales.html'
})
export class ListarProfesionalesComponent implements OnInit {
    private formBuscarProfesionales: FormGroup;
    private profesionales: any[] = [];
    private profesionalElegido: any;
    private showListado: Boolean = true;

    constructor(
        private _formBuilder: FormBuilder,
        private _profesionalService: ProfesionalService,
        private route: ActivatedRoute,
        private router: Router) { }

    onScroll() {
    }

    ngOnInit() {
        this.formBuscarProfesionales = this._formBuilder.group({
            busquedaDoc: '',
            busquedaApellido: ''
        });

        this.buscar();
    }

    showTurno(profesional: any) {
        this.profesionalElegido = profesional;
    }

    isSelected(profesional: any) {
        return this.profesionalElegido && profesional.id === this.profesionalElegido.id;
    }

    showProfesional(profesional: any) {
        this.profesionalElegido = profesional;
        this.router.navigate(['/profesional', profesional.documento]);
    }

    buscar(event?: any) {

         const consulta = this.formBuscarProfesionales.value;
         consulta.offset = event ? event.query.offset : 0;
         consulta.size = event ? event.query.size : 10;

          this._profesionalService.getProfesional(consulta)
            .subscribe((resp) => {

                 this.profesionales = resp;
                //   if (event) {
                //       event.callback(resp);
                //   }
              });
     }

    // showProfesional(turno: any) {
    //     this.router.navigate(['/profesional', turno.profesional.id]);
    }


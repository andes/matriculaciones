import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';


@Component({
    selector: 'app-listado-turnos',
    templateUrl: 'listado-turnos.html'
})
export class ListadoTurnosComponent implements OnInit {

    ngOnInit() {
        console.log('On Init');
    }


}

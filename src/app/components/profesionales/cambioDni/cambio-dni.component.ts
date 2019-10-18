import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

// Services
import { PaisService } from './../../../services/pais.service';
import { CambioDniService } from './../../../services/cambioDni.service';


// Utils
import * as enumerados from './../../../utils/enumerados';
import { PDFUtils } from './../../../utils/PDFUtils';
import { IProfesional } from './../../../interfaces/IProfesional';
import { Params, ActivatedRoute } from '@angular/router';
import { ProfesionalService } from '../../../services/profesional.service';

const jsPDF = require('jspdf');

@Component({
    selector: 'app-cambio-dni',
    templateUrl: 'cambio-dni.html'
})
export class CambioDniComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    public dniActual;
    public nombre;
    public apellido;
    public profEncontrado: any = null;
    public profElegido;
    public cambioDNI: any = {
        nombre: null,
        apellido: null,
        nacionalidad: null,
        idProfesional: null,
        dniActual: null,
        dniNuevo: null,
        fecha: new Date(),
        atendida: false
    };
    public sexos;



    constructor(private _formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private _paisService: PaisService,
        private _cambioDniService: CambioDniService,
        private _profesionalService: ProfesionalService,
        private plex: Plex) {



    }

    ngOnInit() {

        this.sexos = enumerados.getObjSexos();

    }

    loadPaises(event) {
        this._paisService.getPaises().subscribe(event.callback);
    }


    save($event, form) {
        if ($event.formValid) {
            this.cambioDNI.dniActual = this.profElegido.documento;
            this.cambioDNI.nombre = this.profElegido.nombre;
            this.cambioDNI.apellido = this.profElegido.apellido;
            this.cambioDNI.idProfesional = this.profElegido.idRenovacion;
            this.cambioDNI.nacionalidad = this.profElegido.nacionalidad;
            // tslint:disable-next-line:max-line-length
            // this.cambioDNI.sexo = this.cambioDNI.sexo ? ((typeof this.cambioDNI.sexo === 'string')) ? this.cambioDNI.sexo : (Object(this.cambioDNI.sexo).id) : null;
            this._cambioDniService.saveCambio(this.cambioDNI).subscribe(res => {
                this.plex.toast('success', 'la solicitud se envio con exito!', 'informacion', 1000);
            });
        }
    }

    buscar() {
        // tslint:disable-next-line:max-line-length
        this._profesionalService.getResumenProfesional({ documento: this.dniActual, nombre: this.nombre, apellido: this.apellido }).subscribe(resp => {
            this.profEncontrado = resp;

        });
    }

    profesionalEncontrado(profEncontrado) {
        this.profElegido = profEncontrado;
        this.cambioDNI.dniActual = profEncontrado.documento;
    }

    isSelected() {
        return this.profElegido;
    }


}



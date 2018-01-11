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

const jsPDF = require('jspdf');

@Component({
    selector: 'app-cambio-dni',
    templateUrl: 'cambio-dni.html'
})
export class CambioDniComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public cambioDNI: any = {
        nombre: null,
        apellido: null,
        sexo: null,
        nacionalidad: null,
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
        private plex: Plex) {



    }

    ngOnInit() {

        this.sexos = enumerados.getObjSexos();

    };

    loadPaises(event) {
        this._paisService.getPaises().subscribe(event.callback);
      }


    save($event, form) {
        if ($event.formValid) {
        // tslint:disable-next-line:max-line-length
        this.cambioDNI.sexo = this.cambioDNI.sexo ? ((typeof this.cambioDNI.sexo === 'string')) ? this.cambioDNI.sexo : (Object(this.cambioDNI.sexo).id) : null;
        this._cambioDniService.saveCambio(this.cambioDNI).subscribe(res => {
            this.plex.toast('success', 'la solicitud se envio con exito!', 'informacion', 1000);
        });
    }
    }

}



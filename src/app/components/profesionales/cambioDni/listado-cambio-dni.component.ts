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
    templateUrl: 'listado-cambio-dni.html',
    styles: ['.margenBadge { position: relative; top: 24px; }']

})
export class ListadoCambioDniComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public cambioDNI: any = {
        nombre: null,
        apellido: null,
        idProfesional: null,
        nacionalidad: null,
        dniActual: null,
        dniNuevo: null
    };
    public sexos;
    public solicitudesDeCambio = [];
    public solicitudElegida;
    public Match = true;



    constructor(private _formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private _paisService: PaisService,
        private _cambioDniService: CambioDniService,
        private plex: Plex,
        private _profesionalService: ProfesionalService) {



    }

    ngOnInit() {
        this.sexos = enumerados.getObjSexos();
        this.traeListado();

    };

    loadPaises(event) {
        this._paisService.getPaises().subscribe(event.callback);
    }


    traeListado() {
        const contenedor = [];
        this._cambioDniService.get().subscribe(data => {
            for (let _n = 0; _n < data.length; _n++) {
                if (data[_n].atendida === false) {
                    contenedor.push(data[_n]);
                }
            }
            this.solicitudesDeCambio = contenedor;

        });
    }

    seleccionar(solicitud: any) {
        this.solicitudElegida = solicitud;
        this.Match = true;
    }

    cerrarResumenSolicitud() {
        this.solicitudElegida = null;
    }

    aprobar() {


        this._profesionalService.getProfesional({ id: this.solicitudElegida.idProfesional }).subscribe(profesional => {
            if (profesional.length === 0) {
                this.plex.alert('No existe ningun profesional con este DNI');
                this.Match = false;
            } else {
                console.log(profesional)
                profesional[0].documento = this.solicitudElegida.dniNuevo;
                profesional[0].documentoViejo = this.solicitudElegida.dniActual;
                console.log(profesional[0]);
                this._profesionalService.putProfesional(profesional[0]).subscribe(newProf => {
                    this.solicitudElegida.atendida = true;
                    this._cambioDniService.saveCambio(this.solicitudElegida).subscribe();
                    this.plex.toast('success', 'la solicitud se envio con exito!', 'informacion', 1000);
                    this.traeListado();
                    this.cerrarResumenSolicitud();
                });
            }
        });
    }

    eliminar() {
        this.solicitudElegida.atendida = true;
        this._cambioDniService.saveCambio(this.solicitudElegida).subscribe();
        this.traeListado();
        this.cerrarResumenSolicitud();
        this.Match = true;
    }

}



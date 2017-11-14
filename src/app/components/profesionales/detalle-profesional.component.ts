import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Plex } from '@andes/plex/src/lib/core/service';
// Settings
import { AppSettings } from './../../app.settings';

// Utils
import { PDFUtils } from './../../utils/PDFUtils';

// Enums
import {
    getEnumAsObjects,
    EstadoCivil,
    TipoContacto,
    TipoDomicilio } from './../../utils/enumerados';

// Services
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProfesionService } from './../../services/profesion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EntidadFormadoraService } from './../../services/entidadFormadora.service';
import { SexoService } from './../../services/sexo.service';
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';
import { DataService } from './../../services/data.service';

// Interfaces
import { IProfesional } from './../../interfaces/IProfesional';
import 'rxjs/add/operator/switchMap';


const jsPDF = require('jspdf');

@Component({
    selector: 'app-detalle-profesional',
    templateUrl: 'detalle-profesional.html'
})
export class DetalleProfesionalComponent implements OnInit {
    public formSancion: FormGroup;
    public loading: Boolean = false;
    public indexFormacionGradoSelected: any;
    public indexFormacionPosgradoSelected: any;
    public mostrar = true;
    public mostrarGrado = true;


    @Input() profesional: IProfesional;
    @Output() onShowListado = new EventEmitter();
    @Output() showFormacion = new EventEmitter();


    constructor(private _profesionalService: ProfesionalService,
        private _formBuilder: FormBuilder,
        private _pdfUtils: PDFUtils,
        private _numeracionesService: NumeracionMatriculasService,
        private route: ActivatedRoute,
        private router: Router) {}


    ngOnInit() {
        this.route.params
            .switchMap((params: Params)  =>
                this._profesionalService.getUnProfesional(params['id'])
            ).subscribe(
                (profesional:  IProfesional) =>
                this.profesional = profesional
            );
    }

    updateProfesional2(profesional: IProfesional) {
        this._profesionalService.saveProfesional(profesional)
            .subscribe(prof => {
                this.profesional = prof;
            });
        // this.profesional = profesional;
    }

    updateProfesional(callbackData?: any) {
         this._profesionalService.saveProfesional(this.profesional)
            .subscribe(resp => {
                this.profesional = resp;
                if (callbackData) {
                    callbackData.callback(callbackData.param);
                }
            });
    }


    guardarFoto(fileName: any) {
        this.profesional.fotoArchivo = fileName;
        this.updateProfesional();
    }

    guardarFirma(oFirma) {
        if (this.profesional.firmas) {
            this.profesional.firmas.push(oFirma);
        } else {
            this.profesional.firmas = [oFirma];
        }
      
        this.updateProfesional();
    }

    guardarNotas(textoNotas) {
        this.profesional.notas = textoNotas;
        this.updateProfesional();
    }

    guardarSancion(sancion: any) {
        this.profesional.sanciones.push(sancion);
        this.updateProfesional();
    }

    guardarFormacionPosgrado(posgrado: any) {
        this.profesional.formacionPosgrado.push(posgrado);
        this.updateProfesional();
    }

    matricularProfesional(matriculacion: any) {
        this.profesional.formacionGrado[this.indexFormacionGradoSelected].matriculacion.push(matriculacion);
        this.updateProfesional();
    }

    /*aprobarProfesional() {
        this._numeracionesService.getOne(this.profesional.formacionGrado[0].profesion.codigo.toString())
            .subscribe((num) => {

                const vencimientoAnio = (new Date()).getUTCFullYear() + 5;

                const oMatriculacion = {
                    matriculaNumero: num.proximoNumero++,
                    libro: '',
                    folio: '',
                    inicio: new Date(),
                    fin: new Date(new Date(this.profesional.fechaNacimiento).setFullYear(vencimientoAnio)),
                    revalidacionNumero: this.profesional.formacionGrado[0].matriculacion.length + 1
                };

                this.profesional.formacionGrado[0].matriculacion.push(oMatriculacion);


                this._profesionalService.saveProfesional(this.profesional)
                    .subscribe(profesional => {

                        this.profesional = profesional;
                        this._numeracionesService.saveNumeracion(num)
                            .subscribe(newNum => {
                                // console.log('Numeracion Actualizada');
                            });
                    });
            });
    }*/

    volver() {
        this.router.navigate(['/turnos', { id: this.profesional.id}]);
    }
    volverP() {
        this.router.navigate(['/listarProfesionales']);
    }

   /* generarCredencial() {
        this.loading = true;
        this._profesionalService.getCredencial(this.profesional._id)
            .subscribe((resp) => {
                const pdf = this._pdfUtils.generarCredencial(resp, this.profesional);
                pdf.save('Credencial ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
                //this.loading = false;
            });


    }*/

    formacionGradoSelected(formacion: any) {
        if (this.mostrarGrado === true) {
        this.indexFormacionPosgradoSelected = undefined;
        this.indexFormacionGradoSelected = formacion;
        this.mostrarGrado = false;
        } else {
         this.indexFormacionGradoSelected = undefined;
         this.mostrarGrado = true;
     }
    }

    formacionPosgradoSelected(posgrado: any) {

        if (this.mostrar === true) {
         this.indexFormacionGradoSelected = undefined;
        this.indexFormacionPosgradoSelected = posgrado;
        this.mostrar = false;
        }else {
            this.indexFormacionPosgradoSelected = undefined;
            this.mostrar = true;
        }
    }
}

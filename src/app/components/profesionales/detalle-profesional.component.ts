import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
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
import { TurnoService } from '../../services/turno.service';
import { Auth } from '@andes/auth';


const jsPDF = require('jspdf');

@Component({
    selector: 'app-detalle-profesional',
    templateUrl: 'detalle-profesional.html',
    styles: ['.margenFoto { padding-left: 4%; padding-bottom: 1%; }']

})
export class DetalleProfesionalComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    public formSancion: FormGroup;
    public loading: Boolean = false;
    public indexFormacionGradoSelected: any;
    public indexFormacionPosgradoSelected: any;
    public mostrar = true;
    public mostrarGrado = true;
    public img64 = null;
    public vieneDeDetalle = null;
    @Input() public flag = null;
    public confirmar = true;
    public tieneFirma = null;
    public editable = false;

    @Input()  public profesional: IProfesional = {
        id: null,
        habilitado: true,
        nombre: null,
        apellido: null,
        documento: null,
        documentoVencimiento: null,
        cuit: null,
        fechaNacimiento: null,
        lugarNacimiento: '',
        nacionalidad: {
            nombre: null,
            codigo: null,
        },
        sexo: undefined,
        estadoCivil: undefined,
        contactos: [{
            tipo: 'celular',
            valor: '',
            rank: 0,
            activo: true,
            ultimaActualizacion: new Date()
        }],
        domicilios: [{
            tipo: 'real',
            valor: '',
            codigoPostal: '',
            ubicacion: {
                localidad: '',
                provincia: '',
                pais: '',
            },
            ultimaActualizacion: new Date(),
            activo: true
        },
        {
            tipo: 'legal',
            valor: null,
            codigoPostal: null,
            ubicacion: {
                localidad: null,
                provincia: null,
                pais: null,
            },
            ultimaActualizacion: new Date(),
            activo: true
        },
        {
            tipo: 'profesional',
            valor: null,
            codigoPostal: null,
            ubicacion: {
                localidad: null,
                provincia: null,
                pais: null,
            },
            ultimaActualizacion: new Date(),
            activo: true
        }],
        fotoArchivo: null,
        firmas: null,
        formacionGrado: [{
            profesion: {
                nombre: null,
                codigo: null,
                tipoDeFormacion: null
            },
            entidadFormadora: {
                nombre: null,
                codigo: null,
            },
            titulo: null,
            fechaEgreso: null,
            fechaTitulo: null,
            renovacion: false,
            papelesVerificados: false,
            matriculacion: [{
                matriculaNumero: null,
                libro: null,
                folio: null,
                inicio: null,
                fin: null,
                baja: null,
                revalidacionNumero: null,
            }],
            matriculado: false
        }],
        formacionPosgrado: null,
        origen: null,
        sanciones: null,
        notas: null,
        rematriculado: false,
        agenteMatriculador: '',
        OtrosDatos: null,
        idRenovacion: null,
        documentoViejo: null
    };



    @Output() onShowListado = new EventEmitter();
    @Output() showFormacion = new EventEmitter();


    constructor(private _profesionalService: ProfesionalService,
        private _turnoService: TurnoService,
        private _formBuilder: FormBuilder,
        private _pdfUtils: PDFUtils,
        private _numeracionesService: NumeracionMatriculasService,
        private route: ActivatedRoute,
        private router: Router,
        public auth: Auth) {}


    ngOnInit() {
        this.route.params.subscribe( params => console.log(params));
        this.vieneDeDetalle = true;
        this.route.params
            .switchMap((params: Params)  =>
                this._profesionalService.getProfesional({id: params['id']})
            ).subscribe(
                (profesional:  any) => {
                    // me fijo si existe en la coleccion de profesionales permatentes si hay uno con ese dni
                    if (profesional.length === 0) {
                        this.flag = false;
                    }else {
                        this.profesional = profesional[0];
                        this.flag = true;
                    }
                    // si flag es false significa que no hay entonces trae el profesional temporal para llenar el formulario
                    if (this.flag === false) {
                    this.route.params
                        .switchMap((paramsTemporal: Params)  =>
                            this._turnoService.getTurnoSolicitados(paramsTemporal['id'])
                        ).subscribe(
                            (profesionalTemporal: any) => {
                                this.profesional = profesionalTemporal;
                            }
                        );
                    }



                }

            );
    }


    updateProfesional(callbackData?: any) {
        this.profesional.agenteMatriculador = this.auth.usuario.nombreCompleto;
         this._profesionalService.putProfesional(this.profesional)
            .subscribe(resp => {
                this.profesional = resp;
                if (callbackData) {
                    callbackData.callback(callbackData.param);
                }
            });

    }

    previewImg(img: any) {
        this.img64 = img;
    }

    updateFoto(img: any) {
        this.img64 = img;
        const imagenPro = {
            'img': img,
            'idProfesional': this.profesional.id
        };
        this._profesionalService.saveProfesional({imagen: imagenPro}).subscribe(resp => {

        });
   }

   updateFirma(firma: any) {
    const firmaPro = {
        'firmaP': firma,
        'idProfesional': this.profesional.id
    };
    this._profesionalService.saveProfesional({firma: firmaPro}).subscribe(resp => {

    });
   }

    guardarFotoGrid(foto: any) {
        this.updateFoto(foto);
    }

    guardarFirmaGrid(oFirma) {
        this.updateFirma(oFirma);
    }

    guardarFirmaAdminGrid(oFirma) {
        const firmaADmin = {
            'firma': oFirma.firma,
            'nombreCompleto': oFirma.nombreCompleto,
            'idProfesional': this.profesional.id
        };
        this._profesionalService.saveProfesional({firmaAdmin: firmaADmin}).subscribe(resp => {

        });
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

    guardarOtrosDatos(otrosDatos) {
        this.profesional.OtrosDatos = otrosDatos;
        this.updateProfesional();
    }

    matricularProfesional(matriculacion: any) {
        if (this.profesional.formacionGrado[this.indexFormacionGradoSelected].matriculacion === null) {
            this.profesional.formacionGrado[this.indexFormacionGradoSelected].matriculacion = [matriculacion];
        }else {
        this.profesional.formacionGrado[this.indexFormacionGradoSelected].matriculacion.push(matriculacion);
    }
        this.updateProfesional();
    }

    matricularProfesionalEspecialidad(matriculacion: any) {
        if (this.profesional.formacionPosgrado[this.indexFormacionPosgradoSelected].matriculacion === null) {
            this.profesional.formacionPosgrado[this.indexFormacionPosgradoSelected].matriculacion = [matriculacion];
        }else {
        this.profesional.formacionPosgrado[this.indexFormacionPosgradoSelected].matriculacion.push(matriculacion);
    }
        this.updateProfesional();
    }

    volver() {
        this.router.navigate(['/turnos', { id: this.profesional.id}]);
    }
    volverP() {
        this.router.navigate(['/listarProfesionales']);
    }


    formacionGradoSelected(formacion: any) {
        this.mostrar = true;
        this.indexFormacionGradoSelected = formacion;
        if (this.mostrarGrado === true) {
        this.mostrarGrado = false;

        } else {
         this.mostrarGrado = true;
     }
    }

    formacionPosgradoSelected(posgrado: any) {
        this.mostrarGrado = true;
        this.indexFormacionPosgradoSelected = posgrado;
        if (this.mostrar === true) {
            this.mostrar = false;
        }else {
            this.mostrar = true;
        }


    }

    editar() {
        this.flag = false;
        this.editable = true;
    }
    // generarCredencial() {

    //             // this._profesionalService.getCredencial(this.profesional.id)
    //             //     .subscribe((resp) => {
    //                     const pdf = this._pdfUtils.generarCredencial(this.profesional);
    //                     pdf.save('Credencial ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
    //                     // this.loading = false;
    //              //   });
    //         }
}


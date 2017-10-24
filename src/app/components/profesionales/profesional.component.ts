import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
//import { Plex } from '@andes/plex/src/lib/core/service';
//import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { Plex } from '@andes/plex';

// Enums
import * as enumerados from './../../utils/enumerados';
import {
    getEnumAsObjects,
    Sexo,
    EstadoCivil,
    TipoContacto }  from './../../utils/enumerados';
   
    

// Services
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProfesionService } from './../../services/profesion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EntidadFormadoraService } from './../../services/entidadFormadora.service';
import { SexoService } from './../../services/sexo.service';

// Interfaces
import { IProfesional } from './../../interfaces/IProfesional';
import { ISiisa } from './../../interfaces/ISiisa';

@Component({
    selector: 'app-profesional',
    templateUrl: 'profesional.html'
})
export class ProfesionalComponent implements OnInit {
    public formProfesionalComp: FormGroup;
    public sexos: any;
    public provincias: any[];
    public localidades: any[];
    public estadoCivil : any;
    public tipoComunicacion: any[];

    // public estadosCiviles: any[];
    public showOtraEntidadFormadora: Boolean = false;
    @Input()
    //private profesional: IProfesional
    private profesional: any = {
        habilitado: Boolean,
        nombre: null,
        apellido: null,
        documentoNumero: null,
        documentoVencimiento: null,
        cuit: null,
        fechaNacimiento: '',
        lugarNacimiento: '',
        nacionalidad: {
            nombre: null,
            codigo: null,
        },
        sexo: null,
        estadoCivil: null,
        contactos: [{
            tipo: 'celular',
            valor: '',
            ranking: 0,
            activo: true,
            ultimaActualizacion: new Date()
        }],
        domicilios: [{
            tipo: 'real',
            valor: '',
            direccion: null,
            codigoPostal: null,
            ubicacion: {
                localidad:null,
                provincia: null,
                pais: null,
            },
            ultimaActualizacion: new Date(),
            activo: true
        },
        {
            tipo: 'legal',
            valor: '',
            direccion: null,
            codigoPostal: null,
            ubicacion: {
                localidad:null,
                provincia: null,
                pais: null,
            },
            ultimaActualizacion: new Date(),
            activo: true
        },
        {
            tipo: 'profesional',
            valor: '',
            direccion: null,
            codigoPostal: null,
            ubicacion: {
                localidad:null,
                provincia: null,
                pais: null,
            },
            ultimaActualizacion: new Date(),
            activo: true
        }],
        formacionGrado: [{
            profesion: {
                nombre: '',
                codigo: null,
            },
            entidadFormadora: {
                nombre:null,
                codigo: null,
            },
            titulo: null,
            fechaEgreso: '',
            fechaTitulo: '',
        }],

        
        
    };

    @Output() public onProfesionalCompleto: EventEmitter<IProfesional> = new EventEmitter<IProfesional>();

    constructor(private _formBuilder: FormBuilder,
        private _sexoService: SexoService,
        private _paisService: PaisService,
        private _provinciaService: ProvinciaService,
        private _localidadService: LocalidadService,
        private _profesionService: ProfesionService,
        private _profesionalService: ProfesionalService,
        private _entidadFormadoraService: EntidadFormadoraService,
        private plex: Plex) {

          
         }

    ngOnInit() {
        this.estadoCivil = enumerados.getObjsEstadoCivil()
        this.sexos = enumerados.getObjSexos();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
    }



    prueba(){
        console.log(this.profesional)
        
    }

    showOtra(entidadFormadora) {
        if (entidadFormadora.value) {
            this.showOtraEntidadFormadora = entidadFormadora.value.nombre === 'Otra';
        }
    }

    confirmarDatos($event) {
        if ($event.formValid){
        console.log(this.profesional)
      
            let profesionalOperation: any;

            profesionalOperation = this._profesionalService.saveProfesional(this.profesional);
            console.log('ok1');
            profesionalOperation.subscribe(resultado => {
                console.log('ok2');
                this.plex.toast('success', 'Su turno se registro con exito!','informacion', 1000);
            });

            this.onProfesionalCompleto.emit(this.profesional);
        }  
       
        

        // model.contactos.forEach(contacto => {
        //     contacto.tipo = contacto.tipo.toLowerCase();
        // });

        // this.onProfesionalCompleto.emit(model);
    }

    // Filtrado de combos
    loadPaises(event) {
        this._paisService.getPaises().subscribe(event.callback);
    }

    loadProvincias(pais) {
        console.log(pais.value)
        this._provinciaService.get({ 'pais': pais.value.id })
            .subscribe(resp => {
                this.provincias = resp;
            });
    }

    loadLocalidades(provincia) {
        if (provincia.value) {
            this._localidadService.getXProvincia(provincia.value.id)
                .subscribe(resp => {
                    this.localidades = resp;
                });
        }
    }

    loadProfesiones(event) {
        this._profesionService.getProfesiones().subscribe(event.callback);
    }

    loadEntidadesFormadoras(event) {
        this._entidadFormadoraService.getEntidadesFormadoras().subscribe(event.callback);
    }

    loadSexos(event) {
        this._sexoService.getSexos().subscribe(event.callback);
    }
    addContacto() {
        let nuevoContacto = Object.assign({}, {
            tipo: 'celular',
            valor: '',
            ranking: 0,
            activo: true,
            ultimaActualizacion: new Date()
        });
        this.profesional.contactos.push(nuevoContacto);
    }

    removeContacto(i) {
        if (i >= 0) {
            this.profesional.contactos.splice(i, 1);
        }
    }

    completar(){
        this.profesional.domicilios[1].direccion = this.profesional.domicilios[0].direccion;
        this.profesional.domicilios[1].codigoPostal = this.profesional.domicilios[0].codigoPostal;        
        this.profesional.domicilios[1].ubicacion.pais = this.profesional.domicilios[0].ubicacion.pais;
        this.profesional.domicilios[1].ubicacion.provincia = this.profesional.domicilios[0].ubicacion.provincia;
        this.profesional.domicilios[1].ubicacion.localidad = this.profesional.domicilios[0].ubicacion.localidad

        this.profesional.domicilios[2].direccion = this.profesional.domicilios[0].direccion;
        this.profesional.domicilios[2].codigoPostal = this.profesional.domicilios[0].codigoPostal;        
        this.profesional.domicilios[2].ubicacion.pais = this.profesional.domicilios[0].ubicacion.pais;
        this.profesional.domicilios[2].ubicacion.provincia = this.profesional.domicilios[0].ubicacion.provincia;
        this.profesional.domicilios[2].ubicacion.localidad = this.profesional.domicilios[0].ubicacion.localidad
    }
}

import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

// Enums
import {
    getEnumAsObjects,
    Sexo,
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

// Interfaces
import { IProfesional } from './../../interfaces/IProfesional';


@Component({
    selector: 'app-profesional',
    templateUrl: 'profesional.html'
})
export class ProfesionalComponent implements OnInit {
    public formProfesionalComp: FormGroup;
    public formsDomicilios: FormArray;
    public formsContactos: FormArray;
    public sexos: any[];
    public estadosCiviles: any[];
    public showOtraEntidadFormadora: Boolean = false;
    @Input() profesionalID: string;
    private profesional: IProfesional;

    @Output() public onProfesionalCompleto: EventEmitter<IProfesional> = new EventEmitter<IProfesional>();

    constructor(private _formBuilder: FormBuilder,
        private _sexoService: SexoService,
        private _paisService: PaisService,
        private _provinciaService: ProvinciaService,
        private _localidadService: LocalidadService,
        private _profesionService: ProfesionService,
        private _profesionalService: ProfesionalService,
        private _entidadFormadoraService: EntidadFormadoraService) {

            this.buildForm();
         }

    ngOnInit() {

        this.estadosCiviles = getEnumAsObjects(EstadoCivil);
        // this.sexos = getEnumAsObjects(Sexo);
        /*this._sexoService.getSexos().subscribe(sexos => {
            this.sexos = sexos;
            console.log(sexos)*/

            /*this._profesionalService.getProfesional('58ab35ad07a4b51cf0b311b0')
                .subscribe(profesional => {
                    this.buildForm(profesional);
                });*/
        /*});*/

    }

    private newFormContacto(tipoContacto: String, rankContacto: Number,
        valorContacto: String = null,
        ultimaActualizacionContacto: Date = new Date(),
        isActivo: Boolean = true) {

        return this._formBuilder.group({
            tipo: [tipoContacto, Validators.required],
            valor: [valorContacto, Validators.required],
            rank: [rankContacto, Validators.required],
            ultimaActualizacion: [ultimaActualizacionContacto, Validators.required],
            activo: [isActivo, Validators.required]
        });
    }

    private newFormDomicilio(tipoDom: String,
        valorDom: String = null,
        codigoPostalDom: String = null,
        localidadUbicacionDom: String = null,
        provinciaUbicacionDom: String = null,
        paisUbicacionDom: String = null,
        ultimaActualizacionContacto: Date = new Date(),
        isActivo: Boolean = true) {

        return this._formBuilder.group({
            tipo: [tipoDom, Validators.required],
            valor: [valorDom, Validators.required],
            codigoPostal: [codigoPostalDom, Validators.required],
            ubicacion: this._formBuilder.group({
                localidad: [localidadUbicacionDom, Validators.required],
                provincia: [provinciaUbicacionDom, Validators.required],
                pais: [paisUbicacionDom, Validators.required]
            }),
            activo: [isActivo, Validators.required]
        });
    }

    buildForm(model?: any) {

        if (model) {

            // Domicilios.
            const doms = [];
            model.domicilios.forEach(domicilio => {
                doms.push(this.newFormDomicilio(domicilio.tipo,
                    domicilio.valor,
                    domicilio.codigoPostal,
                    domicilio.ubicacion.pais,
                    domicilio.ubicacion.provincia,
                    domicilio.ubicacion.localidad));

            });

            this.formsDomicilios = this._formBuilder.array(doms);

            // Contatos
            const ctcs = [];
            model.contactos.forEach((contacto, i) => {
                ctcs.push(this.newFormContacto(contacto.tipo,
                    (contacto.rank ? contacto.rank : i + 1 ),
                    contacto.valor,
                    contacto.ultimaActualizacion,
                    contacto.activo));
            });

            this.formsContactos = this._formBuilder.array(ctcs);



        } else {
            this.formsDomicilios = this._formBuilder.array([
                this.newFormDomicilio(TipoDomicilio.legal.toString()),
                this.newFormDomicilio(TipoDomicilio.real.toString()),
                this.newFormDomicilio(TipoDomicilio.profesional.toString())
            ]);

            this.formsContactos = this._formBuilder.array([
                this.newFormContacto(TipoContacto.celular.toString(), 1),
                this.newFormContacto(TipoContacto.email.toString(), 2),
                this.newFormContacto(TipoContacto.fijo.toString(), 3)
            ]);

        }
            console.log(this.formsContactos);



        this.formProfesionalComp = this._formBuilder.group({
            cuitCuil: [
                model ? model.cuitCuil : null,
                [Validators.required, PlexValidator.min(0)]],
            apellidos: [
                model ? model.apellidos : null,
                Validators.required],
            nombres: [
                model ? model.nombres : null,
                Validators.required],
            documentoNumero: [
                model ? model.documentoNumero : null,
                [Validators.required, PlexValidator.min(0)]],
            documentoVencimiento: [
                model ? model.documentoVencimiento : null,
                Validators.required],
            lugarNacimiento: [
                model ? model.lugarNacimiento : null,
                Validators.required],
            fechaNacimiento: [
                model ? model.fechaNacimiento : null,
                Validators.required],
            nacionalidad: [
                model ? model.nacionalidad : null,
                Validators.required],
            sexo: [
                model ? model.sexo : null,
                Validators.required],
            estadoCivil: [
                model ? model.estadoCivil : null,
                Validators.required],
            contactos: this.formsContactos,
            domicilios: this.formsDomicilios,
            formacionProfesional: this._formBuilder.group({
                profesion: [
                    model ? model.profesion : null,
                    Validators.required],
                entidadFormadora: [model ? model.entidadFormadora : null],
                otraEntidadFormadora: [model ? model.otraEntidadFormadora : null],
                titulo: [
                    model ? model.titulo : null,
                    Validators.required],
                fechaEgreso: [
                    model ? model.fechaEgreso : null,
                    Validators.required]
            })
        });
    }

    showOtra(entidadFormadora) {
        if (entidadFormadora.value) {
            this.showOtraEntidadFormadora = entidadFormadora.value.nombre === 'Otra';
        }
    }

    confirmarDatos(model: any, isValid: Boolean) {

        model.contactos.forEach(contacto => {
            contacto.tipo = contacto.tipo.toLowerCase();
        });

        this.onProfesionalCompleto.emit(model);
    }

    // Filtrado de combos
    loadPaises(event) {
        this._paisService.getPaises().subscribe(event.callback);
    }

    loadProvincias(event, pais) {
        if (pais.value) {
            this._provinciaService.get({ 'pais': pais.value.id }).subscribe(event.callback);
        }
    }

    loadLocalidades(event, provincia) {
        if (provincia.value) {
            this._localidadService.getXProvincia(provincia.value.id).subscribe(event.callback);
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
}

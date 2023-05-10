
import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, NgForm } from '@angular/forms';
import { Plex } from '@andes/plex';
import * as enumerados from './../../utils/enumerados';
import { Matching } from '@andes/match';
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProfesionService } from './../../services/profesion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EntidadFormadoraService } from './../../services/entidadFormadora.service';
import { SexoService } from './../../services/sexo.service';
import { IProfesional } from './../../interfaces/IProfesional';
import { Auth } from '@andes/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { TurnoService } from '../../services/turno.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'app-profesional',
    templateUrl: 'profesional.html',
    styleUrls: ['profesional.scss']
})
export class ProfesionalComponent implements OnInit {
    @ViewChild('formNuevoProf', { static: true }) formProf: NgForm;
    public deshabilitarBoton = false;
    public formProfesionalComp: FormGroup;
    public sexos: any;
    match = new Matching();
    weights = {
        identity: 0.55,
        name: 0.10,
        gender: 0.3,
        birthDate: 0.05
    };
    public provincias: any[] = [];
    public localidades: any[];
    public paises: any[];
    public estadoCivil: any;
    public tipoDocumento: any[];
    public tipoComunicacion: any[];
    public vacio = [];
    public fecha: Date;
    public lblTurno: string;
    @Input() nuevoProf = false;
    @Input() confirmar = false;
    @Input() editable = false;
    @Input() desdeListaProfesionales: any;
    @Output() editado = new EventEmitter();
    public noPoseedomicilioProfesional = false;
    @Input() showOtraEntidadFormadora: Boolean = false;
    @Input() public profesional: IProfesional = {
        id: null,
        habilitado: true,
        nombre: null,
        apellido: null,
        tipoDocumento: null,
        documento: null,
        documentoViejo: null,
        documentoVencimiento: null,
        cuit: null,
        fechaNacimiento: null,
        lugarNacimiento: '',
        nacionalidad: null,
        sexo: undefined,
        contactos: [{
            tipo: 'email',
            valor: '',
            rank: 0,
            activo: true,
            ultimaActualizacion: new Date()
        }],
        domicilios: [{
            tipo: 'real',
            valor: null,
            codigoPostal: '',
            ubicacion: {
                localidad: '',
                provincia: '',
                pais: {
                    'id': '57f3b5c469fe79a598e6281f',
                    'nombre': 'Argentina'
                },
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
                pais: {
                    'id': '57f3b5c469fe79a598e6281f',
                    'nombre': 'Argentina'
                },
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
                pais: {
                    'id': '57f3b5c469fe79a598e6281f',
                    'nombre': 'Argentina'
                },
            },
            ultimaActualizacion: new Date(),
            activo: true
        }],
        fotoArchivo: null,
        firmas: null,
        profesionalMatriculado: false,
        formacionGrado: [{
            exportadoSisa: null,
            profesion: null,
            entidadFormadora: null,
            titulo: null,
            fechaEgreso: null,
            fechaTitulo: null,
            renovacion: false,
            renovacionOnline: null,
            papelesVerificados: false,
            matriculacion: null,
            matriculado: false
        }],
        formacionPosgrado: null,
        origen: null,
        sanciones: null,
        notas: null,
        rematriculado: 0,
        agenteMatriculador: '',
        OtrosDatos: null,
        idRenovacion: null,
    };
    localidadesReal: any[] = [];
    localidadesLegal: any[] = [];
    localidadesProfesional: any[] = [];
    matcheo = false;

    patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;
    patronContactoAlfabetico = /^[-\w.%+]{1,61}@[a-z]+(.[a-z]+)+$/;

    @Output() public onProfesionalCompleto: EventEmitter<IProfesional> = new EventEmitter<IProfesional>();

    constructor(
        private _sexoService: SexoService,
        private _paisService: PaisService,
        private _provinciaService: ProvinciaService,
        private _localidadService: LocalidadService,
        private _profesionService: ProfesionService,
        private _profesionalService: ProfesionalService,
        private _entidadFormadoraService: EntidadFormadoraService,
        private _turnosService: TurnoService,
        private plex: Plex,
        public auth: Auth,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {
        this.estadoCivil = enumerados.getObjsEstadoCivil();
        this._provinciaService.get({}).subscribe(rta => {
            this.provincias = rta;
        });
        this.sexos = enumerados.getObjSexos();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.tipoDocumento = enumerados.getObjTipoDoc();

        if (this.editable) {
            this.profesional.sexo = (this.profesional.sexo as any).toLowerCase();
            if ((this.profesional.domicilios as any).length === 0) {
                this.profesional.domicilios = [
                    {
                        tipo: 'real',
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
                    }
                ];
            }
        }
        if (this.confirmar) {
            if (this.profesional.formacionGrado.length && this.profesional.formacionGrado[0].entidadFormadora?.codigo === null) {
                this.showOtraEntidadFormadora = true;
            } else {
                this.showOtraEntidadFormadora = false;
            }
        }

        this.route.queryParams.subscribe(params => {
            this.fecha = params['fecha'];
            this.onTurnoSeleccionado();
        });
    }

    onTurnoSeleccionado() {
        this.lblTurno = moment(this.fecha).format('DD/MM/YYYY, h:mm a');
    }

    showOtra(entidadFormadora) {
        if (entidadFormadora?.value) {
            this.showOtraEntidadFormadora = entidadFormadora.value.nombre === 'Otra';
        }
    }

    confirmarDatos() {
        // Carga de datos de profesionales matriculados por primera vez (profesional sin loguearse)
        this.deshabilitarBoton = true;
        if (this.formProf.valid) {
            const matcheo = false;
            this.profesional.sexo = this.profesional.sexo ? ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id) : null;

            this.profesional.tipoDocumento = this.profesional.tipoDocumento ? ((typeof this.profesional.tipoDocumento === 'string')) ? this.profesional.tipoDocumento : (Object(this.profesional.tipoDocumento).id) : null;
            this.profesional.contactos.map(elem => {
                elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
                return elem;
            });

            this.matchingCandidatos(this.profesional.documento, this.profesional.sexo).pipe(
                map(resp => resp)
            ).subscribe(candidatos => {
                // se filtra por profesionales preexistentes en el sistema (se excluyen los no matriculados y/o con matricula externa)
                candidatos = candidatos.filter(c => c.profesional.profesionalMatriculado);
                if (candidatos.length) {
                    this.plex.info('info', 'Ya existe un profesional registrado con estos datos, por favor vaya a la seccion "renovacion" para sacar su turno');
                } else {
                    const stringProfesional = JSON.stringify(this.profesional);
                    const params = { profesional: stringProfesional, fechaElegida: this.fecha };
                    this.router.navigate(['/solicitarTurnoMatriculacion'], { queryParams: params });
                }
            });
        } else {
            this.plex.toast('danger', 'Falta completar los campos requeridos', 'informacion', 1000);
        }
    }

    confirmarDatosAdmin() {
        // Carga/edicion desde un usuario logueado en el sistema
        this.deshabilitarBoton = true;
        if (this.formProf.valid) {
            this.profesional.agenteMatriculador = this.auth.usuario.nombreCompleto;
            this.profesional.formacionGrado[0].exportadoSisa = false;
            this.profesional.sexo = this.profesional.sexo ? ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id) : null;
            this.profesional.tipoDocumento = this.profesional.tipoDocumento ? ((typeof this.profesional.tipoDocumento === 'string')) ? this.profesional.tipoDocumento : (Object(this.profesional.tipoDocumento).id) : null;
            this.profesional.profesionalMatriculado = true;
            this.profesional.contactos.map(elem => {
                elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
                return elem;
            });

            this.matchingCandidatos(this.profesional.documento, this.profesional.sexo).pipe(
                map(candidatos => {
                    // El matching que interesa es por profesionales matriculados (profesionalMatriculado: true)
                    const candidatosMatriculados = candidatos.filter(c => c.profesional.profesionalMatriculado);
                    if (candidatosMatriculados.length) {
                        this.plex.info('warning', 'Los datos ingresados corresponden a un profesional ya existente.', 'Profesional existente');
                        return false;
                    } else if (candidatos.length) {
                        // candidatos con matricula externa o similares (profesionalMatriculado: false) se le agrega la informacion de grado, etc
                        this.profesional.id = candidatos[0].profesional.id;
                        return true;
                    }
                    return null;
                }),
                switchMap(responseActualizar => {
                    if (responseActualizar !== null) {
                        // hubo match
                        if (responseActualizar) {
                            // actualizar candidato
                            return this._profesionalService.patchProfesional(this.profesional.id, this.profesional);
                        }
                        this.profesional.id = undefined;
                        return of(null); // no actualiza
                    }
                    // no hubo match
                    return this._profesionalService.saveProfesional({ profesional: this.profesional });
                }),
                switchMap(profesionalSaved => {
                    if (!profesionalSaved) {
                        return of(null);
                    }
                    this.profesional = profesionalSaved;
                    if (this.nuevoProf) {
                        // cuando se crea a partir del boton 'nuevo profesional' (sin turno previo)
                        const turno = {
                            fecha: new Date(),
                            tipo: 'matriculacion',
                            profesional: profesionalSaved._id
                        };
                        return this._turnosService.saveTurnoSolicitados(profesionalSaved).pipe(
                            switchMap(() => this._turnosService.saveTurnoMatriculacion({ turno: turno }))
                        );
                    }
                    return of(profesionalSaved);
                }),
            ).subscribe(response => {
                if (response) { // puede ser response del patch o post
                    this.plex.toast('success', 'Profesional guardado exitosamente', 'informacion', 1000);
                    this.editado.emit(true);
                    this.router.navigate(['/profesional', this.profesional.id]);
                }
            }, error => {
                const mensaje = error === 'error-turno' ? 'Ha ocurrido un error asignando el turno. Asegurese que el profesional aún no posee uno.' : error.message;
                this.plex.info('danger', mensaje);
            }
            );
        } else {
            this.plex.toast('danger', 'Falta completar los campos requeridos', 'informacion', 1000);
        }
    }


    // Filtrado de combos
    loadPaises(event) {
        this._paisService.getPaises({}).subscribe(event.callback);
    }

    loadProvincias(event, pais) {
        if (pais && pais.id) {
            this._provinciaService.get({
                pais: pais.id
            }).subscribe(event.callback);
        }
    }
    loadLocalidades(event, provincia) {
        this._localidadService.get({ 'provincia': provincia.value.id }).subscribe(event.callback);
    }

    loadLocalidadesLegal(provincia, completando?) {
        if (provincia?.id) {
            this._localidadService.getXProvincia(provincia.id).subscribe(result => {
                this.localidadesLegal = result;
                if (completando) {
                    this.profesional.domicilios[1].ubicacion.localidad = this.profesional.domicilios[0].ubicacion.localidad;
                } else {
                    this.profesional.domicilios[1].ubicacion.localidad = null;
                }
            });
        }
    }

    loadLocalidadesReal(provincia) {
        if (provincia?.id) {
            this._localidadService.getXProvincia(provincia.id).subscribe(result => {
                this.localidadesReal = result;
                this.profesional.domicilios[0].ubicacion.localidad = null;
            });
        }
    }

    changeProvActualReal(event) {
        if (event.value) {
            this.loadLocalidadesReal(this.profesional.domicilios[0].ubicacion.provincia);
        }
    }

    loadLocalidadesProfesional(provincia, completando?) {
        if (provincia?.id) {
            this._localidadService.getXProvincia(provincia.id).subscribe(result => {
                this.localidadesProfesional = result;
                if (completando) {
                    this.profesional.domicilios[2].ubicacion.localidad = this.profesional.domicilios[0].ubicacion.localidad;
                } else {
                    this.profesional.domicilios[2].ubicacion.localidad = null;
                }

            });
        }
    }

    cp(event, i) {
        if (event.value) {
            this.profesional.domicilios[i].codigoPostal = event.value.codigoPostal;
        } else {
            this.profesional.domicilios[i].codigoPostal = null;
        }
    }
    loadProfesiones(event) {
        this._profesionService.getProfesiones({ gestionaColegio: false }).pipe(catchError(() => of(null))).subscribe(event.callback);
    }

    loadEntidadesFormadoras(event) {
        this._entidadFormadoraService.getEntidadesFormadoras().pipe(catchError(() => of(null))).subscribe(event.callback);
    }

    loadSexos(event) {
        this._sexoService.getSexos().pipe(catchError(() => of(null))).subscribe(event.callback);
    }
    addContacto() {
        const indexUltimo = this.profesional.contactos.length - 1;
        if (this.profesional.contactos[indexUltimo].valor) {
            const nuevoContacto = Object.assign({}, {
                tipo: 'email',
                valor: '',
                rank: 0,
                activo: true,
                ultimaActualizacion: new Date()
            });
            this.profesional.contactos.push(nuevoContacto);
        } else {
            this.plex.toast('info', 'Debe completar los contactos anteriores.');
        }
    }

    removeContacto(i) {
        if (i >= 0) {
            this.profesional.contactos.splice(i, 1);
        }
    }

    volverProfesional() {
        if (this.location.path().includes('solicitarTurnoMatriculacion/nuevoProfesional')) {
            this.router.navigate(['/solicitarTurnoMatriculacion']);
        }
        this.editable ? this.editado.emit() : this.location.back();
    }

    completar() {
        this.profesional.domicilios[1].valor = this.profesional.domicilios[0].valor;
        this.profesional.domicilios[1].codigoPostal = this.profesional.domicilios[0].codigoPostal;
        this.profesional.domicilios[1].ubicacion.pais = this.profesional.domicilios[0].ubicacion.pais;
        this.profesional.domicilios[1].ubicacion.provincia = this.profesional.domicilios[0].ubicacion.provincia;
        this.loadLocalidadesLegal(this.profesional.domicilios[1].ubicacion.provincia, true);
        this.profesional.domicilios[2].valor = this.profesional.domicilios[0].valor;
        this.profesional.domicilios[2].codigoPostal = this.profesional.domicilios[0].codigoPostal;
        this.profesional.domicilios[2].ubicacion.pais = this.profesional.domicilios[0].ubicacion.pais;
        this.profesional.domicilios[2].ubicacion.provincia = this.profesional.domicilios[0].ubicacion.provincia;
        this.loadLocalidadesProfesional(this.profesional.domicilios[2].ubicacion.provincia, true);
    }

    actualizar() {
        this.deshabilitarBoton = true;
        if (this.formProf.valid) {

            this.profesional.agenteMatriculador = this.auth.usuario.nombreCompleto;
            this.profesional.sexo = this.profesional.sexo ? ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id) : null;
            this.profesional.tipoDocumento = this.profesional.tipoDocumento ? ((typeof this.profesional.tipoDocumento === 'string')) ? this.profesional.tipoDocumento : (Object(this.profesional.tipoDocumento).id) : null;
            this.profesional.contactos.map(elem => {
                elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
                return elem;
            });
            this._profesionalService.putProfesional(this.profesional)
                .subscribe(resp => {
                    this.profesional = resp;
                    this.plex.toast('success', 'Se modificó con éxito!', 'informacion', 1000);
                    this.editado.emit(true);
                });
            this.volverProfesional();
        } else {
            this.plex.toast('danger', 'Falta completar los campos requeridos', 'informacion', 1000);
        }
    }

    otraEntidad(f) {
        f.entidadFormadora = {
            nombre: null,
            codigo: null
        };
    }

    limpiarDomProfesional() {
        this.profesional.domicilios[2] = {
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
        };
    }


    /**
 * Busca profesionales similares a partir de documento y sexo
 * @param documento string
 * @param sexo string
 * @returns { number, IProfesional }[]
 */
    matchingCandidatos(documento, sexo): Observable<any[]> {
        return this._profesionalService.getProfesionalesMatching({ documento, sexo }).pipe(
            map(datos => {
                const candidatos = [];
                if (datos.length) {
                    datos.map(profCandidato => {
                        const porcentajeMatching = this.match.matchPersonas(this.profesional, profCandidato, this.weights, 'Levenshtein');
                        const profesionalMatch = {
                            matching: porcentajeMatching ? porcentajeMatching * 100 : 0,
                            profesional: porcentajeMatching ? profCandidato : null
                        };
                        if (profesionalMatch.matching >= 94) {
                            candidatos.push(profesionalMatch);
                        }
                    });
                }
                const sortByMatching = (a, b) => {
                    return b.matching - a.matching;
                };
                return candidatos.sort(sortByMatching);
            })
        );
    }
}

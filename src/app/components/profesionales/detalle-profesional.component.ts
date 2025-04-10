import { Component, OnInit, Output, Input, EventEmitter, HostBinding, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Plex } from '@andes/plex';
import { FotoGeneralComponent } from './foto-general.component';
import { ProfesionalService } from './../../services/profesional.service';
import { IProfesional } from './../../interfaces/IProfesional';
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';
import 'rxjs/add/operator/switchMap';
import { TurnoService } from '../../services/turno.service';
import { Auth } from '@andes/auth';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

const jsPDF = require('jspdf');

@Component({
    selector: 'app-detalle-profesional',
    templateUrl: 'detalle-profesional.html'
})

export class DetalleProfesionalComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    public indiceObtenido;
    public indexFormacionGradoSelected: any;
    public indexFormacionPosgradoSelected: any;
    public mostrar = false;
    public mostrarGrado = false;
    public img64 = null;
    public vieneDeDetalle = null;
    public confirmar = true;
    public tieneFirma = null;
    public tieneFirmaAdmin = null;
    public editable = false;
    public showEdit = false;
    public showAdd = false;

    @ViewChild('fotoHijo') fotoHijo: FotoGeneralComponent;
    @Input() public flag = null;
    @Input() public profesional: IProfesional = {
        id: null,
        habilitado: true,
        nombre: null,
        apellido: null,
        tipoDocumento: null,
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
        }, {
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
        }, {
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
            renovacionOnline: null,
            papelesVerificados: false,
            matriculacion: [{
                matriculaNumero: null,
                libro: null,
                folio: null,
                inicio: null,
                fin: null,
                baja: null,
                notificacionVencimiento: false,
                revalidacionNumero: null,
            }],
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
        documentoViejo: null
    };
    @Output() onShowListado = new EventEmitter();
    @Output() showFormacion = new EventEmitter();
    @Output() showFoto = new EventEmitter();
    public tieneOtraEntidad;

    constructor(
        private _profesionalService: ProfesionalService,
        private _turnoService: TurnoService,
        private _numeracionMatriculasService: NumeracionMatriculasService,
        private route: ActivatedRoute,
        private router: Router,
        public auth: Auth,
        private plex: Plex,
        private location: Location) { }

    ngOnInit() {
        this.vieneDeDetalle = true;
        // Este metodo se encarga de buscar, a partir del id del profesional obtenido por parametros de ruteo, un profesional
        // en la coleccion de profesional. Si dicha coleccion no existe entonces procede a buscarla en la de turnosSolicitado
        // y de esta forma poder mostrar sus datos en el HTML.
        this.route.params.pipe(
            switchMap(params => {
                if (params && params['id']) {
                    return this._profesionalService.getProfesional({ id: params['id'] }).pipe(
                        map(profesional => ({ params, profesional }))
                    );
                }
                return of({ params, profesional: [] });
            }),
            switchMap(({ params, profesional }) => {
                if (!profesional.length) {
                    return this._turnoService.getTurnoSolicitados(params['id']).pipe(
                        catchError(() => of(null)),
                        tap((profesionalTemporal: any) => {
                            this.profesional = profesionalTemporal;
                            this.tieneOtraEntidad = !!this.profesional.formacionGrado[0].entidadFormadora.codigo;
                            this.habilitaPosgrado();
                            this.flag = false;
                        })
                    );
                } else {
                    this.profesional = profesional[0];
                    if (!this.profesional.profesionalMatriculado) {
                        return this._turnoService.getTurnoSolicitados(this.profesional.documento).pipe(
                            tap((prof) => {
                                this.flag = false;
                                this.profesional = prof;
                            })
                        );
                    }
                    this.flag = true;
                    this.habilitaPosgrado();
                    return of(null);
                }
            })
        ).subscribe();
    }

    updateProfesional(callbackData?: any) {
        this.profesional.agenteMatriculador = this.auth.usuario.nombreCompleto;
        this._profesionalService.putProfesional(this.profesional).pipe(catchError(() => of(null)))
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

    guardarFotoGrid(img: any) {
        this.img64 = img;
        const imagenPro = {
            'img': img,
            'idProfesional': this.profesional.id
        };
        this.showFoto.emit(this.img64);
        this._profesionalService.updateProfesional(imagenPro.idProfesional, { imagen: imagenPro }).subscribe();
    }

    guardarFirmaGrid(firma) {
        const firmaPro = {
            'firmaP': firma,
            'idProfesional': this.profesional.id
        };
        this._profesionalService.updateProfesional(firmaPro.idProfesional, { firma: firmaPro }).subscribe();
    }

    guardarFirmaAdminGrid(oFirma) {
        const firmaAdmin = {
            'firma': oFirma.firma,
            'nombreCompleto': oFirma.nombreCompleto,
            'idProfesional': this.profesional.id
        };
        this._profesionalService.updateProfesional(firmaAdmin.idProfesional, { firmaAdmin: firmaAdmin }).subscribe();
    }

    guardarNotas(textoNotas) {
        const cambio = {
            'op': 'updateNotas',
            'data': textoNotas,
            'agente': this.auth.usuario.nombreCompleto
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe();
    }

    guardarSancion(sancion: any) {
        const cambio = {
            'op': 'updateSancion',
            'data': sancion,
            'agente': this.auth.usuario.nombreCompleto
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe();
    }

    guardarFormacionPosgrado(posgrado: any) {
        const cambio = {
            'op': 'updatePosGrado',
            'data': posgrado,
            'agente': this.auth.usuario.nombreCompleto
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((profesionalSaved) => {
            this.profesional = profesionalSaved;
            this._numeracionMatriculasService.patchNumeracion({}).subscribe(() => {
                this.plex.toast('success', 'El posgrado se registró con exito!', 'informacion', 1000);
            }, error => {
                this.plex.toast('danger', 'Error al guardar numeración', 'informacion', 1000);
            });
        }, error => {
            this.plex.toast('danger', 'Error al cargar posgrado', 'informacion', 1000);
        });
    }

    guardarGrado(fGrado: any) {
        const cambio = {
            'op': 'updateGrado',
            'data': fGrado,
            'agente': this.auth.usuario.nombreCompleto
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
            this.profesional = data;
        });
    }

    guardarOtrosDatos(otrosDatos) {
        const cambio = {
            'op': 'updateOtrosDatos',
            'data': otrosDatos,
            'agente': this.auth.usuario.nombreCompleto
        };
        this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe();
    }

    matricularProfesional(matriculacion: any) {
        if (this.profesional.formacionGrado[this.indexFormacionGradoSelected].matriculacion === null) {
            this.profesional.formacionGrado[this.indexFormacionGradoSelected].matriculacion = [matriculacion];
        } else {
            this.profesional.formacionGrado[this.indexFormacionGradoSelected].matriculacion.push(matriculacion);
        }

    }

    matricularProfesionalEspecialidad(matriculacion: any) {
        if (this.profesional.formacionPosgrado[this.indexFormacionPosgradoSelected].matriculacion === null) {
            this.profesional.formacionPosgrado[this.indexFormacionPosgradoSelected].matriculacion = [matriculacion];
        } else {
            this.profesional.formacionPosgrado[this.indexFormacionPosgradoSelected].matriculacion.push(matriculacion);
        }
        this.updateProfesional();
    }

    anioDeGracia(matriculacionEntrante) {
        this.profesional.formacionPosgrado[this.indexFormacionPosgradoSelected].matriculacion = matriculacionEntrante;
        this.updateProfesional();
    }

    volver() {
        this.location.back();
    }

    formacionGradoSelected(formacion: any) {
        this.mostrar = true;
        this.mostrarGrado = false;
        this.indexFormacionGradoSelected = formacion;
        this.showAdd = false;
    }

    formacionPosgradoSelected(posgrado: any) {
        this.mostrarGrado = true;
        this.mostrar = false;
        this.indexFormacionPosgradoSelected = posgrado;
        this.showAdd = false;
        this.showEdit = false;
    }

    mostrarEdicion(mostrarEdit) {
        this.showEdit = mostrarEdit;
        this.showAdd = false;
    }

    cancelarPosgradoEdit(edit) {
        this.showEdit = edit;
        this.showAdd = false;
    }

    mostrarAdd(mostrarAgregar) {
        this.showAdd = mostrarAgregar;
        this.showEdit = false;
        this.mostrarGrado = false;
        this.mostrar = false;
    }

    cancelarPosgradoAdd(add) {
        this.showAdd = add;
        this.mostrarGrado = false;
        this.showEdit = false;
    }

    obtenerIndice(indice) {
        this.indiceObtenido = indice;
    }

    editarEspecialidad(editar) {
        this.showEdit = editar;
        this.showAdd = false;
    }

    cerrar(grado) {
        if (grado) {
            this.mostrar = false;
        } else {
            this.mostrarGrado = false;
        }
    }

    editar() {
        this.flag = false;
        this.editable = true;
        this.mostrar = false;
        this.mostrarGrado = false;
        this.showAdd = false;
    }

    habilitaPosgrado() {
        const res = this.profesional.formacionGrado.find(p => p.profesion.codigo === 1 || p.profesion.codigo === 2);
        return res;
    }
}

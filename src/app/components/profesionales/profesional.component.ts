import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { stringify } from '@angular/compiler/src/util';

@Component({
  selector: 'app-profesional',
  templateUrl: 'profesional.html'
})
export class ProfesionalComponent implements OnInit {
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
  public ocultarBtn = false;
  public lblTurno: string;
  @Input() nuevoProf = false;
  @Input() confirmar = false;
  @Input() editable = false;
  @Output() editado = new EventEmitter();
  public noPoseedomicilioProfesional = false;
  // public estadosCiviles: any[];
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
      tipo: 'celular',
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
    }
    ],
    fotoArchivo: null,
    firmas: null,
    formacionGrado: [{
      exportadoSisa: null,
      profesion: null,
      entidadFormadora: null,
      titulo: null,
      fechaEgreso: null,
      fechaTitulo: null,
      renovacion: false,
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
    private location: Location) { }

  ngOnInit() {
    this.estadoCivil = enumerados.getObjsEstadoCivil();
    this._provinciaService.get({}).subscribe(rta => {
      this.provincias = rta;
    });
    this.sexos = enumerados.getObjSexos();
    this.tipoComunicacion = enumerados.getObjTipoComunicacion();
    this.tipoDocumento = enumerados.getObjTipoDoc();
    const cargaLocalidad = {
      id: null
    };
    // this.loadLocalidades(cargaLocalidad);
    if (this.editable) {
      this.profesional.sexo = (this.profesional.sexo as any).toLowerCase();
      if ((this.profesional.domicilios as any).length === 0) {
        // para que no tire palos
        this.profesional.domicilios = [{
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
      if (this.profesional.formacionGrado[0].entidadFormadora && this.profesional.formacionGrado[0].entidadFormadora.codigo === null) {
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
    this.lblTurno = moment(this.fecha).format('llll');
  }

  showOtra(entidadFormadora) {
    if (entidadFormadora?.value) {
      this.showOtraEntidadFormadora = entidadFormadora.value.nombre === 'Otra';
    }
  }

  confirmarDatos($event) {
    if ($event.formValid) {
      let matcheo = false;
      // tslint:disable-next-line:max-line-length
      // this.profesional.estadoCivil = this.profesional.estadoCivil ? ((typeof this.profesional.estadoCivil === 'string')) ? this.profesional.estadoCivil : (Object(this.profesional.estadoCivil).id) : null;
      this.profesional.sexo = this.profesional.sexo ? ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id) : null;
      // tslint:disable-next-line:max-line-length

      this.profesional.tipoDocumento = this.profesional.tipoDocumento ? ((typeof this.profesional.tipoDocumento === 'string')) ? this.profesional.tipoDocumento : (Object(this.profesional.tipoDocumento).id) : null;
      this.profesional.contactos.map(elem => {
        elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
        return elem;
      });
      this.matching();


      this._profesionalService.getProfesionalesMatching({ documento: this.profesional.documento })
        .subscribe(
          datos => {
            if (datos.length > 0) {
              datos.forEach(profCandidato => {
                this.profesional.sexo = ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id);
                const porcentajeMatching = this.match.matchPersonas(this.profesional, profCandidato, this.weights, 'Levenshtein');
                const profesionalMatch = {
                  matching: 0,
                  paciente: null
                };
                if (porcentajeMatching) {
                  profesionalMatch.matching = porcentajeMatching * 100;
                  profesionalMatch.paciente = profCandidato;
                }
                if (profesionalMatch.matching >= 94) {
                  matcheo = true;
                }
              });
            }
            if (matcheo) {
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

  confirmarDatosAdmin($event) {
    if ($event.formValid) {
      let matcheo = false;
      this.profesional.agenteMatriculador = this.auth.usuario.nombreCompleto;
      this.profesional.formacionGrado[0].exportadoSisa = false;
      this.profesional.sexo = this.profesional.sexo ? ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id) : null;
      this.profesional.tipoDocumento = this.profesional.tipoDocumento ? ((typeof this.profesional.tipoDocumento === 'string')) ? this.profesional.tipoDocumento : (Object(this.profesional.tipoDocumento).id) : null;
      this.profesional.contactos.map(elem => {
        elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
        return elem;
      });

      this._profesionalService.getProfesionalesMatching({ documento: this.profesional.documento })
        .subscribe(
          datos => {
            if (datos.length > 0) {
              datos.forEach(profCandidato => {
                this.profesional.sexo = ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id);
                const porcentajeMatching = this.match.matchPersonas(this.profesional, profCandidato, this.weights, 'Levenshtein');
                const profesionalMatch = {
                  matching: 0,
                  paciente: null
                };
                if (porcentajeMatching) {
                  profesionalMatch.matching = porcentajeMatching * 100;
                  profesionalMatch.paciente = profCandidato;
                }
                if (profesionalMatch.matching >= 94) {
                  matcheo = true;
                }
              });

            }
            if (matcheo) {
              this.plex.info('info', 'Ya existe un profesional registrados con estos datos');
            } else {
              this._profesionalService.saveProfesional({ profesional: this.profesional })
                .subscribe(nuevoProfesional => {
                  if (nuevoProfesional === null) {
                    this.plex.info('info', 'El profesional que quiere agregar ya existe(verificar dni)');
                  } else {
                    this.plex.toast('success', 'Se registro con exito!', 'informacion', 1000);
                    this.editado.emit(true);
                    if (this.nuevoProf) {
                      this._turnosService.saveTurnoSolicitados(nuevoProfesional)
                        .subscribe((nuevoProfesional2) => {
                          const turno = {
                            fecha: new Date(),
                            tipo: 'matriculacion',
                            profesional: nuevoProfesional._id
                          };
                          this._turnosService.saveTurnoMatriculacion({ turno: turno })
                            .subscribe(_turno => {
                              this.router.navigate(['/profesional', nuevoProfesional._id]);
                            });
                        });
                    }
                  }

                });
            }

          });

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
    if (provincia && provincia.id) {
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
    if (provincia && provincia.id) {
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
    if (provincia && provincia.id) {
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
    this._profesionService.getProfesiones().pipe(catchError(() => of(null))).subscribe(event.callback);
  }

  loadEntidadesFormadoras(event) {
    this._entidadFormadoraService.getEntidadesFormadoras().pipe(catchError(() => of(null))).subscribe(event.callback);
  }

  loadSexos(event) {
    this._sexoService.getSexos().pipe(catchError(() => of(null))).subscribe(event.callback);
  }
  addContacto() {
    const nuevoContacto = Object.assign({}, {
      tipo: 'celular',
      valor: '',
      rank: 0,
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

  volverProfesional() {
    if (this.editable) {
      this.location.back();
    } else {
      this.router.navigate(['/solicitarTurnoMatriculacion']);
    }
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

  actualizar($event) {
    if ($event.formValid) {

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


  matching() {
    this._profesionalService.getProfesionalesMatching({ documento: this.profesional.documento })
      .subscribe(
        datos => {
          if (datos.length > 0) {
            datos.forEach(profCandidato => {
              this.profesional.sexo = ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id);

              const porcentajeMatching = this.match.matchPersonas(this.profesional, profCandidato, this.weights, 'Levenshtein');
              const profesionalMatch = {
                matching: 0,
                paciente: null
              };
              if (porcentajeMatching) {
                profesionalMatch.matching = porcentajeMatching * 100;
                profesionalMatch.paciente = profCandidato;
              }
              if (profesionalMatch.matching >= 94) {
                this.matcheo = true;
              }
            });
          }

        });
  }

  // guardarTurnoNuevoProf(profesional) {
  //   profesional.idRenovacion = this.profesional.id;
  //   profesional.id = null;
  //   delete profesional._id;
  //   this._turnosService.saveTurnoSolicitados(profesional)
  //     .subscribe((nuevoProfesional) => {
  //      const turnoObj = {
  //         fecha: new Date(),
  //         tipo: 'matriculacion',
  //         profesional: nuevoProfesional._id
  //       };

  //       this._turnosService.saveTurnoMatriculacion({ turno: turnoObj })
  //         .subscribe(turno => {
  //           this.router.navigate(['/profesional', nuevoProfesional._id]);
  //         });
  //     });
  // }
}

import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray
} from '@angular/forms';
// import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import {
  Plex
} from '@andes/plex';

// Enums
import * as enumerados from './../../utils/enumerados';
import {
  getEnumAsObjects,
  Sexo,
  EstadoCivil,
  TipoContacto
} from './../../utils/enumerados';

// Services
import {
  PaisService
} from './../../services/pais.service';
import {
  ProvinciaService
} from './../../services/provincia.service';
import {
  LocalidadService
} from './../../services/localidad.service';
import {
  ProfesionService
} from './../../services/profesion.service';
import {
  ProfesionalService
} from './../../services/profesional.service';
import {
  EntidadFormadoraService
} from './../../services/entidadFormadora.service';
import {
  SexoService
} from './../../services/sexo.service';

// Interfaces
import {
  IProfesional
} from './../../interfaces/IProfesional';
import {
  ISiisa
} from './../../interfaces/ISiisa';
import { Auth } from '@andes/auth';

@Component({
  selector: 'app-profesional',
  templateUrl: 'profesional.html'
})
export class ProfesionalComponent implements OnInit {
  public formProfesionalComp: FormGroup;
  public sexos: any;
  public provincias: any[];
  public localidades: any[];
  public paises: any[];
  public estadoCivil: any;
  public tipoDocumento: any[];
  public tipoComunicacion: any[];
  public vacio = [];
  @Input() confirmar = false;
  @Input() editable = false;
  @Output() editado = new EventEmitter();

  // public estadosCiviles: any[];
  public showOtraEntidadFormadora: Boolean = false;
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
      valor: null,
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
    }
    ],
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
      matriculacion: null,
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

  };
  localidadesReal: any[];
  localidadesLegal: any[];
  localidadesProfesional: any[];


  @Output() public onProfesionalCompleto: EventEmitter<IProfesional> = new EventEmitter<IProfesional>();

  constructor(private _formBuilder: FormBuilder,
    private _sexoService: SexoService,
    private _paisService: PaisService,
    private _provinciaService: ProvinciaService,
    private _localidadService: LocalidadService,
    private _profesionService: ProfesionService,
    private _profesionalService: ProfesionalService,
    private _entidadFormadoraService: EntidadFormadoraService,
    private plex: Plex,
    public auth: Auth) { }

  ngOnInit() {
    this.estadoCivil = enumerados.getObjsEstadoCivil();
    this.sexos = enumerados.getObjSexos();
    this.tipoComunicacion = enumerados.getObjTipoComunicacion();
    this.tipoDocumento = enumerados.getObjTipoDoc();
    this.loadProvincias();
    const cargaLocalidad = {
      id: null
    };
    this.loadLocalidades(cargaLocalidad);
    if (this.editable) {
      if (this.profesional.domicilios.length === 0) {
        // para que no tire palos
        this.estadoCivil = EstadoCivil.otro;
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
  }


  showOtra(entidadFormadora) {
    if (entidadFormadora.value) {
      this.showOtraEntidadFormadora = entidadFormadora.value.nombre === 'Otra';
    }
  }

  confirmarDatos($event) {
    if ($event.formValid) {
      // tslint:disable-next-line:max-line-length
      this.profesional.estadoCivil = this.profesional.estadoCivil ? ((typeof this.profesional.estadoCivil === 'string')) ? this.profesional.estadoCivil : (Object(this.profesional.estadoCivil).id) : null;
      this.profesional.sexo = this.profesional.sexo ? ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id) : null;
      // tslint:disable-next-line:max-line-length
      this.profesional.tipoDocumento = this.profesional.tipoDocumento ? ((typeof this.profesional.tipoDocumento === 'string')) ? this.profesional.tipoDocumento : (Object(this.profesional.tipoDocumento).id) : null;
      this.profesional.contactos.map(elem => {
        elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
        return elem;
      });
      this.onProfesionalCompleto.emit(this.profesional);

      // this.onProfesionalCompleto.emit(this.profesional);
    }

  }

  confirmarDatosAdmin($event) {
    if ($event.formValid) {
      this.profesional.agenteMatriculador = this.auth.usuario.nombreCompleto;
      // tslint:disable-next-line:max-line-length
      this.profesional.estadoCivil = this.profesional.estadoCivil ? ((typeof this.profesional.estadoCivil === 'string')) ? this.profesional.estadoCivil : (Object(this.profesional.estadoCivil).id) : null;
      this.profesional.sexo = this.profesional.sexo ? ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id) : null;
      // tslint:disable-next-line:max-line-length
      this.profesional.tipoDocumento = this.profesional.tipoDocumento ? ((typeof this.profesional.tipoDocumento === 'string')) ? this.profesional.tipoDocumento : (Object(this.profesional.tipoDocumento).id) : null;
      this.profesional.contactos.map(elem => {
        elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
        return elem;
      });
      this._profesionalService.saveProfesional({ profesional: this.profesional })
        .subscribe(nuevoProfesional => {
          if (nuevoProfesional === null) {
            this.plex.alert('El profesional que quiere agregar ya existe(verificar dni)');
          } else {
            this.plex.toast('success', 'Se registro con exito!', 'informacion', 1000);
            this.editado.emit(true);
          }

        });
    }
  }

  // Filtrado de combos
  loadPaises() {
    this._paisService.getPaises().subscribe(resp => {
      this.paises = resp;
    });
  }

  loadProvincias(pais?) {
    let paisValor = null;
    if (pais) {
      paisValor = pais.value.id;
    }
    this._provinciaService.get({
      'pais': paisValor
    })
      .subscribe(resp => {
        this.provincias = resp;
      });
  }

  loadLocalidades(provincia?) {
    let localidadValor = null;
    console.log(provincia);
    if (provincia.value) {
      localidadValor = provincia.value.id;
    }
    this._localidadService.getXProvincia(localidadValor)
      .subscribe(resp => {
        this.localidades = resp;

      });

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

  completar() {
    this.profesional.domicilios[1].valor = this.profesional.domicilios[0].valor;
    this.profesional.domicilios[1].codigoPostal = this.profesional.domicilios[0].codigoPostal;
    this.profesional.domicilios[1].ubicacion.pais = this.profesional.domicilios[0].ubicacion.pais;
    this.profesional.domicilios[1].ubicacion.provincia = this.profesional.domicilios[0].ubicacion.provincia;
    this.profesional.domicilios[1].ubicacion.localidad = this.profesional.domicilios[0].ubicacion.localidad;

    this.profesional.domicilios[2].valor = this.profesional.domicilios[0].valor;
    this.profesional.domicilios[2].codigoPostal = this.profesional.domicilios[0].codigoPostal;
    this.profesional.domicilios[2].ubicacion.pais = this.profesional.domicilios[0].ubicacion.pais;
    this.profesional.domicilios[2].ubicacion.provincia = this.profesional.domicilios[0].ubicacion.provincia;
    this.profesional.domicilios[2].ubicacion.localidad = this.profesional.domicilios[0].ubicacion.localidad;
  }

  actualizar() {
    this.profesional.agenteMatriculador = this.auth.usuario.nombreCompleto;
    // tslint:disable-next-line:max-line-length
    this.profesional.estadoCivil = this.profesional.estadoCivil ? ((typeof this.profesional.estadoCivil === 'string')) ? this.profesional.estadoCivil : (Object(this.profesional.estadoCivil).id) : null;
    this.profesional.sexo = this.profesional.sexo ? ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id) : null;
    // tslint:disable-next-line:max-line-length
    this.profesional.tipoDocumento = this.profesional.tipoDocumento ? ((typeof this.profesional.tipoDocumento === 'string')) ? this.profesional.tipoDocumento : (Object(this.profesional.tipoDocumento).id) : null;
    this.profesional.contactos.map(elem => {
      elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
      return elem;
    });
    this._profesionalService.putProfesional(this.profesional)
      .subscribe(resp => {
        this.profesional = resp;
        this.plex.toast('success', 'Se modifico con exito!', 'informacion', 1000);
        this.editado.emit(true);
      });
  }
}

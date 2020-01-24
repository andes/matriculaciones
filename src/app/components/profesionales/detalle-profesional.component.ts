import { Component, OnInit, Output, Input, EventEmitter, HostBinding, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
// Utils
import { PDFUtils } from './../../utils/PDFUtils';
import { FotoGeneralComponent } from './foto-general.component';
// Services
import { ProfesionalService } from './../../services/profesional.service';
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';

// Interfaces
import { IProfesional } from './../../interfaces/IProfesional';
import 'rxjs/add/operator/switchMap';
import { TurnoService } from '../../services/turno.service';
import { Auth } from '@andes/auth';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const jsPDF = require('jspdf');

@Component({
  selector: 'app-detalle-profesional',
  templateUrl: 'detalle-profesional.html',
  styles: ['.margenFoto { padding-bottom: 1%; }']
})

export class DetalleProfesionalComponent implements OnInit {
  @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
  public formSancion: FormGroup;
  public loading: Boolean = false;
  public indexFormacionGradoSelected: any;
  public indexFormacionPosgradoSelected: any;
  public mostrar = false;
  public mostrarGrado = false;
  public img64 = null;
  public vieneDeDetalle = null;
  @Input() public flag = null;
  public confirmar = true;
  public tieneFirma = null;
  public editable = false;
  @ViewChild('fotoHijo', { static: false }) fotoHijo: FotoGeneralComponent;
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

  constructor(private _profesionalService: ProfesionalService,
    private _turnoService: TurnoService,
    private _formBuilder: FormBuilder,
    private _pdfUtils: PDFUtils,
    private _numeracionesService: NumeracionMatriculasService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: Auth,
    private location: Location) { }


  ngOnInit() {

    this.vieneDeDetalle = true;
    this.route.params.subscribe(params => {
      if (params && params['id']) {
        this._profesionalService.getProfesional({ id: params['id'] }).subscribe(profesional => {
          this.profesional = profesional[0];
          if (profesional.length === 0) {
            this.flag = false;
          } else {
            this.profesional = profesional[0];
            this.flag = true;
          }
          if (this.flag === false) {
            this.route.params
              .switchMap((paramsTemporal: Params) =>
                this._turnoService.getTurnoSolicitados(paramsTemporal['id']).pipe(catchError(() => of(null)))
              ).subscribe(
                (profesionalTemporal: any) => {
                  this.profesional = profesionalTemporal;
                  if (this.profesional.formacionGrado[0].entidadFormadora.codigo === null) {
                    this.tieneOtraEntidad = true;
                  } else {
                    this.tieneOtraEntidad = false;
                  }
                }
              );
          }
          this.habilitaPosgrado();
        });
      }
    });
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
    // this.fotoHijo.mostrarFoto(this.img64);
    this._profesionalService.saveProfesional({ imagen: imagenPro }).subscribe(resp => {
    });
  }

  guardarFirmaGrid(firma) {
    const firmaPro = {
      'firmaP': firma,
      'idProfesional': this.profesional.id
    };
    this._profesionalService.saveProfesional({ firma: firmaPro }).subscribe(resp => {

    });
  }

  guardarFirmaAdminGrid(oFirma) {
    const firmaADmin = {
      'firma': oFirma.firma,
      'nombreCompleto': oFirma.nombreCompleto,
      'idProfesional': this.profesional.id
    };
    this._profesionalService.saveProfesional({ firmaAdmin: firmaADmin }).subscribe(resp => {

    });
  }

  guardarNotas(textoNotas) {
    const cambio = {
      'op': 'updateNotas',
      'data': textoNotas,
      'agente': this.auth.usuario.nombreCompleto
    };

    this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => { });

    // this.updateProfesional();
  }

  guardarSancion(sancion: any) {

    const cambio = {
      'op': 'updateSancion',
      'data': sancion,
      'agente': this.auth.usuario.nombreCompleto
    };

    this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => { });
  }

  guardarFormacionPosgrado(posgrado: any) {
    const cambio = {
      'op': 'updatePosGrado',
      'data': posgrado,
      'agente': this.auth.usuario.nombreCompleto
    };

    this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => { });
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

    this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {

    });
  }

  matricularProfesional(matriculacion: any) {
    if (this.profesional.formacionGrado[this.indexFormacionGradoSelected].matriculacion === null) {
      this.profesional.formacionGrado[this.indexFormacionGradoSelected].matriculacion = [matriculacion];
    } else {
      this.profesional.formacionGrado[this.indexFormacionGradoSelected].matriculacion.push(matriculacion);
    }
    // this.updateProfesional();

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
    // this.router.navigate(['/turnos', { id: this.profesional.id }]);
    this.location.back();
  }
  volverP() {
    this.router.navigate(['/listarProfesionales']);
  }

  volverProfesional() {
    if (this.flag === false && !this.editable) {
      this.location.back();
    }
    if (this.flag === false && this.editable) {
      this.flag = true;
    }
  }


  formacionGradoSelected(formacion: any) {
    this.mostrar = true;
    this.mostrarGrado = false;
    this.indexFormacionGradoSelected = formacion;
    // if (this.mostrarGrado === true) {
    //     this.mostrarGrado = false;
    // } else {
    //     this.mostrarGrado = true;
    // }
  }

  formacionPosgradoSelected(posgrado: any) {
    this.mostrarGrado = true;
    this.mostrar = false;
    this.indexFormacionPosgradoSelected = posgrado;
    // if (this.mostrar === true) {
    //     this.mostrar = false;
    // } else {
    //     this.mostrar = true;
    // }
  }

  cerrar(grado) {
    if (grado === true) {
      this.mostrar = false;
    } else {
      this.mostrarGrado = false;
    }
  }

  editar() {
    this.flag = false;
    this.editable = true;
  }

  habilitaPosgrado() {
    const res = this.profesional.formacionGrado.find(p => p.profesion.codigo === 1 || p.profesion.codigo === 2);
    return res;
  }

  // pdf(){
  //     const pdf = this._pdfUtils.comprobanteTurnoDesdeProf(this.profesional);
  //     pdf.save('Turno ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
  // }
  // generarCredencial() {

  //             // this._profesionalService.getCredencial(this.profesional.id)
  //             //     .subscribe((resp) => {
  //                     const pdf = this._pdfUtils.generarCredencial(this.profesional);
  //                     pdf.save('Credencial ' + this.profesional.nombre + ' ' + this.profesional.apellido + '.pdf');
  //                     // this.loading = false;
  //              //   });
  //         }
}


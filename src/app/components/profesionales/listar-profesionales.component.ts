// General
import { Component, OnInit, HostBinding } from '@angular/core';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { IProfesional } from '../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Auth } from '@andes/auth';
import { ExcelService } from '../../services/excel.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-listar-profesionales',
  templateUrl: 'listar-profesionales.html'
})

export class ListarProfesionalesComponent implements OnInit {
  public profesionales: IProfesional[] = [];
  public profesionalElegido: IProfesional;
  private showListado: Boolean = true;
  public dni: string = null;
  public estadoSeleccionadoG;
  public estadoSeleccionadoE;
  public tienePermisos;
  public apellido: string = null;
  public nombre: string = null;
  public vieneDeListado = null;
  public totalProfesionales = null;
  public estadoEspecialidad: {
    id: null,
    nombre: null
  };
  $subject: Subject<void> = new Subject<void>();
  public nuevoProfesional = false;
  public totalProfesionalesRematriculados = null;
  public totalProfesionalesMatriculados = null;
  public matriculaVencida = null;
  public hoy = null;
  public muestraFiltro = false;
  public estado: {
    id: null,
    nombre: null
  };
  public editable = false;
  public confirmar = false;
  public estadosMatriculas: any;
  public verBajas = false;
  public verExportador = false;
  public estaRematriculado;
  public estaMatriculado;
  public mostrarRestablecer;
  public verDeshabilitado;
  public expSisa = false;
  public limit = 50;
  public exportSisa = {
    fechaDesde: '',
    fechaHasta: ''
  };
  searchForm: FormGroup;
  value;
  constructor(
    private _profesionalService: ProfesionalService,
    private excelService: ExcelService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: Auth,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      apellido: [''],
      nombre: [''],
      documento: [''],
      estado: '',
      estadoEspecialidad: '',
      verBajas: false,
      verDeshabilitado: false,
      numeroMatriculaGrado: '',
      numeroMatriculaEspecialidad: ''
    });

    this.searchForm.valueChanges.pipe(debounceTime(900)).subscribe(
      (value) => {
        this.value = value;
        if (this.value.estado && this.value.estado.nombre === 'Todos') {
          this.value.estado.nombre = '';
        }
        if (this.value.estadoEspecialidad && this.value.estadoEspecialidad.nombre === 'Todos') {
          this.value.estadoEspecialidad.nombre = '';
        }
        this.buscar();
      });

    this.buscar();
    this.vieneDeListado = true;
    this.hoy = new Date();
    this.estadosMatriculas = Enums.getObjEstadosMatriculas();
    this._profesionalService.getEstadisticas().subscribe((data) => {
      this.totalProfesionales = data.total;
      this.totalProfesionalesMatriculados = data.totalMatriculados;
      this.totalProfesionalesRematriculados = data.totalRematriculados;
    });

    this.tienePermisos = this.auth.check('matriculaciones:profesionales:getProfesional');
  }

  showProfesional(profesional: any) {
    this.router.navigate(['/profesional', profesional.id]);
  }

  seleccionar(profesional: any) {
    this.profesionalElegido = profesional;
    this.verExportador = false;
  }

  buscar(event?: any) {
    this.verBajas = this.value ? this.value.verBajas : false;
    this.profesionalElegido = null;
    this._profesionalService.getProfesional({
      documento: this.value ? this.value.documento : '',
      apellido: this.value ? this.value.apellido : '',
      nombre: this.value ? this.value.nombre : '',
      estado: this.value && this.value.estado ? this.value.estado.nombre : '',
      estadoE: this.value ? this.value.estadoEspecialidad.nombre : '',
      bajaMatricula: this.value ? this.value.verBajas : false,
      habilitado: this.value ? this.value.verDeshabilitado : false,
      numeroMatriculaGrado: this.value && this.value.numeroMatriculaGrado ? this.value.numeroMatriculaGrado : '',
      numeroMatriculaEspecialidad: this.value ? this.value.numeroMatriculaEspecialidad : '',
      matriculacion: true,
      limit: this.limit
    }).subscribe((data) => {
      this.profesionales = data;
    });
  }

  cerrarResumenProfesional() {
    this.profesionalElegido = null;
  }

  sobreTurno(profesional: any) {
    this.router.navigate(['/solicitarTurnoRenovacion', profesional.id]);
  }

  matriculadoGrado() {
    if (!this.estado && this.estado.nombre === 'Todas') {
      this.estadoSeleccionadoG = null;
    } else {
      this.estadoSeleccionadoG = this.estado.nombre;
    }
    this.buscar();
  }

  matriculadoEspecialidad() {
    if (this.estadoEspecialidad == null) {
      this.estadoSeleccionadoE = null;
    } else {
      if (this.estadoEspecialidad.nombre === 'Suspendidas') {
        this.estadoSeleccionadoE = this.estadoEspecialidad.nombre;
      }
      if (this.estadoEspecialidad.nombre === 'Vigentes') {
        this.estadoSeleccionadoE = this.estadoEspecialidad.nombre;
      }
      if (this.estadoEspecialidad.nombre === 'Todos') {
        this.estadoSeleccionadoE = null;
      }
    }
    this.buscar();
  }

  filtrarRematriculados() {
    this.estaRematriculado = true;
    this.estaMatriculado = false;
    this.mostrarRestablecer = true;
    this.buscar();
  }

  filtrarMatriculados() {

    this.estaMatriculado = true;
    this.estaRematriculado = false;
    this.mostrarRestablecer = true;
    this.buscar();
  }

  filtrarTodos() {
    this.estaMatriculado = false;
    this.estaRematriculado = false;
    this.mostrarRestablecer = false;
    this.buscar();
  }

  mostrarFiltros() {
    if (this.muestraFiltro === false) {
      this.muestraFiltro = true;
    } else {
      this.muestraFiltro = false;
    }
  }

  verNuevoProfesional(valor) {
    if (valor === true) {
      this.nuevoProfesional = true;
      this.confirmar = true;
    } else {
      this.nuevoProfesional = false;
    }
  }

  onScroll() {
    this.limit = this.limit + 15;
    this.buscar();
  }

  exportarSisa() {
    this.expSisa = false;
    this._profesionalService.getProfesionalesSisa(this.exportSisa).subscribe((data) => {
      this.excelService.exportAsExcelFile(data, 'profesionales');
      this.expSisa = true;
    });
  }

  checkExpSisa() {
    if (this.exportSisa.fechaDesde && this.exportSisa.fechaHasta) {
      if (this.exportSisa.fechaDesde <= this.exportSisa.fechaHasta) {
        this.expSisa = true;
      } else {
        this.expSisa = false;
      }
    } else {
      this.expSisa = false;
    }
  }

  getFechaUltimoTramite(profesional: IProfesional) {
    const fechasEgreso = profesional.formacionGrado.map(grado => grado.fechaEgreso);
    return Math.max.apply(null, fechasEgreso);
  }

  crearMuevoProfesional() {
    this.cerrarResumenProfesional();
    this.nuevoProfesional = true;
    this.confirmar = true;
  }
}

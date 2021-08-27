import { Component, OnInit } from '@angular/core';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { IProfesional } from '../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Auth } from '@andes/auth';
import { ExcelService } from '../../services/excel.service';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-listar-profesionales',
  templateUrl: 'listar-profesionales.html'
})

export class ListarProfesionalesComponent implements OnInit {
  public profesionales$: Observable<any[]>;
  private listadoProfesionales: any[];
  public profesionalElegido: IProfesional;
  public estadoSeleccionadoG;
  public estadoSeleccionadoE;
  public tienePermisos;
  public vieneDeListado = null;
  public totalProfesionales = null;
  public estadoEspecialidad: {
    id: null,
    nombre: null
  };
  public nuevoProfesional = false;
  public totalProfesionalesRematriculados = null;
  public totalProfesionalesMatriculados = null;
  public hoy = null;
  public muestraFiltro = false;
  public estado: {
    id: null,
    nombre: null
  };
  public confirmar = false;
  public estadosMatriculas: any;
  public verBajas = false;
  public verExportador = false;
  public estaRematriculado;
  public estaMatriculado;
  public mostrarRestablecer;
  public expSisa = false;
  public limit = 50;
  public editar = false;
  public seleccionado = false;
  public profesionalSeleccionado;
  itemsDropdown: any = [];
  public exportSisa = {
    fechaDesde: '',
    fechaHasta: ''
  };
  searchForm: FormGroup;
  value;
  public columns = [
    {
      key: 'profesional',
      label: 'Profesional',
    },
    {
      key: 'documento',
      label: 'Documento',
      opcional: true,
    },
    {
      key: 'profesion',
      label: 'Profesión',
      opcional: true,
    },
    {
      key: 'fechaNacimiento',
      label: 'Fecha nacimiento',
      opcional: true,
    },
    {
      key: 'ultimoTramite',
      label: 'Fecha último trámite',
      opcional: true,
    },
    {
      key: ''
    }
  ];
  constructor(
    private _profesionalService: ProfesionalService,
    private excelService: ExcelService,
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
    }

    );

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

  setDropDown(profesional) {
    this.itemsDropdown = [];
    this.itemsDropdown[0] = { icon: 'turno-mas', label: 'DAR SOBRETURNO', handler: () => { this.sobreTurno(profesional); } };
    this.itemsDropdown[1] = { icon: 'pencil', label: 'EDITAR', handler: () => { this.editarProfesional(profesional); } };
  }

  showProfesional(profesional: any) {
    this.router.navigate(['/profesional', profesional.id]);
  }

  editarProfesional(profesional: any) {
    this.editar = true;
    this.profesionalSeleccionado = profesional;
    this.seleccionado = false;
  }

  seleccionar(profesional: any) {
    this.profesionalSeleccionado = profesional;
    this.verExportador = false;
    this.seleccionado = true;
  }

  buscar(event?: any) {
    this.verBajas = this.value ? this.value.verBajas : false;
    this.profesionalElegido = null;
    this.profesionales$ = this._profesionalService.getProfesional({
      documento: this.value ? this.value.documento : '',
      apellido: this.value ? this.value.apellido : '',
      nombre: this.value ? this.value.nombre : '',
      estado: this.value && this.value.estado ? this.value.estado.nombre : '',
      estadoE: this.value ? this.value.estadoEspecialidad.nombre : '',
      bajaMatricula: this.value ? this.value.verBajas : false,
      habilitado: this.value ? this.value.verDeshabilitado : false,
      numeroMatriculaGrado: this.value ? this.value.numeroMatriculaGrado : '',
      numeroMatriculaEspecialidad: this.value ? this.value.numeroMatriculaEspecialidad : '',
      matriculacion: true,
      limit: this.limit
    }).pipe(
      map(data => this.listadoProfesionales = data)
    );
  }

  cerrarResumenProfesional() {
    this.profesionalElegido = null;
  }

  sobreTurno(profesional: any) {
    this.router.navigate(['/solicitarTurnoRenovacion', profesional.id]);
  }

  filtrarTodos() {
    this.estaMatriculado = false;
    this.estaRematriculado = false;
    this.mostrarRestablecer = false;
    this.buscar();
  }

  verNuevoProfesional(valor) {
    if (valor) {
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
    this.seleccionado = false;
  }

  exportarSISA() {
    this.verExportador = true;
    this.seleccionado = false;
  }

  cancelarDetalle(evento) {
    this.seleccionado = evento;
  }
}

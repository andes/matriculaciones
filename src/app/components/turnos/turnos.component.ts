import { Component, OnInit, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';

// Services
import { TurnoService } from './../../services/turno.service';
import { PDFUtils } from './../../utils/PDFUtils';
import { PdfService } from '../../services/pdf.service';
import { Auth } from '@andes/auth';
import { CambioDniService } from '../../services/cambioDni.service';
import { ProfesionalService } from '../../services/profesional.service';
import { ListadoTurnosPdfComponent } from './listado-turnos-pdf.component';
import { Subject } from 'rxjs/Rx';
import { catchError, switchMap } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';

@Component({
    selector: 'app-turnos',
    templateUrl: 'turnos.html'
})
export class TurnosComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    public turnos: any[] = [];
    public tieneFoto = false;
    public img64 = null;
    public foto: any;
    public turnosDelDia: any[] = [];
    public turnoElegido: any;
    public lblTurnos: String;
    public showListado: Boolean = true;
    public solicitudesDeCambio;
    public muestraAusente = false;
    private fechaValida = true;
    public fechaTurno;
    public fechaDesde;
    public nombre;
    public apellido;
    public documento;
    public horarioTurno;
    public notas;
    offset = 0;
    limit = 15;
    turnosTotal = null;
    private scrollEnd = false;
    public hoy = moment();
    mySubject = new Subject();

    public filtroBuscar = {
        nombre: '',
        apellido: '',
        documento: '',
        fecha: moment(),
        offset: 0,
        size: 15,
        fechaHoy: moment(),
        delDia: false
    };

    public componentPrint = false;
    turnosParaListado: any;
    public columns = [
        {
            key: 'profesional',
            label: 'profesional',
        },
        {
            key: 'horario',
            label: 'horario',
        },
        {
            key: 'profesion',
            label: 'Profesión',
            opcional: true,
        },
        {
            key: 'tipo',
            label: 'Tipo',
            opcional: true,
        },
        {
            key: 'asistencia',
            label: 'Asistencia',
        }
    ];
    constructor(
        private _turnoService: TurnoService,
        private _pdfUtils: PDFUtils,
        private pdfService: PdfService,
        private router: Router,
        private _cambioDniService: CambioDniService,
        public auth: Auth,
        public listadoPdf: ListadoTurnosPdfComponent,
        private _profesionalService: ProfesionalService,
        public sanitizer: DomSanitizer,
        private breakpointObserver: BreakpointObserver,
        private plex: Plex) {
        this.mySubject
            .debounceTime(1000)
            .subscribe(val => {
                if (val === 'fecha') {
                    const fecha = (this.fechaDesde) ? moment(this.fechaDesde).startOf('day') : moment().startOf('day');
                    if (fecha.isValid()) {
                        this.filtroBuscar['fecha'] = fecha;
                        this.fechaValida = true;
                    } else {
                        this.fechaValida = false;
                    }
                } else {
                    if (val === 'documento') {
                        this.filtroBuscar['documento'] = this.documento;
                    } else if (val === 'apellido') {
                        this.filtroBuscar['apellido'] = this.apellido;
                    } else if (val === 'nombre') {
                        this.filtroBuscar['nombre'] = this.nombre;
                    }

                }
                this.filtroBuscar.offset = 0;
                this.scrollEnd = false;
                this.buscar();
            });
    }

    ngOnInit() {

        /**
            * 1) Cada vez que inicia fechaSDesde y fechaShoy(fechas ubicadas en el localStorage) se encuentran en null.
            * 2) Cuando se hace un filtro en la fechaDesde (En "fechaSDesde" guarda dicha fecha filtrada y en "fechaSHoy" guarda la fecha de hoy).
            * 3) Mientras que la "fechaSHoy" del localStorage siga siendo la misma que la fecha de hoy, se va a filtrar por la fecha "fechaSDesde".
            * 4) Cuando la "fechaSHoy" no coincida con el dia de hoy, se remueve lo que esta guardado en el localStorage y se filtra por fecha de hoy".
            */

        const fechaSDesde: any = JSON.parse(localStorage.getItem('fechaDesde'));
        const fechaSHoy: any = JSON.parse(localStorage.getItem('fechaHoy'));

        if (fechaSDesde) {
            if (moment(fechaSHoy.fechaHoy).format('MMM Do YY') === moment(this.hoy).format('MMM Do YY')) {
                this.filtroBuscar.fecha = moment(fechaSDesde.fecha).startOf('day');
            } else {
                this.filtroBuscar.fecha = moment().startOf('day');
                localStorage.removeItem('fechaDesde');
                localStorage.removeItem('fechaHoy');
            }
        } else {
            this.filtroBuscar.fecha = moment().startOf('day');
        }
        this.fechaDesde = this.filtroBuscar.fecha;
        this.filtroBuscar.offset = 0;
        this.buscar();
        this.contadorDeCambiosDni();
    }

    showTurno(turno: any) {
        this.muestraAusente = false;
        this.turnoElegido = turno;
        this.fechaTurno = moment(turno.fecha).format('dddd L');
        this.horarioTurno = moment(turno.fecha).format('LT');
        if (moment(this.hoy).format('MMM Do YY') === moment(turno.fecha).format('MMM Do YY')) {
            this.muestraAusente = true;
        }
        this._profesionalService.getProfesionalFoto({ id: this.turnoElegido.profesional._id }).pipe(catchError(() => of(null))).subscribe(resp => {
            if (resp) {
                this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
                this.tieneFoto = true;
            }
        });
        this._profesionalService.getProfesional({ documento: this.turnoElegido.profesional.documento }).subscribe(profesional => {
            this.notas = profesional[profesional?.length - 1]?.notas;
        });
    }

    isSelected(turno: any) {
        return this.turnoElegido && turno.id === this.turnoElegido.id;
    }

    isMobile() {
        return this.breakpointObserver.isMatched('(max-width: 599px)');
    }

    buscar(event?: any) {
        if (!event) {
            this.turnoElegido = null;
        }
        if (this.filtroBuscar.offset === 0) {
            this.turnos = [];
        }
        if (this.fechaValida) {
            this._turnoService.getTurnosProximos(this.filtroBuscar).subscribe((resp) => {
                this.lblTurnos = `Turnos del ${moment(this.filtroBuscar.fecha).format('DD/MM/YYYY')}`;
                resp.data.forEach(turno => {
                    this.turnos.push(turno);
                });
                this.turnosDelDia = this.turnos.filter(turno => { return (moment(this.filtroBuscar.fecha).format('MMM Do YY') === moment(turno.fecha).format('MMM Do YY')); });
                if (event) {
                    event.callback(resp);
                }
                this.filtroBuscar.offset = this.turnos.length;
                if (!this.turnos.length || this.turnos.length < this.filtroBuscar.size) {
                    this.scrollEnd = true;
                }
            });
        }
    }

    saveFecha() {
        localStorage.setItem('fechaDesde', JSON.stringify({ fecha: this.filtroBuscar.fecha }));
        localStorage.setItem('fechaHoy', JSON.stringify({ fechaHoy: this.filtroBuscar.fechaHoy }));
    }

    showProfesional(turno: any) {
        if (turno.tipo === 'matriculacion') {
            this.router.navigate(['/profesional', turno.profesional.id]);
        }
        if (turno.tipo === 'renovacion') {
            this.router.navigate(['/profesional', turno.profesional.idRenovacion]);
        }
    }

    cambiarEstado(presente) {
        this.turnoElegido.sePresento = presente;
        this._turnoService.saveTurno(this.turnoElegido).subscribe();
    }

    generarComprobante(turno: any) {
        const pdf = this._pdfUtils.comprobanteTurno(turno);
        pdf.save('Turno ' + turno.profesional.nombre + ' ' + turno.profesional.apellido + '.pdf');
    }

    cerrarDetalleTurno() {
        this.turnoElegido = null;
    }

    onScroll() {
        if (!this.scrollEnd) {
            this.buscar();
        }
    }

    contadorDeCambiosDni() {
        let contador = 0;
        this._cambioDniService.get().subscribe(data => {
            for (let _n = 0; _n < data.length; _n++) {
                if (data[_n].atendida === false) {
                    contador += 1;
                }
            }
            this.solicitudesDeCambio = contador;
        });
    }

    descargarPDF() {
        const filtrosTurno = {
            nombre: this.filtroBuscar.nombre || '',
            apellido: this.filtroBuscar.apellido || '',
            documento: this.filtroBuscar.documento || '',
            fecha: this.filtroBuscar.fecha || null,
            delDia: true,
            offset: 0,
            size: 0
        };
        this._turnoService.getTurnosProximos(filtrosTurno).pipe(
            switchMap(resp => {
                const filtrosPDF = {
                    fecha: this.filtroBuscar.fecha,
                    turnos: resp.data
                };
                return this.pdfService.listadoTurnos(filtrosPDF, 'listadoTurnos');
            })
        ).subscribe();
    }

    anularTurno() {

        this.plex.confirm('¿Esta seguro que desea anular este turno?').then((resultado) => {
            if (resultado) {
                this.turnoElegido.anulado = true;
                this._turnoService.saveTurno(this.turnoElegido)
                    .subscribe(resp => {
                        const index = this.turnos.findIndex(x => x.id === this.turnoElegido.id);
                        this.turnos.splice(index, 1);
                        this.turnoElegido = null;
                    });
            }
        });
    }

    obtenerMatriculaGrado(iProfesional, iGrado) {
        if (!this.turnos?.length) {
            return;
        }
        const profesional = this.turnos[iProfesional].profesional.formacionGrado[iGrado];
        if (profesional.matriculacion) {
            if (profesional.matriculacion[profesional.matriculacion.length - 1].matriculaNumero) {
                return profesional.matriculacion[profesional.matriculacion.length - 1].matriculaNumero;
            }
        }
        return '';
    }

    back() {
        this.router.navigate(['/homeAdministracion']);
    }
}

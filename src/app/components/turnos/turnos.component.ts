import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as moment from 'moment';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { environment } from './../../../environments/environment';

// Services
import { TurnoService } from './../../services/turno.service';

import { PDFUtils } from './../../utils/PDFUtils';
import { Auth } from '@andes/auth';
import { CambioDniService } from '../../services/cambioDni.service';
import { ProfesionalService } from '../../services/profesional.service';
import { ListadoTurnosPdfComponent } from './listado-turnos-pdf.component';

const jsPDF = require('jspdf');

@Component({
    selector: 'app-turnos',
    templateUrl: 'turnos.html',
    styleUrls: ['turnos.scss']
})
export class TurnosComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    public turnos: any[] = [];
    public turnoElegido: any;
    public showListado: Boolean = true;
    public solicitudesDeCambio;
    public muestraAusente = false;
    offset = 0;
    limit = 30;
    turnosTotal = null;
    modalScrollDistance = 2;
    modalScrollThrottle = 10;
    public hoy = new Date();

    public filtroBuscar = {
        nombre: '',
        apellido: '',
        documento: '',
        fecha: new Date(),
        offset: 0,
        size: 0,
        fechaHoy: new Date()
    };

    public componentPrint = false;
    turnosParaListado: any;
    constructor(private _turnoService: TurnoService,
        private _formBuilder: FormBuilder,
        private _pdfUtils: PDFUtils,
        private route: ActivatedRoute,
        private router: Router,
        private _cambioDniService: CambioDniService,
        public auth: Auth,
        public listadoPdf: ListadoTurnosPdfComponent,
        private _profesionalService: ProfesionalService) { }

    onScroll() {
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
                this.filtroBuscar.fecha = new Date(fechaSDesde.fecha);
            } else {
                this.filtroBuscar.fecha = new Date();
                localStorage.removeItem('fechaDesde');
                localStorage.removeItem('fechaHoy');
            }
        } else {
            this.filtroBuscar.fecha = new Date();
        }

        this.buscar();
        this.contadorDeCambiosDni();

        if (environment.production === true) {
            // this.avisoTurno();
        }
    }

    showTurno(turno: any) {
        this.muestraAusente = false;
        this.turnoElegido = turno;
        if (moment(this.hoy).format('MMM Do YY') === moment(turno.fecha).format('MMM Do YY')) {
            this.muestraAusente = true;
        }

    }

    isSelected(turno: any) {
        return this.turnoElegido && turno.id === this.turnoElegido.id;
    }

    buscar(event?: any) {

        if (!event) {
            this.turnoElegido = null;
        }

        this.filtroBuscar['offset'] = this.offset;
        this.filtroBuscar['size'] = this.limit;

        this._turnoService.getTurnosProximos(this.filtroBuscar)
            .subscribe((resp) => {
                this.turnos = resp.data;
                if (event) {

                    event.callback(resp);
                }

                this._turnoService.getTurnosProximos(this.filtroBuscar)
                    .subscribe((res) => {
                        this.turnosTotal = res.data.length;
                        if (event) {

                            event.callback(res);
                        }
                    });
            });

    }

    saveFecha() {
        localStorage.setItem('fechaDesde', JSON.stringify({ fecha: this.filtroBuscar.fecha }));
        localStorage.setItem('fechaHoy', JSON.stringify({ fechaHoy: this.filtroBuscar.fechaHoy }));
    }

    showProfesional(turno: any) {
        if (turno.tipo = 'matriculacion') {
            this.router.navigate(['/profesional', turno.profesional.id]);
        }
        if (turno.tipo = 'renovacion') {
            this.router.navigate(['/profesional', turno.profesional.idRenovacion]);
        }

    }

    cambiarEstado() {
        this.turnoElegido.sePresento = true;
        this._turnoService.saveTurno(this.turnoElegido)
            .subscribe(resp => {
            });
    }

    generarComprobante(turno: any) {
        const pdf = this._pdfUtils.comprobanteTurno(turno);
        pdf.save('Turno ' + turno.profesional.nombre + ' ' + turno.profesional.apellido + '.pdf');
    }

    cerrarDetalleTurno() {
        this.turnoElegido = null;
    }

    onModalScrollDown() {
        this.limit = this.limit + 5;
        this.buscar();
        // this.modalTitle = 'updated on ' + (new Date()).toString();
        // this.modalBody += modalText;
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

    imprimir() {
        let filtrosPdf = {
            fecha: this.filtroBuscar.fecha,
            limit: 40

        };
        this._turnoService.getTurnosProximos(filtrosPdf)
            .subscribe((resp) => {
                const totalTurnos = resp.data;
                const nuevo = totalTurnos.filter(turno => { return (moment(this.filtroBuscar.fecha).format('MMM Do YY') === moment(turno.fecha).format('MMM Do YY')); });
                this.componentPrint = true;
                this.turnosParaListado = nuevo;
                // this.listadoPdf.imprimir(nuevo);
            });

    }

    // avisoTurno(event?: any) {
    //     const tieneCelular = false;
    //     const numeroCelular;

    //     if (!event) {
    //         this.turnoElegido = null;
    //     }

    //     const consulta = this.formBuscarTurno.value;
    //     consulta.offset = event ? event.query.offset : this.offset;
    //     consulta.size = event ? event.query.size : this.limit;


    //     this._turnoService.getTurnosProximos(consulta)

    //         .subscribe((resp) => {
    //             for (let _i = 0; _i < resp.data.length; _i++) {
    //                 const fechaFin = moment(resp.data[_i].fecha);
    //                 const hoy = moment(new Date());
    //                 if (resp.data[_i].notificado === false && fechaFin.diff(hoy, 'days') <= 3) {

    //                     // tslint:disable-next-line:max-line-length
    //                     this._profesionalService.getProfesional({ id: resp.data[_i].profesional.idRenovacion }).subscribe((profesional: any) => {
    //                         const contactos = resp.data[_i].profesional.contactos;

    //                         // contactos.forEach(element => {
    //                         //     if (element.tipo === 'celular') {
    //                         //         tieneCelular = true;
    //                         //         numeroCelular = Number(element.valor);
    //                         //     }
    //                         // });
    //                         // if (resp.data[_i].tipo === 'renovacion') {
    //                         //     contactos = profesional[0].contactos;
    //                         //     contactos.forEach(element => {
    //                         //         if (element.tipo === 'celular') {
    //                         //             tieneCelular = true;
    //                         //             numeroCelular = Number(element.valor);
    //                         //         }
    //                         //     });
    //                         // }
    //                         if (fechaFin.diff(hoy, 'days') <= 3 && tieneCelular === true && resp.data[_i].notificado === false) {
    //                             const nombreCompleto = resp.data[_i].profesional.nombreCompleto;
    //                             const smsParams = {
    //                                 telefono: numeroCelular,
    //                                 // tslint:disable-next-line:max-line-length
    //                                 mensaje: 'Estimado ' + nombreCompleto + ', le recordamos que usted tiene el turno para realizar el tramite de matriculacion el dia ' + moment(fechaFin).format('l') + ' a las ' + moment(fechaFin).format('LT') + ' '
    //                             };
    //                             this._profesionalService.enviarSms(smsParams).subscribe(dataSms => {

    //                                 const cambio = {
    //                                     'op': 'updateNotificado',
    //                                     'data': true,
    //                                 };

    //                                 this._turnoService.patchTurnos(resp.data[_i].id, cambio).subscribe((data) => {

    //                                 });
    //                             });


    //                         }
    //                     });

    //                 }
    //             }
    //         });
    // }


}

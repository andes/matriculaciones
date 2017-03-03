import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

// Components
// import { NuevoTurnoComponent } from './nuevo-turno.component';
// import { NuevoProfesionalComponent } from './../profesionales/nuevo-profesional.component';

// Services
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProfesionService } from './../../services/profesion.service';
import { EntidadFormadoraService } from './../../services/entidadFormadora.service';
import { ProfesionalService } from './../../services/profesional.service';
import { TurnoService } from './../../services/turno.service';

// Utils
import { PDFUtils } from './../../utils/PDFUtils';

const jsPDF = require('jspdf');

@Component({
    selector: 'app-solicitar-turno-matriculacion',
    templateUrl: 'solicitar-turno-matriculacion.html'
})
export class SolicitarTurnoMatriculacionComponent implements OnInit {
    public tipoTurno: Enums.TipoTurno;
    private formTurno: FormGroup;
    public turnoSeleccionado: boolean;
    public turnoGuardado: boolean;
    private _turnoSeleccionado: Date;
    private _profesionalID: string;
    public _nuevoProfesional: any;

    constructor(private _formBuilder: FormBuilder,
        private _turnosService: TurnoService,
        private _paisService: PaisService,
        private _provinciaService: ProvinciaService,
        private _localidadService: LocalidadService,
        private _profesionService: ProfesionService,
        private _profesionalService: ProfesionalService,
        private _entidadFormadoraService: EntidadFormadoraService,
        private _pdfUtils: PDFUtils) {

            this.tipoTurno = Enums.TipoTurno.matriculacion;

         }

    ngOnInit() {

    }

    onTurnoSeleccionado(turno: Date) {
        this._turnoSeleccionado = turno;
        this.turnoSeleccionado = true;
    }

    /*imprimirTurno(turno: any) {
        const fechaTurno = new Date(turno.fecha);
        // console.log(JSON.stringify(this._nuevoProfesional));
        const doc = new jsPDF('p', 'mm', 'a4');
        const hoy = new Date();

        doc.text('Registro Único de Profesionales de la Salud', 120, 20, 'center');
        doc.text('de la Provincia del Neuquén', 120, 26, 'center');
        doc.setLineWidth(1);
        doc.line(20, 40, 190, 40);
        doc.setFontSize(12);
        doc.text(20, 45, 'Planilla de Turno Otrogado');
        doc.text(155, 45, 'MATRICULACIÓN');
        doc.line(20, 47, 190, 47);
        doc.setFontSize(10);
        doc.text(20, 52,
            'Su turno ha sido tramitado el día ' +
            hoy.getDate() + '/' +
            (hoy.getMonth() + 1) + '/' +
            hoy.getFullYear());

        doc.text(20, 57,
            'Deberá presentarse el día ' +
            fechaTurno.getDate() + '/' +
            (fechaTurno.getMonth() + 1) + '/' +
            fechaTurno.getFullYear() +
            ' a las ' + fechaTurno.getHours() +
            (fechaTurno.getMinutes() > 0 ? ':' + fechaTurno.getMinutes() : '') +
            ' hs. en Antártida Argentina y Colón, Edif. CAM 3, Fisc. Sanitaria.');

        doc.setLineWidth(0.5);
        doc.line(20, 59, 190, 59);

        doc.setFontSize(12);
        doc.text(20, 65, 'Apellido/s:');
        doc.text(20, 71, 'Nombre/s:');
        doc.text(20, 77, 'Documento:');
        doc.text(20, 83, 'Fecha de Nacimiento:');
        doc.text(20, 89, 'Lugar de Nacimiento:');
        doc.text(20, 95, 'Sexo:');
        doc.text(20, 101, 'Nacionalidad:');

        doc.line(20, 105, 190, 105);

        doc.text(20, 111, 'Profesión:');
        doc.text(20, 117, 'Título:');
        doc.text(20, 123, 'Ent. Formadora:');
        doc.text(20, 129, 'Fecha de Egreso:');

        doc.line(20, 135, 190, 135);

        // Domicilios
        let offsetLoop = 0;
        turno._profesional.domicilios.forEach(domicilio => {
            doc.setFontSize(14);
            doc.text(20, 141 + offsetLoop, 'Domicilio ' + domicilio.tipo);
            doc.line(20, 143 + offsetLoop , 190, 143 + offsetLoop);
            doc.setFontSize(12);
            doc.text(20, 148 + offsetLoop, 'Calle:');
            doc.text(20, 154 + offsetLoop, 'C.P.:');
            doc.text(20, 160 + offsetLoop, 'País:');
            doc.text(70, 160 + offsetLoop, 'Provincia:');
            doc.text(130, 160 + offsetLoop, 'Localidad:');
            doc.setLineWidth(0.5);
            doc.line(20, 162 + offsetLoop, 190, 162 +  offsetLoop);
            offsetLoop += 26;
        });

        // Contacto
        doc.setFontSize(14);
        doc.text(20, 219, 'Información de Contacto');
        doc.line(20, 220 , 190, 220);
        doc.setFontSize(12);
        offsetLoop = 0;
        turno._profesional.contactos.forEach(contacto => {
            doc.text(20, 225 + offsetLoop, contacto.tipo + ':');
            offsetLoop += 6;
        });

        // Firmas
        doc.text('..............................................', 50, 265, 'center');
        doc.text('Interesado', 50, 271, 'center');

        doc.text('..............................................', 160, 265, 'center');
        doc.text('Agente Matriculador', 160, 271, 'center');


        // Completado
        doc.setFont('courier');
        doc.text(65, 65, turno._profesional.apellidos);
        doc.text(65, 71, turno._profesional.nombres);
        doc.text(65, 77, 'DNI ' + turno._profesional.documentoNumero);
        doc.text(65, 83, this.getFormatedDate(turno._profesional.fechaNacimiento));
        doc.text(65, 89, turno._profesional.lugarNacimiento);
        doc.text(65, 95, turno._profesional.sexo);
        doc.text(65, 101, turno._profesional.nacionalidad.nombre);

        doc.text(65, 111, turno._profesional.profesion.nombre);
        doc.text(65, 117, turno._profesional.titulo);
        doc.text(65, 123, turno._profesional.entidadFormadora.nombre);
        doc.text(65, 129, this.getFormatedDate(turno._profesional.fechaEgreso));

        // completado domicilios
        offsetLoop = 0;
        turno._profesional.domicilios.forEach(domicilio => {
            doc.setFontSize(12);
            doc.text(35, 148 + offsetLoop, domicilio.valor);
            doc.text(35, 154 + offsetLoop, domicilio.codigoPostal);
            doc.text(35, 160 + offsetLoop, domicilio.ubicacion.pais.nombre);
            doc.text(90, 160 + offsetLoop, domicilio.ubicacion.provincia.nombre);
            doc.text(150, 160 + offsetLoop, domicilio.ubicacion.localidad.nombre);
            offsetLoop += 26;
        });

        // Completado contactos
        offsetLoop = 0;
        turno._profesional.contactos.forEach(contacto => {
            doc.text(35, 225 + offsetLoop, contacto.valor);
            offsetLoop += 6;
        });

        doc.save('datos.pdf');

    }

    getFormatedDate(date: any): string {
        const fecha = new Date(date);
        return fecha.getDate() + '/' + (fecha.getMonth() + 1) + '/' + fecha.getFullYear();
    }*/


    saveTurno() {

        this.formTurno = this._formBuilder.group({
            fecha: this._turnoSeleccionado,
            tipo: this.tipoTurno,
            _profesional: this._nuevoProfesional._id
        });

        this._turnosService.saveTurnoMatriculacion(this.formTurno.value)
            .subscribe(turno => {
                console.log('Turno solicitado : ');
                console.log(turno);
                const pdf = this._pdfUtils.comprobanteTurno(turno);
                pdf.save('Turno ' + this._nuevoProfesional.nombres + ' ' + this._nuevoProfesional.apellidos + '.pdf');
            });
    }

    onProfesionalCompleto(profesional: any) {
        this._profesionalService.saveProfesional(profesional)
            .subscribe((nuevoProfesional) => {
                this._nuevoProfesional = nuevoProfesional;
                this.turnoGuardado = true;
                console.log(this._nuevoProfesional);
                console.log('profesional guardado');

                if (this._turnoSeleccionado && this._nuevoProfesional) {
                    this.saveTurno();
                }
        });
    }
}


const jsPDF = require('jspdf');

export class PDFUtils {

    public generarCredencial( profesional: any, grado: any, fotoProfesional, firmaProfesional): any {
        const ultimaRenovacion = profesional.formacionGrado[grado].matriculacion[profesional.formacionGrado[grado].matriculacion.length - 1];

        const doc = new jsPDF('p', 'mm', [217.5, 304.3]);
        doc.setFontSize(6);
        doc.setFontStyle('bold');
        doc.text(/*'Argentina'*/ profesional.nacionalidad.nombre, 14, 14);
        doc.text(/*'TEC. EN LABORATORIO CLINICO E HISTOPATOLOGIA'*/profesional.formacionGrado[grado].titulo, 20, 17);
        doc.text(/*'UNIV. NAC. DE CORDOBA'*/profesional.formacionGrado[grado].entidadFormadora.nombre, 20, 20);
        doc.text(/*'01/12/1999'*/ this.getDateStr(profesional.formacionGrado[grado].fechaEgreso), 28, 24);
       doc.addImage('data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABkAAD/4QN1aHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzAxNCA3OS4xNTY3OTcsIDIwMTQvMDgvMjAtMDk6NTM6MDIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6RUI4NjdFM0JCNDMxRTMxMUE1RTNERTNGNDFERDg0NzkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTIyRUQ1RDAyRTMzMTFFNUIyRUE5MzBDNUQxMEVDOUEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTIyRUQ1Q0YyRTMzMTFFNUIyRUE5MzBDNUQxMEVDOUEiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyNzYxQ0I3ODJFMjgxMUU1QjJFQTkzMEM1RDEwRUM5QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyNzYxQ0I3OTJFMjgxMUU1QjJFQTkzMEM1RDEwRUM5QSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRG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', 'jpg', 38, 25, 30, 14);
        doc.text('Dr. Ruben Monsalvo', 42, 41);
        doc.text(/*'15/07/2010'*/ this.getDateStr(profesional.formacionGrado[grado].fechaTitulo), 50, 48);
        doc.addPage();
        if (profesional.rematriculado === true) {
            doc.setFillColor(255, 0, 0);
        }else {
            doc.setFillColor(0, 153, 0);
        }
        doc.rect(9, 9, 30, 30, 'F');
         doc.addImage(fotoProfesional, 10, 10, 28, 28);
        doc.text(/*'BO TEC. EN LABORATORIO'*/profesional.formacionGrado[grado].profesion.nombre, 43, 13);
        doc.text(/*'PINO'*/profesional.apellido, 43, 18);
        doc.text(/*'JORGE PABLO'*/profesional.nombre, 43, 23);
        doc.text(/*'Masculino'*/ profesional.sexo, 74, 23);
        doc.text('DNI ' + profesional.documento, 43, 28);
        doc.text(/*'29/01/1970'*/ this.getDateStr(profesional.fechaNacimiento), 43, 34);
        doc.text(/*'15/07/2010'*/ this.getDateStr(ultimaRenovacion.inicio), 43, 40);
        doc.text(/*'29/01/2015'*/ this.getDateStr(ultimaRenovacion.fin), 66, 40);
       doc.addImage(firmaProfesional, 'jpg', 54, 41, 31, 10);
        doc.setFontSize(8);
        doc.text(/*'82'*/ultimaRenovacion.matriculaNumero.toString(), 74, 13);

        return doc;
    }

    // public generarCredencial(imgsData: any, profesional: any, formacionGrado: any): any {
    //     const ultimaRenovacion = formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1];

    //     const doc = new jsPDF('p', 'mm', [217.5, 304.3]);
    //     doc.setFontSize(6);
    //     doc.setFontStyle('bold');
    //     doc.text(/*'Argentina'*/ profesional.nacionalidad.nombre.toUpperCase(), 14, 14);
    //     doc.text(/*'TEC. EN LABORATORIO CLINICO E HISTOPATOLOGIA'*/formacionGrado.titulo.toUpperCase(), 20, 17);
    //     doc.text(/*'UNIV. NAC. DE CORDOBA'*/formacionGrado.entidadFormadora.nombre, 20, 20);
    //     doc.text(/*'01/12/1999'*/ this.getDateStr(formacionGrado.fechaEgreso), 28, 24);
    //     doc.addImage(imgsData.firmaSupervisor, 'jpg', 38, 25, 30, 14);
    //     doc.text('Dr. Ruben Monsalvo', 42, 41);
    //     doc.text(/*'15/07/2010'*/ this.getDateStr(formacionGrado.fechaTitulo), 50, 48);
    //     doc.addPage();
    //     doc.setFillColor(0, 153, 0);
    //     doc.rect(9, 9, 30, 30, 'F');
    //     doc.addImage(imgsData.foto, 'jpg', 10, 10, 28, 28);
    //     doc.text(/*'BO TEC. EN LABORATORIO'*/formacionGrado.profesion.nombre.toUpperCase(), 43, 13);
    //     doc.text(/*'PINO'*/profesional.apellido.toUpperCase(), 43, 18);
    //     doc.text(/*'JORGE PABLO'*/profesional.nombre.toUpperCase(), 43, 23);
    //     doc.text(/*'Masculino'*/ profesional.sexo, 74, 23);
    //     doc.text('DNI ' + profesional.documento, 43, 28);
    //     doc.text(/*'29/01/1970'*/ this.getDateStr(profesional.fechaNacimiento), 43, 34);
    //     doc.text(/*'15/07/2010'*/ this.getDateStr(ultimaRenovacion.inicio), 43, 40);
    //     doc.text(/*'29/01/2015'*/ this.getDateStr(ultimaRenovacion.fin), 66, 40);
    //     doc.addImage(imgsData.firmaProfesional, 'jpg', 54, 41, 31, 10);
    //     doc.setFontSize(8);
    //     doc.text(/*'82'*/ultimaRenovacion.matriculaNumero.toString(), 74, 13);

    //     return doc;
    // }


    private getDateStr(date: Date): String {
        const dt = new Date(date);
        return dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
    }

    public comprobanteTurno(turno: any): any {
        const fechaTurno = new Date(turno.fecha);

        const doc = new jsPDF('p', 'mm', 'a4');
        const hoy = new Date();

        doc.text('Registro Único de Profesionales de la Salud', 120, 20, 'center');
        doc.text('de la Provincia del Neuquén', 120, 26, 'center');
        doc.setLineWidth(1);
        doc.line(20, 40, 190, 40);
        doc.setFontSize(12);
        doc.text(20, 45, 'Planilla de Turno Otorgado');
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
         turno.profesional.domicilios.forEach(domicilio => {
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
        turno.profesional.contactos.forEach(contacto => {
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
        doc.text(65, 65, turno.profesional.apellido);
        doc.text(65, 71, turno.profesional.nombre);
        doc.text(65, 77, 'DNI ' + turno.profesional.documento);
        doc.text(65, 83, this.getSimpleFormatedDate(turno.profesional.fechaNacimiento));
        doc.text(65, 89, turno.profesional.lugarNacimiento);
         doc.text(65, 95, turno.profesional.sexo);
        doc.text(65, 101, turno.profesional.nacionalidad.nombre);

        doc.text(65, 111, turno.profesional.formacionGrado[0].profesion.nombre);
        doc.text(65, 117, turno.profesional.formacionGrado[0].titulo);
        doc.text(65, 123, turno.profesional.formacionGrado[0].entidadFormadora.nombre);
        doc.text(65, 129, this.getSimpleFormatedDate(turno.profesional.formacionGrado[0].fechaTitulo));

        // completado domicilios
        offsetLoop = 0;
        turno.profesional.domicilios.forEach(domicilio => {
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
        turno.profesional.contactos.forEach(contacto => {
            doc.text(50, 225 + offsetLoop, contacto.valor);
            offsetLoop += 6;
        });

        return doc;

    }

    private getSimpleFormatedDate(date: any): string {
        const fecha = new Date(date);
        return fecha.getDate() + '/' + (fecha.getMonth() + 1) + '/' + fecha.getFullYear();
    }
}


const jsPDF = require('jspdf');

export class PDFUtils {

    public generarCredencial(imgsData: any, profesional: any): any {

        const doc = new jsPDF('p', 'mm', [217.5, 304.3]);
        doc.setFontSize(6);
        doc.setFontStyle('bold');
        doc.text(/*'Argentina'*/ profesional.nacionalidad.nombre.toUpperCase(), 14, 14);
        doc.text(/*'TEC. EN LABORATORIO CLINICO E HISTOPATOLOGIA'*/profesional.formacionProfesional.titulo.toUpperCase(), 20, 17);
        doc.text(/*'UNIV. NAC. DE CORDOBA'*/profesional.formacionProfesional.entidadFormadora.nombre, 20, 20);
        doc.text(/*'01/12/1999'*/ this.getDateStr(profesional.formacionProfesional.fechaEgreso), 28, 24);
        doc.addImage(imgsData.firmaSupervisor, 'jpg', 38, 25, 30, 14);
        doc.text('Dr. Ruben Monsalvo', 42, 41);
        doc.text(/*'15/07/2010'*/ this.getDateStr(profesional.formacionProfesional.fechaEgreso), 50, 48);
        doc.addPage();
        doc.setFillColor(0, 153, 0);
        doc.rect(9, 9, 30, 30, 'F');
        doc.addImage(imgsData.foto, 'jpg', 10, 10, 28, 28);
        doc.text(/*'BO TEC. EN LABORATORIO'*/profesional.formacionProfesional.profesion.nombre.toUpperCase(), 43, 13);
        doc.text(/*'PINO'*/profesional.apellidos.toUpperCase(), 43, 18);
        doc.text(/*'JORGE PABLO'*/profesional.nombres.toUpperCase(), 43, 23);
        doc.text(/*'Masculino'*/ profesional.sexo.nombre, 74, 23);
        doc.text('DNI ' + profesional.documentoNumero, 43, 28);
        doc.text(/*'29/01/1970'*/ this.getDateStr(profesional.fechaNacimiento), 43, 34);
        doc.text(/*'15/07/2010'*/ this.getDateStr(profesional.ultimoPeriodoMatriculaProfesional[0].inicio), 43, 40);
        doc.text(/*'29/01/2015'*/ this.getDateStr(profesional.ultimoPeriodoMatriculaProfesional[0].fin), 66, 40);
        doc.addImage(imgsData.firmaProfesional, 'jpg', 54, 41, 31, 10);
        doc.setFontSize(8);
        doc.text(/*'82'*/profesional.formacionProfesional.matriculaNumero.toString(), 74, 13);

        return doc;
    }

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
        doc.text(65, 65, turno.profesional.apellidos);
        doc.text(65, 71, turno.profesional.nombres);
        doc.text(65, 77, 'DNI ' + turno.profesional.documentoNumero);
        doc.text(65, 83, this.getSimpleFormatedDate(turno.profesional.fechaNacimiento));
        doc.text(65, 89, turno.profesional.lugarNacimiento);
        doc.text(65, 95, turno.profesional.sexo.nombre);
        doc.text(65, 101, turno.profesional.nacionalidad.nombre);

        doc.text(65, 111, turno.profesional.formacionProfesional.profesion.nombre);
        doc.text(65, 117, turno.profesional.formacionProfesional.titulo);
        doc.text(65, 123, turno.profesional.formacionProfesional.entidadFormadora.nombre);
        doc.text(65, 129, this.getSimpleFormatedDate(turno.profesional.formacionProfesional.fechaEgreso));

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
            doc.text(35, 225 + offsetLoop, contacto.valor);
            offsetLoop += 6;
        });

        return doc;

    }

    private getSimpleFormatedDate(date: any): string {
        const fecha = new Date(date);
        return fecha.getDate() + '/' + (fecha.getMonth() + 1) + '/' + fecha.getFullYear();
    }
}

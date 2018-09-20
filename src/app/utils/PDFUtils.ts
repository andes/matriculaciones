
const jsPDF = require('jspdf');

export class PDFUtils {

    public generarCredencial(profesional: any, grado: any, fotoProfesional, firmaProfesional, firmaAdmin): any {
        // tslint:disable-next-line:max-line-length
        const ultimaRenovacion = profesional.formacionGrado[grado].matriculacion[profesional.formacionGrado[grado].matriculacion.length - 1];

        const doc = new jsPDF('p', 'mm', [217.5, 304.3]);
        doc.setFontSize(6);
        doc.setFontStyle('bold');
        doc.text(/*'Argentina'*/ profesional.nacionalidad.nombre, 14, 14);
        doc.text(/*'TEC. EN LABORATORIO CLINICO E HISTOPATOLOGIA'*/profesional.formacionGrado[grado].titulo, 20, 17);
        // doc.text(/*'UNIV. NAC. DE CORDOBA'*/profesional.formacionGrado[grado].entidadFormadora.nombre, 20, 20);
        const splitTitle = doc.splitTextToSize(profesional.formacionGrado[grado].entidadFormadora.nombre, 60);
        let textoEntidad = 20;
        splitTitle.forEach(element => {

            doc.text(/*'UNIV. NAC. DE CORDOBA'*/element, 15, textoEntidad);
            textoEntidad = textoEntidad + 3;
        });
        doc.text(/*'01/12/1999'*/ this.getDateStr(profesional.formacionGrado[grado].fechaEgreso), 28, 28);
        doc.addImage(firmaAdmin.firma, 'jpg', 38, 25, 30, 14);
        if (firmaAdmin.administracion === null) {
            doc.text('', 42, 41);
        } else {
            doc.text(firmaAdmin.administracion, 42, 41);
        }
        doc.text(/*'15/07/2010'*/ this.getDateStr(profesional.formacionGrado[grado].fechaTitulo), 50, 48);
        doc.addPage();
        if (profesional.formacionGrado[grado].profesion.tipoDeFormacion === 'Tecnicatura') {
            doc.setFillColor(255, 0, 0);
        }
        if (profesional.formacionGrado[grado].profesion.tipoDeFormacion === 'Grado Universitario') {
            doc.setFillColor(45, 190, 63);
        }
        if (profesional.formacionGrado[grado].profesion.tipoDeFormacion === 'Auxiliarato') {
            doc.setFillColor(62, 37, 215);
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

    public certificadoDeEtica(profesional, grado) {

        const fecha = grado.matriculacion[grado.matriculacion.length - 1].inicio;
        const doc = new jsPDF('p', 'mm', 'a4');
        const hoy = new Date();
        const mes = new Date().toLocaleString('es-AR', { month: 'long' });
        // tslint:disable-next-line:max-line-length
        const img = 'data:image/jpeg;base64,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iOnkkETi2XnAASA4AgPz3+r9Kkn/AOIz+Z39p/4Slz0FaN/JKwf7uh/dT0FaN/JKwf7uh/dTWBWXlCdW2flAt+taW0dp09y7WvVE2V5lifI5kcsg3ZBOJC7I7k4IwAC1bjlM5ZKnWOl32KCy9GRzTMfO/toTc4xpyGYMYx3Qacg/ycdRKstUWu2VFrFqnt1HLbwxrBSvha6ENbja3YRjAwMDHDAWHb9L6Zt1Yyst+nbRR1Medk0FFHG9uQQcOAyMgkfpTUV41Zpuv012PVshucckFVW34Vj4JGbXQh0EjWtPE8S1gdxwRuwRkL05PeWn0JaQodP+hrt3tXnPu3b3N7t0jn/e82cY3Y6+8rH3W12y7U7aa626jr4GvD2x1MLZWhwBG4BwIzgkZ90rX02kNJ01RFU02l7JDPE8PjkjoImuY4HIcCG5BB45TUV85I7HfNf8pp1lcmyCjpq4VdROHkN51p3Rwx7txIBDBt/ksGMglubPIixLAiIgIiICIiAiIgIiICIiAiIg1d+9h+N9iJfvYfjfYiDPo/UkPvbfoXqvKj9SQ+9t+heqAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiDV372H432Il+9h+N9iIM+j9SQ+9t+heq8qP1JD7236F6oCIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiINXfvYfjfYiX72H432IgzqFwdRwlpyNgHk4L2Wsqny24tELw6N+cMcM7ervrx6VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86DcotN0rUeBF5D506VqPAi8h86D0vzgXxMz3QBJH58eZF7wUjJ42z1LjM97QR3g0Y6uCIP//Z';
        doc.addImage(img, 'jpg', 8, 15, 35, 35);
        doc.setFontSize(12);
        doc.setFontStyle('bold');
        doc.text('Provincia del Neuquén', 70, 30);
        doc.setFontStyle('normal');
        doc.text('La Dirección de Fiscalización Sanitaria de la Subsecretaría de Salud de la Provincia de Neuquén,', 8, 60);
        doc.text('CERTIFICA que ' + profesional.nombreCompleto.toUpperCase() + '  - DNI ' + profesional.documento + '', 8, 65);
        doc.text('se encuentra inscripto/a en el Registro Único de Profesionales de la Salud de la Provincia de Neuquén', 8, 70);
        // tslint:disable-next-line:max-line-length
        doc.text('como ' + grado.profesion.nombre.toUpperCase() + ' bajo la matrícula Nº ' + grado.matriculacion[grado.matriculacion.length - 1].matriculaNumero + ' desde ' + fecha.getFullYear() + '.', 8, 75);
        doc.text('A la fecha, no surge de nuestros registros presuntas infracciones emergentes del incumplimiento', 8, 86);
        doc.text('de la Ley Nº 578, y su Decreto Reglamentario Nº 338/78, referidas al citado profesional.', 8, 91);
        doc.setFontStyle('bold');
        doc.text('Por pedido del interesado/a, a los fines que hubiere lugar, se extiende el presente, en Neuquén', 8, 101);
        doc.text('a los ' + hoy.getDate() + ' días del mes de ' + mes + ' de ' + hoy.getFullYear() + '.', 8, 106);
        doc.setFontStyle('normal');
        doc.text('EL PRESENTE CERTIFICADO TIENE VALIDEZ POR EL TERMINO DE 30 (TREINTA) DIAS.', 8, 116);

        doc.setFontSize(9);
        doc.setFontStyle('bold');
        // tslint:disable-next-line:max-line-length
        doc.text('Dirección de Fiscalización Sanitaria | Antartida Argentina y Colón, Edif. CAM 3 | CP (8300) Neuquén | Tel.: 0299 - 4495590 / 5591', 10, 290);

        return doc;
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
            doc.line(20, 143 + offsetLoop, 190, 143 + offsetLoop);
            doc.setFontSize(12);
            doc.text(20, 148 + offsetLoop, 'Calle:');
            doc.text(20, 154 + offsetLoop, 'C.P.:');
            doc.text(20, 160 + offsetLoop, 'País:');
            doc.text(70, 160 + offsetLoop, 'Provincia:');
            doc.text(130, 160 + offsetLoop, 'Localidad:');
            doc.setLineWidth(0.5);
            doc.line(20, 162 + offsetLoop, 190, 162 + offsetLoop);
            offsetLoop += 26;
        });

        // Contacto
        doc.setFontSize(14);
        doc.text(20, 219, 'Información de Contacto');
        doc.line(20, 220, 190, 220);
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
            // tslint:disable-next-line:max-line-length
            if (domicilio.valor && domicilio.ubicacion && domicilio.ubicacion.provincia && domicilio.ubicacion.localidad && domicilio.ubicacion.pais && domicilio.codigoPostal) {
                doc.setFontSize(12);
                doc.text(35, 148 + offsetLoop, domicilio.valor);
                doc.text(35, 154 + offsetLoop, domicilio.codigoPostal);
                doc.text(35, 160 + offsetLoop, domicilio.ubicacion.pais.nombre);
                doc.text(90, 160 + offsetLoop, domicilio.ubicacion.provincia.nombre);
                doc.text(150, 160 + offsetLoop, domicilio.ubicacion.localidad.nombre);
                offsetLoop += 26;
            }
        });

        // Completado contactos
        offsetLoop = 0;
        turno.profesional.contactos.forEach(contacto => {
            doc.text(50, 225 + offsetLoop, contacto.valor);
            offsetLoop += 6;
        });

        return doc;

    }

    public comprobanteTurnoRenovacion(turno: any): any {
        console.log(turno);
        const fechaTurno = new Date(turno.fecha);

        const doc = new jsPDF('p', 'mm', 'a4');
        const hoy = new Date();

        doc.text('Registro Único de Profesionales de la Salud', 120, 20, 'center');
        doc.text('de la Provincia del Neuquén', 120, 26, 'center');
        doc.setLineWidth(1);
        doc.line(20, 40, 190, 40);
        doc.setFontSize(12);
        doc.text(20, 45, 'Planilla de Turno Otorgado');
        doc.text(155, 45, 'RENOVACION');
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

        doc.text(65, 65, turno.profesional.apellido);
        doc.text(65, 71, turno.profesional.nombre);
        doc.text(65, 77, 'DNI ' + turno.profesional.documento);

        // Firmas
        doc.text('..............................................', 50, 265, 'center');
        doc.text('Interesado', 50, 271, 'center');

        doc.text('..............................................', 160, 265, 'center');
        doc.text('Agente Matriculador', 160, 271, 'center');
        return doc;
    }

    private getSimpleFormatedDate(date: any): string {
        const fecha = new Date(date);
        return fecha.getDate() + '/' + (fecha.getMonth() + 1) + '/' + fecha.getFullYear();
    }
}

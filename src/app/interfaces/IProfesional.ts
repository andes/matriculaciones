import {
    Sexo
} from './../utils/enumerados';

export interface IProfesional {
    id: String;
    habilitado: Boolean;
    validadoRenaper?: Boolean;
    nombre: String;
    apellido: String;
    tipoDocumento: String;
    documento: String;
    documentoVencimiento: Date;
    cuit: String;
    fechaNacimiento: Date;
    lugarNacimiento: String;
    profesionalMatriculado?: Boolean;
    nacionalidad: {
        nombre: String;
        codigo: number;
    };
    sexo: Sexo;
    contactos: [{
        tipo: String;
        valor: String;
        rank: number;
        ultimaActualizacion: Date;
        activo: boolean;
    }];
    domicilios: [{
        tipo: String;
        valor: String;
        codigoPostal: String;
        ubicacion: {
            localidad: any;
            provincia: any;
            pais: any;
        };
        ultimaActualizacion: Date;
        activo: boolean;
    }, {
        tipo: String;
        valor: String;
        codigoPostal: String;
        ubicacion: {
            localidad: any;
            provincia: any;
            pais: any;
        };
        ultimaActualizacion: Date;
        activo: boolean;
    }, {
        tipo: String;
        valor: String;
        codigoPostal: String;
        ubicacion: {
            localidad: any;
            provincia: any;
            pais: any;
        };
        ultimaActualizacion: Date;
        activo: boolean;
    }];
    fotoArchivo: String;
    firmas: [{
        imgArchivo: String;
        fecha: Date;
    }];
    formacionGrado: [{
        exportadoSisa?: Boolean;
        profesion: {
            nombre: String;
            codigo: number;
            tipoDeFormacion: String;
        };
        entidadFormadora: {
            nombre: String;
            codigo: number;
        };
        titulo: String;
        tituloFileId?: String;
        fechaEgreso: Date;
        fechaTitulo: Date;
        renovacion: boolean;
        renovacionOnline?: {
            estado: String;
            descripcion: String;
            fecha: Date;
        };
        papelesVerificados: boolean;
        matriculacion?: [{
            matriculaNumero: Number;
            libro: String;
            folio: String;
            inicio: Date;
            baja: {
                motivo: String;
                fecha: any;
            };
            notificacionVencimiento: Boolean;
            fin: Date;
            revalidacionNumero: Number;
        }];
        matriculado: boolean;
        fechaDeInscripcion?: Date;
        configuracionSisa: {
            idProfesional: Number;
            idProfesion: Number;
            idMatricula: Number;
            codigoProfesional: String;
        };
    }];
    formacionPosgrado: [{
        profesion: {
            nombre: String;
            codigo: number;
        };
        institucionFormadora: {
            nombre: String;
            codigo: number;
        };
        especialidad: {
            nombre: String;
            codigo: number;
        };
        tituloFileId?: String;
        fechaIngreso: Date;
        fechaEgreso: Date;
        observacion: String;
        certificacion: {
            fecha: Date;
            modalidad: {
                nombre: String;
                codigo: number;
            };
            establecimiento: {
                nombre: String;
                codigo: number;
            };
        };
        matriculacion?: [
            {
                matriculaNumero: Number;
                libro: String;
                folio: String;
                inicio: Date;
                notificacionVencimiento: Boolean;
                fin: Date;
                revalidacionNumero: Number;
            }
        ];
        fechasDeAltas?: [{ fecha: Date }];
        tieneVencimiento?: boolean;
        papelesVerificados: boolean;
        matriculado: boolean;
        revalida: boolean;
        notas: String;
    }];
    documentos?: [{
        fecha: Date;
        tipo: String;
        archivo: {
            id: String;
            extension: String;
        };
    }];
    origen: String;
    sanciones: [{
        numero: Number;
        sancion: {
            id: Number;
            nombre: String;
        };
        motivo: String;
        normaLegal: String;
        fecha: Date;
        vencimiento: Date;
    }];
    OtrosDatos: [{
        matriculaProvincial: Number;
        folio: String;
        libro: String;
        anio: Number;
    }];
    notas: String;
    rematriculado: Number;
    agenteMatriculador: String;
    supervisor?: {
        id: String;
        nombreCompleto: String;
    };
    idRenovacion: String;
    documentoViejo: Number;
}

import { Sexo } from './../utils/enumerados';
import { SIISAObject, SIISAEspecialidad } from './ISiisa';

export interface Iperiodos {
    notificacionVencimiento: Boolean;
    inicio: Date;
    fin: Date;
    revalidacionNumero: Number;
    revalida: Boolean;
};

export interface Imatriculacion {
    fechaAlta: Date;
    matriculaNumero: Number;
    baja: {
        motivo: String;
        fecha: Date;
    };
    periodos: Iperiodos[];
};

export interface Icertificacion {
    fecha: Date;
    modalidad: SIISAObject;
    establecimiento: SIISAObject;
};

export interface IformacionPosgrado {
    profesion: SIISAObject;
    institucionFormadora: SIISAObject;
    especialidad: SIISAEspecialidad;
    fechaIngreso: Date;
    fechaEgreso: Date;
    tituloFileId: String;
    observacion: String;
    certificacion: Icertificacion;
    matriculacion: Imatriculacion[];
    matriculado: Boolean;
    revalida: Boolean;
    papelesVerificados: Boolean;
    fechaDeVencimiento: Date;
    exportadoSisa: Boolean;
    tieneVencimiento: Boolean;
    notas: [String];
}
export interface IProfesional {
    id: String;
    habilitado: Boolean;
    nombre: String;
    apellido: String;
    tipoDocumento: String;
    documento: String;
    documentoVencimiento: Date;
    cuit: String;
    fechaNacimiento: Date;
    lugarNacimiento: String;
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
    profesionalMatriculado?: boolean;
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
    }];
    formacionPosgrado: IformacionPosgrado[];
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
};

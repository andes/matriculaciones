import {
    Sexo,
    EstadoCivil,
    TipoContacto,
    TipoDomicilio
} from './../utils/enumerados';

export interface IProfesional {
    _id: string;
    cuitCuil: string;
    apellidos: string;
    nombres: string;
    documentoNumero: string;
    documentoVencimiento: Date;
    lugarNacimiento: string;
    fechaNacimiento: Date;
    nacionalidad: {
        nombre: string;
        codigo: number;
    };
    sexo: Sexo;
    estadoCivil: EstadoCivil;
    contacto: [{
        tipo: TipoContacto;
        valor: string;
        rank: number;
        ultimaActualizacion: Date;
        activo: boolean;
    }];
    domicilios: [{
        tipo: TipoDomicilio;
        valor: string;
        codigoPostal: string;
        ubicacion: {
            localidad: string;
            provincia: string;
            pais: string
        };
        ultimaActualizacion: Date;
        activo: boolean;
    }];
    foto: string;
    firmas: [{
        archivo: string;
        fecha: Date;
    }];
    formacionProfesional: {
        profesion: {
            nombre: string;
            codigo: number;
        };
        entidadFormadora: {
            nombre: string;
            codigo: number;
        };
        titulo: string;
        fechaEgreso: Date;
        matriculaNumero: number;
        libro: string;
        folio: string;
        periodos: [{
            inicio: Date;
            fin: Date;
            numero: number;
        }],
        revalida: boolean;
        revalidaciones: [{
            numero: number;
            fecha: Date;
        }];
    };
    matriculasEspecialidades: [{
        especialidad: {
            nombre: string;
            codigo: number;
        };
        entidadRevalidadora: {
            nombre: string;
            codigo: number;
        };
        numero: Number;
        certificacion: {
            nombre: string;
            codigo: number;
        };
        libro: String;
        folio:  String;
        periodos: [{
            incio: Date,
            fin: Date,
            numero: number;
        }],
        revalida: Boolean;
        revalidaciones: [{
            numero: Number;
            fecha: Date;
        }]
    }];
    rematriculado: Boolean;
    origen: String;
}

import {
    Sexo,
    EstadoCivil,
    TipoContacto,
    TipoDomicilio
} from './../utils/enumerados';

export interface IProfesional {
    cuitCuil: string;
    apellidos: string;
    nombres: string;
    documentoNumero: string;
    documentoVencimiento: Date;
    lugarNacimiento: string;
    fechaNacimiento: Date;
    nacionalidad: string;
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
    rol: string;
    profesion: {
        nombre: string;
        codigoSISA: number;
    };
    entidadFormadora: {
        nombre: string;
        codigoSISA: number;
    };
    titulo: string;
    fechaEgreso: Date;
    matriculas: [{
        numero: number;
        activo: boolean;
        rank: number;
        especialidad: {
            nombre: string;
            codigoSISA: string;
        };
        periodo: {
            incio: Date;
            fin: Date;
        }
     }];
     origen: string;
}
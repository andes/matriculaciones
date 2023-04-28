export interface ISiisa {
    nombre: String;
    codigoSISA: Number;
    activo: Boolean;
};

export interface SIISAObject {
    nombre: string;
    codigo: Number;
};

export interface SIISAEspecialidad {
    nombre: string;
    codigo: { sisa: number };
    tipoDeFormacion: String;
    habilitado: boolean;
};

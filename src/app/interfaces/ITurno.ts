import { TipoTurno } from './../utils/enumerados';
import {IProfesional } from './IProfesional';

export interface ITurno {
    tipo: TipoTurno;
    fecha: Date;
    hora: String;
    _profesional: string;
}

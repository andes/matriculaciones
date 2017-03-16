import { TipoTurno } from './../utils/enumerados';
import {IProfesional } from './IProfesional';

export interface ITurno {
    tipo: TipoTurno;
    fecha: Date;
    hora: String;
    sePresento: Boolean;
    profesional: string;
}

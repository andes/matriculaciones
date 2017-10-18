import { Dia } from './../utils/enumerados';

export interface IAgendaMatriculaciones {
    _id: String;
    diasHabilitados: Dia[];
    horarioInicioTurnos: string;
    horarioFinTurnos: string;
    fechasExcluidas: Date[];
    duracionTurno: number;
}

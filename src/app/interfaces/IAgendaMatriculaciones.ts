import { Dia } from './../utils/enumerados';

export interface IAgendaMatriculaciones {
    _id: String;
    diasHabilitados: Dia[];
    horarioInicioTurnos: number;
    horarioFinTurnos: number;
    fechasExcluidas: Date[];
    duracionTurno: number;
}

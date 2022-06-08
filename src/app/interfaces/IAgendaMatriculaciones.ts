import { Dia } from './../utils/enumerados';

export interface IAgendaMatriculaciones {
    id: String;
    diasHabilitados: any[];
    horarioInicioTurnos: string;
    horarioFinTurnos: string;
    fechasExcluidas: Date[];
    duracionTurno: number;
}

import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'edad', pure: false })
// pure: false - Info: https://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
export class EdadPipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        let edad: any;
        const fechaActual: Date = new Date();
        const fechaNac = moment(value.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        const fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        const difDias = fechaAct.diff(fechaNac, 'd'); // Diferencia en días
        const difAnios = Math.floor(difDias / 365.25);
        const difMeses = Math.floor(difDias / 30.4375);
        const difHs = fechaAct.diff(fechaNac, 'h'); // Diferencia en horas
        const difMn = fechaAct.diff(fechaNac, 'm'); // Diferencia en minutos

        if (difAnios !== 0) {
            edad = {
                valor: difAnios,
                unidad: 'años'
            };
        } else if (difMeses !== 0) {
            edad = {
                valor: difMeses,
                unidad: 'meses'
            };
        } else if (difDias !== 0) {
            edad = {
                valor: difDias,
                unidad: 'días'
            };
        } else if (difHs !== 0) {
            edad = {
                valor: difHs,
                unidad: 'horas'
            };
        } else if (difMn !== 0) {
            edad = {
                valor: difMn,
                unidad: 'minutos'
            };
        }

        return (String(edad.valor) + ' ' + edad.unidad);
    }
}


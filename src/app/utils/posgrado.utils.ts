import { IformacionPosgrado, Imatriculacion, Iperiodos } from '../interfaces/IProfesional';

/**
 * Devuelve la última matriculación de un posgrado de forma segura.
 * Retorna null si el posgrado no tiene matriculaciones.
 */
export function obtenerUltimaMatriculacion(formacion: IformacionPosgrado | any): Imatriculacion | any {
    const matriculaciones = formacion?.matriculacion;
    if (!Array.isArray(matriculaciones) || !matriculaciones.length) {
        return null;
    }
    return matriculaciones[matriculaciones.length - 1] || null;
}

/**
 * Devuelve el último período de la última matriculación de un posgrado.
 * Si el registro no tiene `periodos` (esquema viejo) cae al `inicio`/`fin` plano.
 * Retorna null si no hay datos válidos.
 *
 * TODO: remover el fallback de esquema viejo una vez migrados los datos.
 */
export function obtenerUltimoPeriodo(formacion: IformacionPosgrado | any): Iperiodos | any {
    const matriculacion = obtenerUltimaMatriculacion(formacion);
    if (!matriculacion) {
        return null;
    }
    const periodos = matriculacion.periodos;
    if (Array.isArray(periodos) && periodos.length) {
        return periodos[periodos.length - 1] || null;
    }
    if (matriculacion.inicio || matriculacion.fin) {
        return { inicio: matriculacion.inicio, fin: matriculacion.fin };
    }
    return null;
}

/**
 * Devuelve la fecha de fin del último período válido de un posgrado.
 * Retorna null si no hay fecha de fin disponible.
 */
export function obtenerFechaFinPosgrado(formacion: IformacionPosgrado | any): Date | null {
    const periodo = obtenerUltimoPeriodo(formacion);
    return periodo?.fin ? new Date(periodo.fin) : null;
}

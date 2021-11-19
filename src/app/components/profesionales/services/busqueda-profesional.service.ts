import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IProfesion } from '../../../interfaces/IProfesion';

@Injectable()
export class BusquedaProfesionalService {
    // URL to web api
    protected url = '/core/tm/profesionales/';
    // Filtros de profesional
    public documentoText = new BehaviorSubject<string>(null);
    public apellidoText = new BehaviorSubject<string>(null);
    public nombreText = new BehaviorSubject<string>(null);
    public profesionSelected = new BehaviorSubject<IProfesion>(null);
    public numeroMatriculaGrado = new BehaviorSubject<string>(null);
    public numeroMatriculaEspecialidad = new BehaviorSubject<string>(null);
    public profesionalesFiltrados$: Observable<any[]>;
    // Filtros para renovacion
    public fechaDesde = new BehaviorSubject<Date>(null);
    public fechaHasta = new BehaviorSubject<Date>(null);
    public zonaSanitaria = new BehaviorSubject<any>(null);
    public profesionalesRenovacionFiltrados$: Observable<any[]>;
    // Scroll
    private limit = 15;
    private skip;
    public lastResults = new BehaviorSubject<any[]>(null);

    constructor(protected server: Server) {
        this.profesionalesFiltrados$ = combineLatest(
            this.documentoText,
            this.apellidoText,
            this.nombreText,
            this.profesionSelected,
            this.numeroMatriculaGrado,
            this.numeroMatriculaEspecialidad,
            this.lastResults
        ).debounceTime(400).pipe(
            switchMap(([documento, apellido, nombre, profesion, numeroMatriculaGrado, numeroMatriculaEspecialidad, lastResults]) => {
                if (!lastResults) {
                    this.skip = 0;
                }
                if (this.skip > 0 && this.skip % this.limit !== 0) {
                    // si skip > 0 pero no es multiplo de 'limit' significa que no hay mas resultados
                    return EMPTY;
                }
                const params: any = {
                    limit: this.limit,
                    skip: this.skip
                };
                let filtros = false;
                if (documento) {
                    params.documento = documento;
                    filtros = true;
                }
                if (apellido) {
                    params.apellido = apellido;
                    filtros = true;
                }
                if (nombre) {
                    params.nombre = nombre;
                    filtros = true;
                }
                if (profesion) {
                    params.profesion = profesion.codigo;
                    filtros = true;
                }
                if (numeroMatriculaGrado) {
                    params.numeroMatriculaGrado = numeroMatriculaGrado;
                    filtros = true;
                }
                if (numeroMatriculaEspecialidad) {
                    params.numeroMatriculaEspecialidad = numeroMatriculaEspecialidad;
                    filtros = true;
                }

                params.bajaMatricula = false;
                params.habilitado = false;
                params.matriculacion = true;

                if (filtros) {
                    return this.get(params).pipe(
                        map(resultados => {
                            const listado = lastResults ? lastResults.concat(resultados) : resultados;
                            this.skip = listado.length;
                            return listado;
                        })
                    );
                } else {
                    return of([]);
                }
            })
        );

        this.profesionalesRenovacionFiltrados$ = combineLatest(
            this.fechaDesde,
            this.fechaHasta,
            this.zonaSanitaria,
            this.lastResults
        ).debounceTime(400).pipe(
            switchMap(([fechaDesde, fechaHasta, zonaSanitaria, lastResults]) => {
                if (!lastResults) {
                    this.skip = 0;
                }
                if (this.skip > 0 && this.skip % this.limit !== 0) {
                    // si skip > 0 pero no es multiplo de 'limit' significa que no hay mas resultados
                    return EMPTY;
                }
                const params: any = {
                    limit: this.limit,
                    skip: this.skip
                };
                let filtros = false;
                if (fechaDesde) {
                    params.fechaDesde = fechaDesde;
                    filtros = true;
                }
                if (fechaHasta) {
                    params.fechaHasta = fechaHasta;
                    filtros = true;
                }
                if (zonaSanitaria) {
                    params.zonaSanitaria = zonaSanitaria.id;
                    filtros = true;
                }
                params.matriculacion = true;

                if (filtros) {
                    return this.getPendienteRenovacion(params).pipe(
                        map(resultados => {
                            const listado = lastResults ? lastResults.concat(resultados) : resultados;
                            this.skip = listado.length;
                            return listado;
                        })
                    );
                } else {
                    return of([]);
                }
            })
        );
    }

    get(params: any): Observable<any> {
        return this.server.get(this.url, { params: params, showError: true });
    }

    getPendienteRenovacion(params: any): Observable < any > {
        return this.server.get(this.url + 'renovacion', { params, showError: true });
    }
}

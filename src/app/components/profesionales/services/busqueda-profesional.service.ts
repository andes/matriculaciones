import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IProfesion } from '../../../interfaces/IProfesion';

@Injectable()
export class BusquedaProfesionalService {
    // URL to web api
    protected url = '/core/tm/profesionales/';
    public documentoText = new BehaviorSubject<string>(null);
    public apellidoText = new BehaviorSubject<string>(null);
    public nombreText = new BehaviorSubject<string>(null);
    public profesionSelected = new BehaviorSubject<IProfesion>(null);
    public numeroMatriculaGrado = new BehaviorSubject<string>(null);
    public numeroMatriculaEspecialidad = new BehaviorSubject<string>(null);
    public estado = new BehaviorSubject<any>(null);
    public estadoEspecialidad = new BehaviorSubject<any>(null);
    public verBajas = new BehaviorSubject<Boolean>(null);
    public verDeshabilitados = new BehaviorSubject<Boolean>(null);
    public profesionalesFiltrados$: Observable<any[]>;
    public lastResults = new BehaviorSubject<any[]>(null);
    private limit = 15;
    private skip;

    constructor(protected server: Server) {
        this.profesionalesFiltrados$ = combineLatest(
            this.documentoText,
            this.apellidoText,
            this.nombreText,
            this.profesionSelected,
            this.numeroMatriculaGrado,
            this.numeroMatriculaEspecialidad,
            this.estado,
            this.estadoEspecialidad,
            this.verBajas,
            this.verDeshabilitados,
            this.lastResults
        ).debounceTime(400).pipe(
            switchMap(([documento, apellido, nombre, profesion, numeroMatriculaGrado, numeroMatriculaEspecialidad, estado, estadoEspecialidad,
                        verBajas, verDeshabilitados, lastResults]) => {
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
                if (documento) {
                    params.documento = documento;
                }
                if (apellido) {
                    params.apellido = apellido;
                }
                if (nombre) {
                    params.nombre = nombre;
                }
                if (profesion) {
                    params.profesion = profesion.codigo;
                }
                if (estado) {
                    params.estado = estado.nombre;
                }
                if (estadoEspecialidad) {
                    params.estadoE = estadoEspecialidad.nombre;
                }
                if (verBajas) {
                    params.bajaMatricula = verBajas;
                } else {
                    params.bajaMatricula = false;
                }
                if (verDeshabilitados) {
                    params.habilitado = verDeshabilitados;
                } else {
                    params.habilitado = false;
                }
                if (numeroMatriculaGrado) {
                    params.numeroMatriculaGrado = numeroMatriculaGrado;
                }
                if (numeroMatriculaEspecialidad) {
                    params.numeroMatriculaEspecialidad = numeroMatriculaEspecialidad;
                }
                params.matriculacion = true;
                return this.get(params).pipe(
                    map(resultados => {
                        const listado = lastResults ? lastResults.concat(resultados) : resultados;
                        this.skip = listado.length;
                        return listado;
                    })
                );
            })
        );
    }

    get(params: any): Observable<any> {
        return this.server.get(this.url, { params: params, showError: true });
    }
}

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IProfesional } from './../../../interfaces/IProfesional';
import { ProfesionalService } from './../../../services/profesional.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-notas-profesional',
    templateUrl: 'notas-profesional.html'
})
export class NotasProfesionalComponent implements OnInit {
    textoNotas: String = '';
    @Input() profesional: IProfesional;
    @Output() onSaved = new EventEmitter();


    constructor(
        private plex: Plex,
        private profesionalService: ProfesionalService,
        private auth: Auth) {
    }

    public columns = [
        {
            key: 'fecha',
            label: 'FECHA',
        },
        {
            key: 'usuario',
            label: 'USUARIO',
        },
        {
            key: 'desccripcion',
            label: 'DESCRIPCIÓN',
        },
        {}
    ];

    public descripcionNota;
    public indice;
    public accion;
    public editarAgregar = false;
    public notaProfesional = 'Sin datos';

    ngOnInit() {
        if (!this.profesional.notas[0]._id) {
            this.notaProfesional = Object.values(this.profesional.notas[0]).filter(nota => nota).join('');
        }
    }

    agregarEditarNota(accionNota, index) {
        if (accionNota === 'agregar') {
            this.descripcionNota = '';
            this.accion = 'agregar';
        } else {
            this.indice = index;
            this.descripcionNota = this.profesional.notas[index].descripcion;
            this.accion = 'editar';
        }
        this.editarAgregar = !this.editarAgregar;
    }

    eliminarNota(index) {
        this.indice = index;
        this.accion = 'eliminar';
        this.guardarNota();
    }

    guardarNota() {
        const mensaje = (this.accion === 'editar') ? 'editó' : (this.accion === 'agregar') ? 'agregó' : 'eliminó';
        const cambio = {
            'op': 'updateNotas',
            'data': this.descripcionNota,
            'indice': this.indice,
            'accion': this.accion,
            'agente': this.auth.usuario.nombreCompleto
        };
        this.profesionalService.patchProfesional(this.profesional.id, cambio).subscribe({
            next: (profEditado) => {
                this.profesional.notas = profEditado.notas;
                this.plex.toast('success', `La nota se ${mensaje} exitosamente`);
            },
            error: () => {
                this.plex.toast('danger', `Error al ${mensaje} la nota`);
            }
        });
        if (this.accion === 'editar' || this.accion === 'agregar') {
            this.editarAgregar = !this.editarAgregar;
        }
    }

    cancelarNota() {
        this.editarAgregar = !this.editarAgregar;
    }
}

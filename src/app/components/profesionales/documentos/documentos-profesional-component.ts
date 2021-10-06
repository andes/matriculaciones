import { Component, Input, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';

// Services
import { ProfesionalService } from '../../../services/profesional.service';
import { environment } from '../../../../environments/environment';
import { Auth } from '@andes/auth';
import {
    IProfesional
} from './../../../interfaces/IProfesional';
import { Console } from 'console';

@Component({
    selector: 'app-documentos-profesional',
    templateUrl: 'documentos-profesional.html'
})

export class DocumentoProfesionalComponent implements OnInit {
    public addDocumento = false;
    public grados;
    @Input() profesional: IProfesional;
    public documentos = [
        {
            id: '1',
            label: 'Título de grado'
        },
        {
            id: '2',
            label: 'Título de posgrado'
        },
        {
            id: '3',
            label: 'Certificado'
        }
    ];

    public tipoDocumento = {
        id: '',
        label: ''
    };

    public arregloGrado = [];
    public arregloPosgrado = [];

    constructor(
        private _profesionalService: ProfesionalService,
        public auth: Auth,
        private plex: Plex) { }

    ngOnInit() {
        for (let index = 0; index < this.profesional.formacionGrado.length; index++) {
            const tituloGrado = {
                formacionGrado: {},
                titulo: ''
            };
            tituloGrado.formacionGrado = this.profesional.formacionGrado[index];
            if (this.profesional.formacionGrado[index].tituloFileId) {
                const metadata = {
                    profesionalId: this.profesional.id,
                    formacionGradoCodigo: this.profesional.formacionGrado[index].profesion.codigo,
                    fileId: this.profesional.formacionGrado[index].tituloFileId
                };
                this._profesionalService.getProfesionalTituloGrado(metadata).subscribe(data => {
                    tituloGrado.titulo = data;
                });
            }
            this.arregloGrado.push(tituloGrado);
        }

        if (this.profesional.formacionPosgrado) {
            for (let index = 0; index < this.profesional.formacionPosgrado.length; index++) {
                const tituloPosgrado = {
                    formacionPosgrado: {},
                    titulo: ''
                };
                tituloPosgrado.formacionPosgrado = this.profesional.formacionPosgrado[index];;
                if (this.profesional.formacionPosgrado[index].tituloFileId) {
                    const metadata = {
                        profesionalId: this.profesional.id,
                        formacionPosgradoCodigo: this.profesional.formacionPosgrado[index].profesion.codigo,
                        fileId: this.profesional.formacionPosgrado[index].tituloFileId
                    };
                    this._profesionalService.getProfesionalTituloPosgrado(metadata).subscribe(data => {
                        tituloPosgrado.titulo = data;
                    });
                }
                this.arregloPosgrado.push(tituloPosgrado);
            }
        }

    }

    agregarDocumento() {
        this.addDocumento = true;
    }

    cerrar() {
        this.addDocumento = false;
        this.tipoDocumento = {
            id: '',
            label: ''
        };
    }

    // obtenerTitulo(i) {
    //     let metadata = {
    //         profesionalId: this.profesional.id,
    //         formacionGradoCodigo: this.profesional.formacionGrado[i].profesion.codigo,
    //         fileId: this.profesional.formacionGrado[i].tituloFileId
    //     };
    //     return this._profesionalService.getProfesionalTituloGrado(metadata).subscribe();
    // }

    onUpload($event, i) {
        if ($event.status = 200) {
            const fileId = $event.body.id;
            const metadata = {
                profesionalId: this.profesional.id,
                formacionGradoCodigo: this.profesional.formacionGrado[i].profesion.codigo,
                fileId: this.profesional.formacionGrado[i].tituloFileId
            };

            const subcription = this._profesionalService.saveProfesionalTituloGrado(metadata);
            subcription.subscribe((data) => {
                this.profesional.formacionGrado[i].tituloFileId = fileId;
                this.plex.toast('success', 'Se adjuntó correctamente', 'Información', 1000);
            });
        }
    }

    descargar(fileId) {
        const token = window.sessionStorage.getItem('jwt');
        window.open(`${environment.API}/drive/${fileId}?token=${token}`);
    }

    eliminarTitulo(fileId) {
        this.plex.confirm('¿Desea eliminar el documento??').then((resultado) => {
            if (resultado) {
                this._profesionalService.deleteProfesionalTituloGrado({ fileId });
            }
        });
    }

}

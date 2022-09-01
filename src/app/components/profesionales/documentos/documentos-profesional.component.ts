import { Component, Input, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { ProfesionalService } from '../../../services/profesional.service';
import { environment } from '../../../../environments/environment';
import { Auth } from '@andes/auth';
import { IProfesional } from '../../../interfaces/IProfesional';
import { DriveService } from '../../../services/drive.service';
@Component({
    selector: 'app-documentos-profesional',
    templateUrl: 'documentos-profesional.html'
})

export class DocumentoProfesionalComponent implements OnInit {
    public addDocumento = false;
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

    public tipoDocumento = null;
    public grado;
    public posgrado;
    public certificado;
    public indice;
    public comprobante;

    constructor(
        private _profesionalService: ProfesionalService,
        public auth: Auth,
        private plex: Plex,
        private driveService: DriveService) { }

    ngOnInit() {
        this.cargarArreglos();
    }

    verificarArreglos() {
        return this.grado.length || this.posgrado.length || this.certificado.length;
    }

    cargarArreglos() {
        if (this.profesional.documentos) {
            this.grado = [];
            this.posgrado = [];
            this.certificado = [];
            this.comprobante = [];

            for (let index = 0; index < this.profesional.documentos.length; index++) {
                const doc = {
                    nombreDocumento: '',
                    fecha: this.profesional.documentos[index].fecha,
                    tipo: this.profesional.documentos[index].tipo,
                    fileId: this.profesional.documentos[index].archivo.id
                };
                if (this.profesional.documentos[index].tipo === 'Título de grado') {
                    this._profesionalService.getDocumentos(this.profesional.documentos[index].archivo.id).subscribe(data => {
                        doc.nombreDocumento = data.originalname;
                    });
                    this.grado.push(doc);

                } else {
                    if (this.profesional.documentos[index].tipo === 'Título de posgrado') {
                        this._profesionalService.getDocumentos(this.profesional.documentos[index].archivo.id).subscribe(data => {
                            doc.nombreDocumento = data.originalname;
                        });
                        this.posgrado.push(doc);
                    } else {
                        if (this.profesional.documentos[index].tipo === 'Comprobante de pago') {
                            this._profesionalService.getDocumentos(this.profesional.documentos[index].archivo.id).subscribe(data => {
                                doc.nombreDocumento = data.originalname;
                            });
                            this.comprobante.push(doc);
                        } else {
                            this._profesionalService.getDocumentos(this.profesional.documentos[index].archivo.id).subscribe(data => {
                                doc.nombreDocumento = data.originalname;
                            });
                            this.certificado.push(doc);
                        }
                    }
                }
            }
        }
    }

    agregarDocumento() {
        this.addDocumento = true;
    }

    cerrar() {
        this.addDocumento = false;
        this.tipoDocumento = null;
    }

    onUpload($event) {
        const { status, body } = $event;
        if (status === 200) {
            const archivos = {
                id: body.id,
                extension: body.ext
            };
            const doc = {
                fecha: new Date(),
                tipo: this.tipoDocumento,
                archivo: archivos
            };
            const cambio = {
                'op': 'updateDocumentos',
                'data': doc
            };
            this._profesionalService.patchProfesional(this.profesional.id, cambio).subscribe((data) => {
                this.profesional = data;
                this.plex.toast('success', 'Se adjuntó correctamente', 'Información', 1000);
                this.cargarArreglos();
                this.cerrar();
            });
        }
    }

    descargar(fileId) {
        const token = window.sessionStorage.getItem('jwt');
        window.open(`${environment.API}/drive/${fileId}?token=${token}`);
    }

    eliminarDocumento(documento, i) {
        this.plex.confirm('¿Desea eliminar el documento?').then((resultado) => {
            if (resultado) {
                if (documento.tipo === 'Título de grado') {
                    this.grado.splice(i, 1);
                } else {
                    if (documento.tipo === 'Título de posgrado') {
                        this.posgrado.splice(i, 1);
                    } else {
                        this.certificado.splice(i, 1);
                    }
                }

                for (let index = 0; index < this.profesional.documentos.length; index++) {
                    if (this.profesional.documentos[index].archivo.id === documento.fileId) {
                        this.indice = index;
                        break;
                    }
                }

                this._profesionalService.deleteDocumentos(this.profesional.id, documento.fileId).subscribe((data) => {
                    this.driveService.deleteFile(documento.fileId).subscribe();
                    this.profesional.documentos = data;
                    this.plex.toast('success', 'El documento se ha eliminado correctamente', 'Información', 1000);
                });
            }
        });
    }
}

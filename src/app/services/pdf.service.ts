import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server, saveAs } from '@andes/shared';

@Injectable()
export class PdfService {
    private pdfURL = '/modules/descargas';

    constructor(private server: Server) { }

    download(url, data): Observable<any> {
        return this.server.post(this.pdfURL + '/' + url, data, { responseType: 'blob' } as any);
    }

    descargarCertificadoEtica(params, nombreArchivo: string): Observable<any> {
        return this.download('certificadoEtica', params).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }

    listadoTurnos(params, nombreArchivo: string): Observable<any> {
        return this.download('listadoTurnos', params).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }
}

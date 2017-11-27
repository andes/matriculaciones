// Angular
import {
    Component,
    EventEmitter,
    Input,
    Output,
    OnChanges,
    OnInit } from '@angular/core';

// Plex
import {
    Plex
} from '@andes/plex';

// FileUploader
import {
    FileUploader
} from 'ng2-file-upload';

// Interfaces
import {
    IProfesional
} from './../../../interfaces/IProfesional';

// AppSettings
import {
    AppSettings
} from './../../../app.settings';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
@Component({
    selector: 'app-firmas-profesional',
    templateUrl: 'firmas-profesional.html'
})
export class FirmasProfesionalComponent implements OnInit {
    uploader: FileUploader = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/firma'});
    @Input() profesional: IProfesional;
    @Output() onFileUploaded = new EventEmitter();
    public binaryString = null;
    public firmas = null;
    public urlFirma = null;
    private base64textString: String= '';

    constructor(public sanitizer: DomSanitizer, private plex: Plex) {
    }


    handleFileSelect(evt) {
        const files = evt.target.files;
        const file = files[0];
      if (files && file) {
          const reader = new FileReader();
          reader.onload = this._handleReaderLoaded.bind(this);
          reader.readAsBinaryString(file);
      }
    }
    _handleReaderLoaded(readerEvt) {
        this.binaryString = readerEvt.target.result;
        this.base64textString = btoa(this.binaryString);
      }
    ngOnInit() {
        this.urlFirma = environment.API + '/core/tm/profesionales/firma/' + this.profesional.id;
        // this.firmas = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.profesional.firmas[4].imgArchivo);
    }


    upload() {
        this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
        this.onFileUploaded.emit(this.base64textString);
        this.urlFirma = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.base64textString);
    }

}

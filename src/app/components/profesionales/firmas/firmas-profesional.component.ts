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
import { ProfesionalService } from '../../../services/profesional.service';
@Component({
    selector: 'app-firmas-profesional',
    templateUrl: 'firmas-profesional.html'
})
export class FirmasProfesionalComponent implements OnInit {
    @Input() profesional: IProfesional;
    @Output() onFileUploaded = new EventEmitter();
    @Output() tieneFirma = new EventEmitter();
    public binaryString = null;
    public firmas = null;
    public urlFirma = null;
    private base64textString: String= '';

    constructor(public sanitizer: DomSanitizer, private plex: Plex, private _profesionalService: ProfesionalService) {
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
        this.urlFirma = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.base64textString);
      }
    ngOnInit() {
        this._profesionalService.getProfesionalFirma({id: this.profesional.id}).subscribe(resp => {
            this.urlFirma = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
                    });
    }

    upload() {
        this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
        this.onFileUploaded.emit(this.base64textString);
        this.tieneFirma.emit(true);
        this.urlFirma = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.base64textString);
    }

}

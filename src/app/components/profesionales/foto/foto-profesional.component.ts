// Angular
import {
    Component,
    EventEmitter,
    Input,
    Output,
    OnChanges,
    OnInit } from '@angular/core';
    import { DomSanitizer } from '@angular/platform-browser';
    import { environment } from '../../../../environments/environment';
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

@Component({
    selector: 'app-foto-profesional',
    templateUrl: 'foto-profesional.html'
})
export class FotoProfesionalComponent implements OnInit {
    uploader: FileUploader = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/foto'});
    @Input() profesional: IProfesional;
    @Output() onFileUploaded = new EventEmitter();
    @Output() onFileUploaded2 = new EventEmitter();
    public binaryString = null;
    public foto = null;
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
        this.foto = environment.API + '/core/tm/profesionales/foto/' + this.profesional.id;
    }


    upload() {
        this.uploader.uploadAll();
        this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
        this.onFileUploaded.emit(this.base64textString);
        this.onFileUploaded2.emit(this.base64textString);
        this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.base64textString);
    }


}

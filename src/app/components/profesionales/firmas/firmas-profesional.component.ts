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

@Component({
    selector: 'app-firmas-profesional',
    templateUrl: 'firmas-profesional.html'
})
export class FirmasProfesionalComponent implements OnInit, OnChanges {
    uploader: FileUploader = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/firma'});
    @Input() profesional: IProfesional;
    @Output() onFileUploaded = new EventEmitter();

    ngOnInit() {
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            if (response) {
                const oResp = JSON.parse(response);
                this.onFileUploaded.emit(oResp);
            } else {
                console.error('Error subiendo foto');
            }
        };
    }

    ngOnChanges() {
         if (this.profesional) {
            this.uploader = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/firma/' + this.profesional._id});
        }
    }

    upload() {
        this.uploader.uploadAll();
    }

}

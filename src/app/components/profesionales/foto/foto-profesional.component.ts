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
    selector: 'app-foto-profesional',
    templateUrl: 'foto-profesional.html'
})
export class FotoProfesionalComponent implements OnInit, OnChanges {
    uploader: FileUploader = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/foto'});
    @Input() profesional: IProfesional;
    @Output() onFileUploaded = new EventEmitter();

    ngOnInit() {
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            if (response) {
                const oResp = JSON.parse(response);
                this.onFileUploaded.emit(oResp.fileName);
            } else {
                console.error('Error subiendo foto');
            }
        };
    }

    ngOnChanges() {
         if (this.profesional) {
            this.uploader = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/foto/' + this.profesional._id});
        }
    }

    upload() {
        this.uploader.uploadAll();
    }

}

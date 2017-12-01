// Angular
import {
    Component,
    EventEmitter,
    Input,
    Output,
    OnChanges,
    OnInit } from '@angular/core';
    import { DomSanitizer } from '@angular/platform-browser';
    import { environment } from '../../../environments/environment';
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
} from './../../interfaces/IProfesional';

// AppSettings
import {
    AppSettings
} from './../../app.settings';
import { ProfesionalService } from '../../services/profesional.service';

@Component({
    selector: 'app-foto-general',
    templateUrl: 'foto-general.html'
})
export class FotoGeneralComponent implements OnInit, OnChanges {
    uploader: FileUploader = new FileUploader({url: AppSettings.API_ENDPOINT + '/core/tm/profesionales/foto'});
    @Input() profesional: IProfesional;
    @Input() img64 = null;
    public foto = null;
    public url = '/core/tm/profesionales/foto/';

    constructor(public sanitizer: DomSanitizer, private plex: Plex,
        private _profesionalService: ProfesionalService) {
    }

    ngOnInit() {
       this._profesionalService.getProfesionalFoto({id: this.profesional.id}).subscribe(resp => {
        this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
                });

    }

    ngOnChanges () {
        if (this.profesional.id) {
        this._profesionalService.getProfesionalFoto({id: this.profesional.id}).subscribe(resp => {
         console.log(resp);
         this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + resp);
         if (this.img64 !== undefined &&  this.img64 !== null) {
            this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + this.img64);
            }
                 });
        }




   }

}

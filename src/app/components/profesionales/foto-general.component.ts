// Angular
import {
    Component,
    EventEmitter,
    Input,
    Output,
    OnChanges,
    OnInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
// Plex
import {
    Plex
} from '@andes/plex';


// Interfaces
import {
    IProfesional
} from './../../interfaces/IProfesional';


import { ProfesionalService } from '../../services/profesional.service';

@Component({
    selector: 'app-foto-general',
    templateUrl: 'foto-general.html',
    styles: ['.img-circle {  border-radius: 50%;  width: 128px !important;height: 128px !important;}']

})
export class FotoGeneralComponent implements OnInit, OnChanges {
    @Input() profesional: IProfesional;
    @Input() img64 = null;
    @Input() idProfesional;
    public foto: any ;
    public tieneFoto = false;
    constructor(public sanitizer: DomSanitizer, private plex: Plex,
        private _profesionalService: ProfesionalService) {
    }

    ngOnInit() {
        this._profesionalService.getProfesionalFoto({ id: this.profesional.id }).subscribe(resp => {
            this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
            this.tieneFoto = true;
        });

    }

    // ngOnChanges() {
    //     if (this.img64 !== undefined && this.img64 !== null) {
    //         this._profesionalService.getProfesionalFoto({ id: this.profesional.id }).subscribe(resp => {
    //             this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + resp);
    //             if (this.img64 !== undefined && this.img64 !== null) {
    //                 this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + this.img64);
    //             }
    //         });

    //     }




    // }
    ngOnChanges () {
        if (this.img64) {
            this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + this.img64);
        } else if (this.idProfesional) {
        this._profesionalService.getProfesionalFoto({id: this.profesional.id}).subscribe(resp => {
         this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + resp);
        });
        }

        // if (this.profesional.id) {
        //     console.log('llegue');
        // this._profesionalService.getProfesionalFoto({id: this.profesional.id}).subscribe(resp => {
        //     console.log('respuesta base64');
        //  this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + resp);
        //  if (this.img64 !== undefined &&  this.img64 !== null) {
        //     this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + this.img64);
        //     }
        // });
        }



    mostrarFoto(foto) {
    }

}

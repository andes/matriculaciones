import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';
import { ProfesionService } from './../../services/profesion.service';
import { SIISAService } from '../../services/siisa.service';
import { UsuarioService } from '../../services/usuario.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfesionalService } from '../../services/profesional.service';
import { Auth } from '@andes/auth';
import { Ng2ImgMaxService } from 'ng2-img-max';

@Component({
    selector: 'app-supervisores',
    templateUrl: 'listado-supervisores.html'
})
export class SupervisoresComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    public esSupervisor = false;
    public users;
    public userSeleccionado;
    public binaryString = null;
    public firmas = null;
    public indexOrganizacion;
    public urlFirma = null;
    public base64textString: String = '';
    public binaryStringAdmin = null;
    public urlFirmaAdmin = null;
    public base64textStringAdmin: String = '';
    public nombreAdministrativo = '';
    public firmaAdmin = null;
    public textoLibre;
    public loading;
    constructor(
        private _profesionalService: ProfesionalService,
        private usuarioService: UsuarioService,
        public sanitizer: DomSanitizer,
        public auth: Auth,
        private plex: Plex,
        private ng2ImgMax: Ng2ImgMaxService
    ) {


    }

    ngOnInit() {
    }

    /**
 * Busca usuario cada vez que el campo de busca cambia su valor
 */
    public loadUsuarios() {
        this.usuarioService.get().subscribe(
            datos => {
                this.users = datos;

            }
        );
    }

    selectUser(user) {
        this.userSeleccionado = user;
        this.indexOrganizacion = this.userSeleccionado.organizaciones.findIndex(d => d._id === this.auth.organizacion._id);
        // tslint:disable-next-line:max-line-length
        if (this.indexOrganizacion === -1) {
            this.plex.alert('Este usuario no esta en la organizacion');
            this.userSeleccionado = null;
        } else {


            // tslint:disable-next-line:max-line-length
            const permisoSupervisor = this.userSeleccionado.organizaciones[this.indexOrganizacion].permisos.find(x => x === 'matriculaciones:supervisor:aprobar');
            // const p = organizaciones.permisos.find(x => x === 'matriculaciones:supervisor:aprobar');
            if (permisoSupervisor) {
                this.esSupervisor = true;
            } else {
                this.esSupervisor = false;
            }
            this._profesionalService.getProfesionalFirma({ firmaAdmin: this.userSeleccionado._id }).subscribe(resp => {
                this.urlFirmaAdmin = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp.firma);
                this.firmaAdmin = resp.firma;
                // this.nombreAdministrativo = resp.administracion;
            });
        }
    }


    handleFileSelectFirmaAdmin(evt) {
        const files = evt.target.files;
        const file = files[0];
        if (files && file) {
            const reader = new FileReader();
            reader.onload = this._handleReaderLoadedFirmaAdmin.bind(this);
            reader.readAsBinaryString(file);
        }
    }
    _handleReaderLoadedFirmaAdmin(readerEvt) {
        this.binaryStringAdmin = readerEvt.target.result;
        this.base64textStringAdmin = btoa(this.binaryStringAdmin);
        this.urlFirmaAdmin = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.base64textStringAdmin);
        this.firmaAdmin = true;
    }


    guardarFirmaAdminGrid(oFirma) {
        const firmaADmin = {
            'firma': this.base64textStringAdmin,
            'nombreCompleto': 'asda',
            'idSupervisor': this.userSeleccionado._id
        };
        this._profesionalService.saveProfesional({ firmaAdmin: firmaADmin }).subscribe(resp => {
            this.plex.toast('success', 'Se guardo con exito!', 'informacion', 1000);
        });
    }

    modificarPermiso() {
        if (this.esSupervisor) {
            this.userSeleccionado.organizaciones[this.indexOrganizacion].permisos.push('matriculaciones:supervisor:aprobar');
        } else {
            // tslint:disable-next-line:max-line-length
            const index = this.userSeleccionado.organizaciones[this.indexOrganizacion].permisos.findIndex(d => d === 'matriculaciones:supervisor:aprobar'); // find index in your array
            this.userSeleccionado.organizaciones[this.indexOrganizacion].permisos.splice(index, 1);

        }
        this.usuarioService.save(this.userSeleccionado).subscribe(data => {
        });
    }




    // upload() {
    //     this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
    //     this.onFileUploaded.emit(this.base64textString);
    //     this.tieneFirma.emit(true);
    //     this.urlFirma = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.base64textString);

    // }

    // uploadFirmaAdmin() {
    //     let firmaAdministracion = this.base64textStringAdmin;
    //     if (this.base64textStringAdmin === '') {
    //         firmaAdministracion = this.firmaAdmin;

    //     }

    //     const administracion = {
    //         firma: firmaAdministracion,
    //         nombreCompleto : this.nombreAdministrativo
    //     };
    //      this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
    //      this.onFileUploadedFirmaAdmin.emit(administracion);
    //     this.tieneFirmaAdmin.emit(true);
    //     this.urlFirmaAdmin = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + firmaAdministracion);
    // }


    onImageChange(event) {
        const image = event.target.files[0];
        if (image) {
            this.loading = true;
        }

        this.ng2ImgMax.resizeImage(image, 400, 300).subscribe(
            result => {
                this.loading = false;
                const reader = new FileReader();
                reader.onload = this._handleReaderLoadedFirmaAdmin.bind(this);
                reader.readAsBinaryString(result);
            },
            error => {
            }
        );
    }


}

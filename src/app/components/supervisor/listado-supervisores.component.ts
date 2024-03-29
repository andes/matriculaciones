import { Component, HostBinding, OnDestroy } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfesionalService } from '../../services/profesional.service';
import { Auth } from '@andes/auth';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { Plex } from '@andes/plex';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-supervisores',
    templateUrl: 'listado-supervisores.html'
})
export class SupervisoresComponent implements OnDestroy {
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
    public showSidebar = false;
    private searchSubscribe: ISubscription;
    public disabledCargar = false;
    public columns = [
        {
            key: 'apellido',
            label: 'Apellido'
        },
        {
            key: 'nombre',
            label: 'Nombre'
        },
        {
            key: 'documento',
            label: 'Documento'
        },
    ];

    constructor(
        private _profesionalService: ProfesionalService,
        private usuarioService: UsuarioService,
        public sanitizer: DomSanitizer,
        public auth: Auth,
        private plex: Plex,
        private ng2ImgMax: Ng2ImgMaxService
    ) { }

    ngOnDestroy() {
        if (this.searchSubscribe) {
            this.searchSubscribe.unsubscribe();
        }
    }

    /**
* Busca usuario cada vez que el campo de busca cambia su valor
*/
    public loadUsuarios() {
        if (this.textoLibre && this.textoLibre.length) {
            const searchTerm = (this.textoLibre && this.textoLibre.length) ? this.textoLibre.trim() : '';

            if (this.searchSubscribe) {
                this.searchSubscribe.unsubscribe();
            }
            this.searchSubscribe = this.usuarioService.find({
                search: '^' + searchTerm,
                organizacion: this.auth.organizacion.id,
                fields: '-password -permisosGlobales -disclaimers',
                limit: 50
            })
                .subscribe(datos => this.users = datos);
        } else {
            this.users = null;
        }
    }

    selectUser(user) {
        this.showSidebar = true;
        this.userSeleccionado = user;
        this.indexOrganizacion = this.userSeleccionado.organizaciones.findIndex(d => d.id === this.auth.organizacion.id);
        if (this.indexOrganizacion === -1) {
            this.plex.info('info', 'Este usuario no esta en la organizacion');
            this.userSeleccionado = null;
        } else {
            const permisoSupervisor = this.userSeleccionado.organizaciones[this.indexOrganizacion].permisos.find(x => x === 'matriculaciones:supervisor:aprobar' || x === 'matriculaciones:*');
            if (permisoSupervisor) {
                this.esSupervisor = true;
            } else {
                this.esSupervisor = false;
            }
            this._profesionalService.getProfesionalFirma({ firmaAdmin: this.userSeleccionado.id }).pipe(catchError(() => of(null))).subscribe(resp => {
                if (resp && resp.firma) {
                    this.urlFirmaAdmin = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp.firma);
                    this.firmaAdmin = resp.firma;
                } else {
                    this.urlFirmaAdmin = null;
                    this.firmaAdmin = null;
                }
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

    guardarFirmaAdminGrid() {
        const firmaADmin = {
            'firma': this.base64textStringAdmin,
            'nombreCompleto': 'asda',
            'idSupervisor': this.userSeleccionado.id
        };
        this._profesionalService.saveProfesional({ firmaAdmin: firmaADmin }).subscribe(resp => {
            this.plex.toast('success', 'Se guardo con exito!', 'informacion', 1000);
            this.base64textStringAdmin = '';
        });
    }

    modificarPermiso() {
        const permisosUss = this.userSeleccionado.organizaciones[this.indexOrganizacion].permisos;

        if (this.esSupervisor) {
            permisosUss.push('matriculaciones:supervisor:aprobar');
        } else {
            const index = permisosUss.findIndex(d => d === 'matriculaciones:supervisor:aprobar');
            permisosUss.splice(index, 1);
        }
        const body = {
            permisos: permisosUss,
        };
        this.usuarioService.updateOrganizacion(this.userSeleccionado.usuario, this.auth.organizacion.id, body).subscribe(() => {
            this.plex.toast('success', 'Permisos grabados exitosamente!');
        });
    }

    onImageChange(event) {
        this.disabledCargar = true;
        const image = event.target.files[0];
        if (image) {
            this.loading = true;
            this.ng2ImgMax.resizeImage(image, 400, 300).subscribe(
                result => {
                    this.loading = false;
                    const reader = new FileReader();
                    reader.onload = this._handleReaderLoadedFirmaAdmin.bind(this);
                    reader.readAsBinaryString(result);
                    this.disabledCargar = false;
                },
                error => {
                    this.disabledCargar = false;
                    this.plex.toast('danger', 'Ha ocurrido un error realizando la operación.');
                }
            );
        } else {
            this.urlFirmaAdmin = this.urlFirmaAdmin || '';
            this.disabledCargar = false;
        }
    }

    cerrar() {
        this.showSidebar = false;
    }

}

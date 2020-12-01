// Angular
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  OnInit
} from '@angular/core';

// Plex
import {
  Plex
} from '@andes/plex';

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
import { Ng2ImgMaxService } from 'ng2-img-max';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
@Component({
  selector: 'app-firmas-profesional',
  templateUrl: 'firmas-profesional.html'
})
export class FirmasProfesionalComponent implements OnInit {
  @Input() profesional: IProfesional;
  @Output() onFileUploaded = new EventEmitter();
  @Output() onFileUploadedFirmaAdmin = new EventEmitter();
  @Output() tieneFirma = new EventEmitter();
  @Output() tieneFirmaAdmin = new EventEmitter();
  public binaryString = null;
  public firmas = null;
  public urlFirma = null;
  public base64textString: String = '';
  public binaryStringAdmin = null;
  public urlFirmaAdmin = null;
  public base64textStringAdmin: String = '';
  public nombreAdministrativo = '';
  public firmaAdmin = null;
  loading;

  constructor(private ng2ImgMax: Ng2ImgMaxService, public sanitizer: DomSanitizer, private plex: Plex, private _profesionalService: ProfesionalService) {
  }

  ngOnInit() {
    this._profesionalService.getProfesionalFirma({ id: this.profesional.id }).pipe(catchError(() => of(null))).subscribe(resp => {
      this.urlFirma = resp ? this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp) : null;
    });
    this._profesionalService.getProfesionalFirma({ firmaAdmin: this.profesional.id }).pipe(catchError(() => of(null))).subscribe(resp => {
      if (resp && resp.firma) {
        this.urlFirmaAdmin = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp.firma);
        this.firmaAdmin = resp.firma;
        this.nombreAdministrativo = resp.administracion;
      } else {
        this.urlFirmaAdmin = null;
        this.firmaAdmin = null;
        this.nombreAdministrativo = '';
      }
    });
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


  upload() {
    this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
    this.onFileUploaded.emit(this.base64textString);
    this.tieneFirma.emit(true);
    this.urlFirma = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.base64textString);

  }

  uploadFirmaAdmin() {
    let firmaAdministracion = this.base64textStringAdmin;
    if (this.base64textStringAdmin === '') {
      firmaAdministracion = this.firmaAdmin;

    }

    const administracion = {
      firma: firmaAdministracion,
      nombreCompleto: this.nombreAdministrativo
    };
    this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
    this.onFileUploadedFirmaAdmin.emit(administracion);
    this.tieneFirmaAdmin.emit(true);
    this.urlFirmaAdmin = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + firmaAdministracion);
  }

  onImageChange(event) {
    const image = event.target.files[0];
    if (image) {
      this.loading = true;
    }

    this.ng2ImgMax.resizeImage(image, 400, 300).subscribe(
      result => {
        this.loading = false;
        const reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(result);
      },
      error => {
      }
    );
  }

}

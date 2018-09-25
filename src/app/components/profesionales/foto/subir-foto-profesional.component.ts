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
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Ng2ImgMaxService } from 'ng2-img-max';

@Component({
    selector: 'app-foto-profesional',
    templateUrl: 'subir-foto-profesional.html'
})
export class SubirFotoProfesionalComponent implements OnInit {
    @Input() profesional: IProfesional;
    @Output() onFileUploaded = new EventEmitter();
    @Output() previewImg = new EventEmitter();
    public binaryString = null;
    public base64textString: String = '';
    public showWebcam = true;
    public loading;
    public allowCameraSwitch = true;
    public multipleWebcamsAvailable = false;
    public deviceId: string;
    public subirFoto = false;
    public sacarFoto = false;
    public videoOptions: MediaTrackConstraints = {
        // width: {ideal: 1024},
        // height: {ideal: 576}
    };
    public errors: WebcamInitError[] = [];

    // latest snapshot
    public webcamImage: WebcamImage = null;
    public fotoPreview: any;
    // webcam snapshot trigger
    private trigger: Subject<void> = new Subject<void>();
    // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
    private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

    constructor(public sanitizer: DomSanitizer, private plex: Plex, private ng2ImgMax: Ng2ImgMaxService) {
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
        this.previewImg.emit(this.base64textString);
    }

    ngOnInit() {
    }


    upload() {
        this.plex.toast('success', 'Realizado con exito', 'informacion', 1000);
        this.onFileUploaded.emit(this.base64textString);
    }


    public triggerSnapshot(): void {
        this.trigger.next();
    }

    public toggleWebcam(): void {
        this.showWebcam = !this.showWebcam;
    }

    public handleInitError(error: WebcamInitError): void {
        this.errors.push(error);
    }

    public showNextWebcam(directionOrDeviceId: boolean | string): void {
        // true => move forward through devices
        // false => move backwards through devices
        // string => move to device with given deviceId
        this.nextWebcam.next(directionOrDeviceId);
    }

    public handleImage(webcamImage: WebcamImage): void {
        this.webcamImage = webcamImage;
        const foto: any = webcamImage;
        this.fotoPreview = this.sanitizer.bypassSecurityTrustResourceUrl(foto.imageAsDataUrl);
        const img = this.webcamImage.imageAsDataUrl.substr(23, this.webcamImage.imageAsDataUrl.length);
        this.base64textString = img;
        this.sacarFoto = false;
    }

    public cameraWasSwitched(deviceId: string): void {
        this.deviceId = deviceId;
    }

    public get triggerObservable(): Observable<void> {
        return this.trigger.asObservable();

    }

    public get nextWebcamObservable(): Observable<boolean | string> {
        return this.nextWebcam.asObservable();
    }


    volverASacar() {
        this.sacarFoto = true;
        this.fotoPreview = null;
    }

    onImageChange(event) {
        const image = event.target.files[0];
        if (image){
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

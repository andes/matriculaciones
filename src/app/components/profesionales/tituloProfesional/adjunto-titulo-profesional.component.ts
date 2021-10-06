import { Component, Input } from '@angular/core';
import { Plex } from '@andes/plex';

// Services
import { ProfesionalService } from '../../../services/profesional.service';
import { environment } from '../../../../environments/environment';
import { Auth } from '@andes/auth';

@Component({
  selector: 'adjunto-titulo-profesional',
  templateUrl: 'adjunto-titulo-profesional.html'
})

export class TituloProfesionalComponent {

  @Input() profesionalId;
  @Input() formacionSelected;
  @Input() isPosgrado = false;

  constructor(
    private _profesionalService: ProfesionalService,
    public auth: Auth,
    private plex: Plex) { }

  onUpload($event) {
    if ($event.status = 200) {
      const fileId = $event.body.id;
      const metadata = {
        profesionalId: this.profesionalId,
        formacionGradoCodigo: this.formacionSelected.profesion.codigo,
        fileId
      };

      const subcription = this.isPosgrado ? this._profesionalService.saveProfesionalTituloPosgrado(metadata) : this._profesionalService.saveProfesionalTituloGrado(metadata);
      subcription.subscribe((data) => {
        this.formacionSelected.tituloFileId = fileId;
        this.plex.toast('success', 'Se adjuntó correctamente', 'Información', 1000);
      });
    }
  }

  descargar(fileId) {
    const token = window.sessionStorage.getItem('jwt');
    window.open(`${environment.API}/drive/${fileId}?token=${token}`);
  }
}

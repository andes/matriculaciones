import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { ConfiguracionAgendaComponent } from './configuracion-agenda.component';

@Component({
    selector: 'app-agenda',
    templateUrl: 'agenda.html'
})
export class AgendaComponent { }

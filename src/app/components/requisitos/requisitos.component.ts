import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-requisitos-generales',
    templateUrl: 'requisitosGenerales.html'
})

export class RequisitosGeneralesComponent {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
}

@Component({
    selector: 'app-requisitos-matricula-universitaria',
    templateUrl: 'requisitosMatUniv.html'
})

export class RequisitosMatriculaUniversitariaComponent {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    public terminosLeidos = false;

    constructor(private router: Router) {}

     onClick() {
        this.router.navigate(['/solicitarTurnoMatriculacion']);
    }
}

@Component({
    selector: 'app-requisitos-matricula-tecnica-auxiliar',
    templateUrl: 'requisitosMatTecAux.html'
})

export class RequisitosMatriculaTecnicaAuxiliarComponent {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    public terminosLeidos = false;
    constructor(private router: Router) {}

    onClick() {
        this.router.navigate(['/solicitarTurnoMatriculacion']);
    }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-requisitos-generales',
    templateUrl: 'requisitosGenerales.html'
})

export class RequisitosGeneralesComponent {}

@Component({
    selector: 'app-requisitos-matricula-universitaria',
    templateUrl: 'requisitosMatUniv.html'
})

export class RequisitosMatriculaUniversitariaComponent {
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
    public terminosLeidos = false;
    constructor(private router: Router) {}

    onClick() {
        this.router.navigate(['/solicitarTurnoMatriculacion']);
    }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'requisitosGenerales',
    templateUrl: 'requisitosGenerales.html'
})

export class RequisitosGeneralesComponent {}

@Component({
    selector: 'requisitosMatriculaUniversitaria',
    templateUrl: 'requisitosMatUniv.html'
})

export class RequisitosMatriculaUniversitariaComponent {
    public terminosLeidos: boolean = false;

    constructor(private router: Router) {}

     onClick(){
        this.router.navigate(['/solicitarTurnoMatriculacion']);
    }
}

@Component({
    selector: 'requisitosMatriculaTecnicaAuxiliar',
    templateUrl: 'requisitosMatTecAux.html'
})

export class RequisitosMatriculaTecnicaAuxiliarComponent {
    public terminosLeidos: boolean = false;
     
    constructor(private router: Router) {}

    onClick(){
        this.router.navigate(['/solicitarTurnoMatriculacion']);
    }
}
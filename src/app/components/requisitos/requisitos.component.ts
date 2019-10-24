import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropdownItem } from '@andes/plex';

@Component({
    selector: 'app-requisitos-generales',
    templateUrl: 'requisitosGenerales.html'
})

export class RequisitosGeneralesComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public items: DropdownItem[];

    ngOnInit() {
        this.items = [
            { label: 'MATRÍCULA UNIVERSITARIA', route: '/requisitosMatriculaUniversitaria' },
            { label: 'MATRÍCULA TÉCNICA O AUXILIAR', route: '/requisitosMatriculaTecnicaAuxiliar' }
        ];
    }
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

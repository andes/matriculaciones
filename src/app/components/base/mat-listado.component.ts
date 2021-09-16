import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
// import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';
import { ProfesionService } from './../../services/profesion.service';

@Component({
    selector: 'app-mat-listado',
    template: `
    <div class="table-responsive">
    <table class="table">
    <ng-content></ng-content>
    </table>
        <div>
            <span style="font-weight: bold;">
                Mostrando página {{ currentPage }} de {{ lastPage }}
            </span>
        </div>
        <div style="text-align: center">
            <ul class="pagination">
                <li [ngClass]="{'disabled': currentPage === 1}">
                    <a (click)="setPagina(1)">
                        <i class="mdi mdi-chevron-double-left"></i>
                    </a>
                </li>
                <li [ngClass]="{'disabled': currentPage === 1}">
                    <a (click)="setPagina(currentPage - 1)">
                        <i class="mdi mdi-chevron-left"></i>
                    </a>
                </li>
                <li [ngClass]="{'disabled': currentPage === lastPage}">
                    <a (click)="setPagina(currentPage +1)">
                        <i class="mdi mdi-chevron-right"></i>
                    </a>
                </li>
                <li [ngClass]="{'disabled': currentPage === lastPage}">
                    <a (click)="setPagina(lastPage)">
                        <i class="mdi mdi-chevron-double-right"></i>
                    </a>
                </li>
            </ul>
        </div>
    </div>`
})
export class ListadoComponent implements OnInit {
    currentPage = 1;
    pageSize: number;
    selectedItem: any;
    showListado: Boolean = true;
    lastPage: number;
    @Input() data: any[];
    @Output() updateData = new EventEmitter();
    @Output() clearSelected = new EventEmitter();

    constructor(private _numeracionesService: NumeracionMatriculasService,
                private _profesionService: ProfesionService,
                private _formBuilder: FormBuilder,
                private _router: Router) {

        this.pageSize = 10;
        this.data = [];
    }

    ngOnInit() {
        this.updateListado();
    }

    setPagina(page: number) {
        if (page < 1 || page > this.lastPage) {
            return;
        }

        this.currentPage = page;
        this.updateListado();
    }

    showInfo(selected: any) {
        this.selectedItem = selected;
    }

    updateListado(resetPaging = false) {
        if (resetPaging) {
            this.currentPage = 1;
        }

        const query = {
            offset: this.pageSize * (this.currentPage - 1),
            size: this.pageSize
        };

        this.updateData.emit({
            query: query,
            callback: (resp) => {
                this.lastPage = (resp.totalPages !== 0 ? resp.totalPages : 1);
            }
        });
    }
}

import { Component, OnInit, Output, Input, EventEmitter, HostListener } from '@angular/core';
import { Plex } from '@andes/plex/src/lib/core/service';
import * as Enums from './../../utils/enumerados';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { NumeracionMatriculasService } from './../../services/numeracionMatriculas.service';
import { ProfesionService } from './../../services/profesion.service';

@Component({
    selector: 'app-mat-plex-scroll',
    template: `
        <div class="search-results"
            infinite-scroll
            [infiniteScrollDistance]="distance"
            [infiniteScrollThrottle]="throttle"
            (scrolled)="onScroll($event)"
            [scrollWindow]="false">
            <ng-content></ng-content>
        </div>
    `
})
export class ScrollComponent implements OnInit {
    currentPage: number;
    lastPage: number;
    pageSize: number;
    distance: number;
    throttle: number;
    selectedItem: any;
    showListado: Boolean = true;
    @Input() data: any[];
    @Output() updateData = new EventEmitter();
    @Output() clearSelected = new EventEmitter();

    constructor() {

        this.distance = 1;
        this.throttle = 50;
        this.pageSize = 100;
        this.data = [];
    }

    ngOnInit() {
        this.updateListado();
    }

    onScroll(event: any) {

        /* this.currentPage++;
        this.updateListado();*/
    }


    /*    setPagina(page: number) {
            if (page < 1 || page > this.lastPage) {
                return;
            }

            this.currentPage = page;
            this.updateListado();
        }
    */
    /* showInfo(selected: any) {
        this.selectedItem = selected;
    }
*/
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

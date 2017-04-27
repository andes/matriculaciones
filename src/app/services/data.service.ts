import { Injectable } from '@angular/core';
import { IProfesional } from './../interfaces/IProfesional';

@Injectable()
export class DataService  {
    currentProfesional: IProfesional;

    currentList: any[];
    selecedItem: any;

    constructor() {}

    saveList(items: any[], selected: any) {
        this.currentList = items;
        this.selecedItem = selected;
    }
}

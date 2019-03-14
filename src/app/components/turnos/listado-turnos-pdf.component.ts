import { Component, OnInit, Output, EventEmitter, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-listado-turnos-pdf',
  templateUrl: './listado-turnos-pdf.component.html',
  styleUrls: ['turnos.scss'],
  encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component

})
export class ListadoTurnosPdfComponent implements OnInit {
  // public arrayTurnos: any[] = [];
  @Input() arrayTurnos: any[];
  @Output() volverATurnos = new EventEmitter();

  constructor() { }

  ngOnInit() {
    console.log(this.arrayTurnos);
    setTimeout(() => {
      window.print();
      this.volverATurnos.emit();
    }, 0);
  }



}

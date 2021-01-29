import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio-turnos',
  templateUrl: './inicio-turnos.component.html'
})
export class InicioTurnosComponent implements OnInit {
  private fecha: Date;
  constructor() { }

  ngOnInit(): void {
    this.fecha = new Date();
  }

}

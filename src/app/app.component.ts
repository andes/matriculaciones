import { Component, OnInit } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { SidebarItem } from 'andes-plex/src/lib/app/sidebar-item.class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    constructor(public _plex: Plex) { }

    ngOnInit() {
        // Cargo el listado de componentes
        this.loadSideBar();
    }

    loadSideBar() {
        const items = [
            new SidebarItem('Inicio', 'creation', '/home'),
            new SidebarItem('Config. Agenda', 'calendar-multiple-check', '/agenda'),
            new SidebarItem('Turnos', 'calendar', '/listadoTurnos'),
        ];
        this._plex.initStaticItems(items);
    }

}

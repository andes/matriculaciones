import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { environment } from './../environments/environment';
// import { SidebarItem } from '@andes/plex/src/lib/app/sidebar-item.class';
// import { MenuItem } from '@andes/plex/src/lib/app/menu-item.class';
import { DropdownItem } from '@andes/plex';
import { Server } from '@andes/shared';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    constructor(public _plex: Plex, public _server: Server) {
        _server.setBaseURL(environment.API);
    }

    ngOnInit() {
        // Cargo el listado de componentes
        this.loadSideBar();
    }

    loadSideBar() {
        const menu: DropdownItem[] = [
            { label: 'Inicio', icon: 'home', route: 'home/'},
            { label: 'Turnos', icon: 'calendar', route: 'listadoTurnos/'},
            { label: 'Numeraciones', icon: 'book', route: 'listadoNumeraciones/'},
        ];

        this._plex.initView('Matriculaciones', menu); // .initStaticItems(menu);//.initView('Matriculaciones', menu);
    }

}

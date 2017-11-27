import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { environment } from './../environments/environment';
// import { SidebarItem } from '@andes/plex/src/lib/app/sidebar-item.class';
// import { MenuItem } from '@andes/plex/src/lib/app/menu-item.class';
import { DropdownItem } from '@andes/plex';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    constructor(public plex: Plex, public _server: Server, public auth: Auth) {
        _server.setBaseURL(environment.API);
         // Inicializa el menu
         this.checkPermissions();
    }

    private menuList = [];

    public checkPermissions(): any {
        const accessList = [];
        this.menuList = [];

        if (this.auth.loggedIn()) {
            this.auth.organizaciones().subscribe(data => {
                if (data.length > 1) {
                    this.menuList = [{ label: 'Seleccionar organización', icon: 'home', route: '/selectOrganizacion' }, ...this.menuList];
                    this.plex.updateMenu(this.menuList);
                }
            });
        }
        // Cargo el array de permisos
        if (this.auth.getPermissions('turnos:planificarAgenda:?').length > 0) {
            accessList.push({ label: 'CITAS: Gestor de Agendas y Turnos', icon: 'calendar', route: '/citas/gestor_agendas' });
        }
        if (this.auth.getPermissions('turnos:darTurnos:?').length > 0) {
            accessList.push({ label: 'CITAS: Punto de Inicio', icon: 'calendar', route: '/puntoInicioTurnos' });
        }
        if (this.auth.getPermissions('mpi:?').length > 0) {
            accessList.push({ label: 'MPI: Indice Maestro de Pacientes', icon: 'account-multiple-outline', route: '/mpi' });
        }

        if (this.auth.getPermissions('rup:?').length > 0) {
            accessList.push({ label: 'RUP: Registro Universal de Prestaciones', icon: 'contacts', route: '/rup' });
        }

        this.menuList.push({ label: 'Página principal', icon: 'home', route: '/home' });

        accessList.forEach((permiso) => {
            this.menuList.push(permiso);
        });
        this.menuList.push({ divider: true });
        this.menuList.push({ label: 'Cerrar Sesión', icon: 'logout', route: '/login' });

        // Actualizamos la lista de menú
        this.plex.updateMenu(this.menuList);
        return accessList;
    }

    ngOnInit() {
        // Cargo el listado de componentes
        this.loadSideBar();
    }

    loadSideBar() {
        const menu: DropdownItem[] = [
            { label: 'Inicio', icon: 'home', route: 'home/'},
            { label: 'Agenda', icon: 'calendar', route: 'agenda/'},
            { label: 'Requisitos generales', icon: 'calendar', route: 'requisitosGenerales/'},
            { label: 'Turnos', icon: 'book', route: 'turnos/'},
            { label: 'Listado profesionales', icon: 'book', route: 'listarProfesionales/'}
        ];

        this.plex.initView('Matriculaciones', menu); // .initStaticItems(menu);//.initView('Matriculaciones', menu);
    }

}

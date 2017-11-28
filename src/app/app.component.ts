import {
  environment
} from './../environments/environment';
import {
  Component,
  OnInit,
  ModuleWithProviders
} from '@angular/core';
import {
  Plex
} from '@andes/plex';
import {
  Server
} from '@andes/shared';
import {
  Auth
} from '@andes/auth';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private initStatusCheck() {
    if (environment.APIStatusCheck) {
      setTimeout(() => {
        this.server.get('/core/status', {
            params: null,
            showError: false,
            showLoader: false
          })
          .finally(() => this.initStatusCheck())
          .subscribe(
            (data) => this.plex.updateAppStatus(data),
            (err) => this.plex.updateAppStatus({
              API: 'Error'
            })
          );
      }, 2000);
    } else {
      this.plex.updateAppStatus({
        API: 'OK'
      });
    }
  }

  private menuList = [];

  public checkPermissions(): any {
    let accessList = [];
    this.menuList = [];
    if (this.auth.loggedIn()) {
          accessList.push({
            label: 'Configuración de agendas',
            icon: 'calendar',
            route: '/turnos'
          });
          accessList.push({
            label: 'Gestión de profesionales',
            icon: 'account-multiple-outline',
            route: '/listarProfesionales'
          });
          accessList.push({
            divider: true
          });
          accessList.push({
            label: 'Cerrar Sesión',
            icon: 'logout',
            route: '/home'
          });
          accessList.forEach((permiso) => {
            this.menuList.push(permiso);
          });
    } else {
      // Página pública
      this.menuList.push({
        label: 'Acceso fiscalización',
        icon: 'lock',
        route: '/home'
      });
    }

    // Actualizamos la lista de menú
    this.plex.updateMenu(this.menuList);
  }

  constructor(public plex: Plex, public server: Server, public auth: Auth) {

    server.setBaseURL(environment.API);

    // Inicializa el menu
    this.checkPermissions();

    // Inicializa la vista
    this.plex.updateTitle('ANDES | Matriculaciones');

    // Inicializa el chequeo de conectividad
    this.initStatusCheck();
  }


}

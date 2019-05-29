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
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private menuList = [];

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
      }, 100000);
    } else {
      this.plex.updateAppStatus({
        API: 'OK'
      });
    }
  }

  public checkPermissions(): any {
    const accessList = [];
    this.menuList = [];
    if (this.auth.loggedIn()) {
      this.auth.organizaciones().subscribe(data => {

        if (data.length > 1) {
          this.menuList = [{ label: 'Seleccionar organización', icon: 'home', route: '/selectOrganizacion' }, ...this.menuList];
          this.plex.updateMenu(this.menuList);
        }
        accessList.push({
          label: 'Home',
          icon: 'mdi mdi-home',
          route: '/homeAdministracion'
        });
        if (this.auth.getPermissions('matriculaciones:agenda:?').length > 0) {
          accessList.push({
            label: 'Agenda',
            icon: 'mdi mdi-pencil-box-outline',
            route: '/agenda'
          });
        }
        if (this.auth.getPermissions('matriculaciones:turnos:?').length > 0) {

          accessList.push({
            label: 'Turnos',
            icon: 'mdi mdi-calendar',
            route: '/turnos'
          });
        }
        if (this.auth.getPermissions('matriculaciones:profesionales:?').length > 0) {
          accessList.push({
            label: 'Profesionales',
            icon: 'mdi mdi-account-multiple',
            route: '/listarProfesionales'
          });
        }
        accessList.push({
          label: 'Supervisores',
          icon: 'mdi mdi-account-multiple',
          route: '/supervisores'
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
      });
    } else {
      // Página pública
      this.menuList.push({
        label: 'Acceso fiscalización',
        icon: 'lock',
        route: '/home'
      });

      // if (this.router.url !== '/home') {
      //   this.redirect('/homeProfesionales');
      // }
      // this.redirect('/homeProfesionales');
    }

    // Actualizamos la lista de menú
    this.plex.updateMenu(this.menuList);
  }

  constructor(public plex: Plex, public server: Server, public auth: Auth, private router: Router) {

    server.setBaseURL(environment.API);

    // Inicializa el menu
    this.checkPermissions();

    // Inicializa la vista
    this.plex.updateTitle('ANDES | Matriculaciones');

    // Inicializa el chequeo de conectividad
    this.initStatusCheck();
  }

  public showRibbon() {
    return environment.environmentName === 'local';
  }

  public ribbonLabel() {
    return environment.environmentName.toUpperCase();
  }

  public ribbonType() {
    switch (environment.environmentName) {
      case 'produccion':
        return 'info';
      case 'demo':
        return 'success';
      case 'testing':
        return 'warning';
      case 'local':
        return 'warning';

    }
  }

  redirect(pagina: string) {
    this.router.navigate(['./' + pagina]);
    return false;
  }
}

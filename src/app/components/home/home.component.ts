import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  Plex
} from '@andes/plex';
import {
  Observable
} from 'rxjs/Rx';
import {
  Auth
} from '@andes/auth';
import {
  AppComponent
} from '../../app.component';

@Component({
  templateUrl: 'home.html',
  styleUrls: ['home.scss'],
  encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class HomeComponent implements OnInit {
  public usuario: number;
  public password: string;
  public loading = false;
  public deshabilitar = false;
  public autoFocus = 1;

  constructor(private plex: Plex, private auth: Auth, private router: Router, public appComponent: AppComponent) {};


  ngOnInit() {
    if (this.auth.loggedIn) {
      this.auth.logout();
    }
    this.resync();
  }

  cancelar() {
    if (this.auth.loggedIn) {
      this.auth.logout();
    }
    this.resync();
    this.redirect('/homeProfesionales');
  }

  login(event) {
    if (event.formValid) {
      this.deshabilitar = true;
      this.loading = true;
      this.auth.login(this.usuario.toString(), this.password)
        .subscribe((data) => {
          this.plex.updateUserInfo({usuario: this.auth.usuario});
          this.router.navigate(['selectOrganizacion']);
          // this.resync();
          // this.router.navigate(['turnos']);

        }, (err) => {
          this.plex.alert('Usuario o contraseña incorrectos');
          this.loading = false;
          this.deshabilitar = false;
        });
    }
  }


  resync() {
    this.appComponent.checkPermissions();
  }

  redirect(pagina: string) {
    this.router.navigate(['./' + pagina]);
    return false;
  }

}

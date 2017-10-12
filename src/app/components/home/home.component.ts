import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import { Auth } from '@andes/auth';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: 'home.html',
    styleUrls: ['home.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class HomeComponent {
    public usuario: number;
    public password: string;
    public loading = false;
    public deshabilitar = false;
    public autoFocus = 1;

    constructor(private plex: Plex, private auth: Auth, private router: Router) {
    };

    login(event) {
        if (event.formValid) {
            this.deshabilitar = true;
            this.loading = true;
            this.auth.login(this.usuario.toString(), this.password)
                .subscribe((data) => {
                    debugger;
                    this.plex.updateUserInfo({usuario: this.auth.usuario});
                    this.router.navigate(['selectOrganizacion']);
                }, (err) => {
                    debugger;
                    this.plex.alert('Usuario o contraseña incorrectos');
                    this.loading = false;
                    this.deshabilitar = false;
                });
        }
    }

 
}

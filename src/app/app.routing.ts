import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';



// Global
import { RoutingGuard } from './app.routings-guard.class';

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { HomeProfesionalesComponent } from './components/home/homeProfesionales.component';
import { HomeAdministracionComponent } from './components/home/homeAdministracion.component';
import {
    RequisitosGeneralesComponent,
    RequisitosMatriculaUniversitariaComponent,
    RequisitosMatriculaTecnicaAuxiliarComponent
} from './components/requisitos/requisitos.component';
import { AgendaComponent } from './components/turnos/agenda.component';
import { SolicitarTurnoMatriculacionComponent } from './components/turnos/solicitar-turno-matriculacion.component';
import { ProfesionalComponent } from './components/profesionales/profesional.component';
import { ListadoTurnosComponent } from './components/turnos/listado-turnos.component';
import { TurnosComponent } from './components/turnos/turnos.component';
import { ListadoNumeracionMatriculasComponent } from './components/numeracion/listado-numeracion-matriculas.component';
import { NumeracionMatriculasComponent } from './components/numeracion/numeracion-matriculas.component';
import { SolicitarTurnoRenovacionComponent } from './components/turnos/solicitar-turno-renovacion.component';
import { SolicitarTurnoComponent } from './components/turnos/solicitar-turno.component';
import { DetalleProfesionalComponent } from './components/profesionales/detalle-profesional.component';
import { ListarProfesionalesComponent } from './components/profesionales/listar-profesionales.component';
import { FotoGeneralComponent } from './components/profesionales/foto-general.component';
import { SelectOrganizacionComponent } from './components/home/selectOrganizacion.component';
import { CambioDniComponent } from './components/profesionales/cambioDni/cambio-dni.component';
import { ListadoCambioDniComponent } from './components/profesionales/cambioDni/listado-cambio-dni.component';
import { SolicitarSobreTurnoMatriculacionComponent } from './components/turnos/sobreTurnoMatriculacion.component';
import { SupervisoresComponent } from './components/supervisor/listado-supervisores.component';
import { GuiaProfesionalComponent } from './components/guiaProfesional/guiaProfesional.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { SeleccionTurnosComponent } from './components/turnos/seleccion-turnos/seleccion-turnos.component';
import { SeleccionProfesionalComponent } from './components/turnos/seleccion-profesional/seleccion-profesional.component';

const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'homeProfesionales', component: HomeProfesionalesComponent },
    { path: 'homeAdministracion', component: HomeAdministracionComponent },
    { path: 'requisitosGenerales', component: RequisitosGeneralesComponent },
    { path: 'requisitosMatriculaUniversitaria', component: RequisitosMatriculaUniversitariaComponent },
    { path: 'requisitosMatriculaTecnicaAuxiliar', component: RequisitosMatriculaTecnicaAuxiliarComponent },
    { path: 'guiaProfesional', component: GuiaProfesionalComponent },
    { path: 'agenda', component: AgendaComponent, canActivate: [RoutingGuard] },
    { path: 'nuevoProfesional', component: ProfesionalComponent, canActivate: [RoutingGuard] },
    { path: 'solicitarTurnoMatriculacion/nuevoProfesional', component: ProfesionalComponent },
    {
        path: 'solicitarTurnoMatriculacion', component: SolicitarTurnoMatriculacionComponent,
        children: [{ path: 'seleccion-turnos', component: SeleccionTurnosComponent }]
    },
    {
        path: 'solicitarTurnoRenovacion', component: SolicitarTurnoRenovacionComponent,
        children: [{ path: 'seleccion-turnos', component: SeleccionTurnosComponent }, { path: 'seleccion-profesional', component: SeleccionProfesionalComponent }]
    },
    { path: 'solicitarTurnoRenovacion/:id', component: SolicitarTurnoRenovacionComponent, canActivate: [RoutingGuard] },
    { path: 'cambioDni', component: CambioDniComponent },
    { path: 'listadoCambioDni', component: ListadoCambioDniComponent },
    { path: 'turnos', component: TurnosComponent, canActivate: [RoutingGuard] },
    { path: 'profesional/:id', component: DetalleProfesionalComponent, canActivate: [RoutingGuard] },
    { path: 'listadoNumeraciones', component: ListadoNumeracionMatriculasComponent, canActivate: [RoutingGuard] },
    { path: 'numeraciones', component: NumeracionMatriculasComponent, canActivate: [RoutingGuard] },
    { path: 'nuevoTurno', component: SolicitarTurnoComponent, canActivate: [RoutingGuard] },
    { path: 'listarProfesionales', component: ListarProfesionalesComponent, canActivate: [RoutingGuard] },
    { path: 'selectOrganizacion', component: SelectOrganizacionComponent, canActivate: [RoutingGuard] },
    { path: 'sobreTurnoMatriculacion', component: SolicitarSobreTurnoMatriculacionComponent },
    { path: 'supervisores', component: SupervisoresComponent, canActivate: [RoutingGuard] },
    { path: 'reportes', component: ReportesComponent, canActivate: [RoutingGuard] },
    { path: '**', redirectTo: 'homeProfesionales' }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

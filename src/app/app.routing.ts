import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';



// Global
import { RoutingGuard } from './app.routings-guard.class';

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { RequisitosGeneralesComponent,
    RequisitosMatriculaUniversitariaComponent,
    RequisitosMatriculaTecnicaAuxiliarComponent } from './components/requisitos/requisitos.component';
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
import { FormacionPosgradoFormComponent } from './components/profesionales/formacionPosgrado/formacion-posgrado-form.component';



const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'requisitosGenerales', component: RequisitosGeneralesComponent },
    { path: 'requisitosMatriculaUniversitaria', component: RequisitosMatriculaUniversitariaComponent },
    { path: 'requisitosMatriculaTecnicaAuxiliar', component: RequisitosMatriculaTecnicaAuxiliarComponent },
    { path: 'agenda', component: AgendaComponent },
    { path: 'nuevoProfesional', component: ProfesionalComponent },
    { path: 'solicitarTurnoMatriculacion', component: SolicitarTurnoMatriculacionComponent },
    { path: 'solicitarTurnoRenovacion', component: SolicitarTurnoRenovacionComponent },
    { path: 'turnos', component: TurnosComponent, canActivate: [RoutingGuard] },
    { path: 'profesional/:id', component: DetalleProfesionalComponent },
    { path: 'listadoNumeraciones', component: ListadoNumeracionMatriculasComponent },
    { path: 'numeraciones', component: NumeracionMatriculasComponent },
    { path: 'nuevoTurno', component: SolicitarTurnoComponent },
    { path: 'posgrado', component: FormacionPosgradoFormComponent }
    
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

// Components
import { HomeComponent } from './components/home/home.component';
import { RequisitosGeneralesComponent,
    RequisitosMatriculaUniversitariaComponent,
    RequisitosMatriculaTecnicaAuxiliarComponent } from './components/requisitos/requisitos.component';
import { AgendaComponent } from './components/turnos/agenda.component';
import { SolicitarTurnoMatriculacionComponent } from './components/turnos/solicitar-turno-matriculacion.component';
import { ProfesionalComponent } from './components/profesionales/profesional.component';
import { ListadoTurnosComponent } from './components/turnos/listado-turnos.component';
import { ListadoNumeracionMatriculasComponent } from './components/numeracion/listado-numeracion-matriculas.component';
import { NumeracionMatriculasComponent } from './components/numeracion/numeracion-matriculas.component';

const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'requisitosGenerales', component: RequisitosGeneralesComponent },
    { path: 'requisitosMatriculaUniversitaria', component: RequisitosMatriculaUniversitariaComponent },
    { path: 'requisitosMatriculaTecnicaAuxiliar', component: RequisitosMatriculaTecnicaAuxiliarComponent },
    { path: 'agenda', component: AgendaComponent },
    { path: 'nuevoProfesional', component: ProfesionalComponent },
    { path: 'solicitarTurnoMatriculacion', component: SolicitarTurnoMatriculacionComponent },
    { path: 'listadoTurnos', component: ListadoTurnosComponent },
    { path: 'listadoNumeraciones', component: ListadoNumeracionMatriculasComponent },
    { path: 'numeraciones', component: NumeracionMatriculasComponent },
    { path: '**', redirectTo: 'home' }
]

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

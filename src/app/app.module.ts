import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { routing, appRoutingProviders } from './app.routing';

// Plex
import { PlexModule } from 'andes-plex/src/lib/module';
import { Plex } from 'andes-plex/src/lib/core/service';
import { FileUploadModule, FileSelectDirective } from 'ng2-file-upload';

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { RequisitosGeneralesComponent,
  RequisitosMatriculaUniversitariaComponent,
  RequisitosMatriculaTecnicaAuxiliarComponent } from './components/requisitos/requisitos.component';
import { AgendaComponent } from './components/turnos/agenda.component';
import { NuevoTurnoComponent } from './components/turnos/nuevo-turno.component';
import { SolicitarTurnoMatriculacionComponent } from './components/turnos/solicitar-turno-matriculacion.component';
import { ConfiguracionAgendaComponent } from './components/turnos/configuracion-agenda.component';
import { ProfesionalComponent } from './components/profesionales/profesional.component';
import { ListadoTurnosComponent } from './components/turnos/listado-turnos.component';
import { DetalleProfesionalComponent } from './components/profesionales/detalle-profesional.component';
import { ListadoNumeracionMatriculasComponent } from './components/numeracion/listado-numeracion-matriculas.component';
import { NumeracionMatriculasComponent } from './components/numeracion/numeracion-matriculas.component';
import { ListadoComponent } from './components/base/mat-listado.component'

// Services
import { AgendaService } from './services/agenda.service';
import { PaisService } from './services/pais.service';
import { ProvinciaService } from './services/provincia.service';
import { LocalidadService } from './services/localidad.service';
import { ProfesionService } from './services/profesion.service';
import { EntidadFormadoraService } from './services/entidadFormadora.service';
import { Server } from './../../node_modules/andes-shared/src/lib/server/server.service';
import { TurnoService } from './services/turno.service';
import { ProfesionalService } from './services/profesional.service';
import { SexoService } from './services/sexo.service';
import { NumeracionMatriculasService } from './services/numeracionMatriculas.service';

// Utils
import { PDFUtils } from './utils/PDFUtils';

@NgModule({
  declarations: [
    AppComponent,
    /*FileSelectDirective,*/
    HomeComponent,
    ListadoComponent,
    RequisitosGeneralesComponent,
    RequisitosMatriculaUniversitariaComponent,
    RequisitosMatriculaTecnicaAuxiliarComponent,
    AgendaComponent, ConfiguracionAgendaComponent,
    NuevoTurnoComponent, SolicitarTurnoMatriculacionComponent,
    ProfesionalComponent, DetalleProfesionalComponent,
    ListadoTurnosComponent, ListadoNumeracionMatriculasComponent, NumeracionMatriculasComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    PlexModule,
    FileUploadModule,
    routing
  ],
  providers: [
    Plex,
    AgendaService,
    PaisService,
    ProvinciaService,
    LocalidadService,
    Server,
    ProfesionService,
    EntidadFormadoraService,
    TurnoService,
    ProfesionalService,
    SexoService,
    PDFUtils,
    NumeracionMatriculasService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

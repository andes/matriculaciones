// Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LOCALE_ID } from '@angular/core';

// Global

import { Daterangepicker } from 'ng2-daterangepicker';
import { PlexModule, Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { FileUploadModule, FileSelectDirective } from 'ng2-file-upload';
import { Server } from '@andes/shared';
import { RoutingGuard } from './app.routings-guard.class';
import { PDFUtils } from './utils/PDFUtils';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';
import { ImageUploadModule } from 'angular2-image-upload';
// import { Plex } from '@andes/plex';
// import { ScrollComponent } from './components/base/plex-scroll.component';

// Servicios
import { AgendaService } from './services/agenda.service';
import { PaisService } from './services/pais.service';
import { ProvinciaService } from './services/provincia.service';
import { LocalidadService } from './services/localidad.service';
import { ProfesionService } from './services/profesion.service';
import { EntidadFormadoraService } from './services/entidadFormadora.service';
import { TurnoService } from './services/turno.service';
import { ProfesionalService } from './services/profesional.service';
import { SexoService } from './services/sexo.service';
import { NumeracionMatriculasService } from './services/numeracionMatriculas.service';
import { SIISAService } from './services/siisa.service';
// import { DataService } from './services/data.service';

// Componentes
import { RequisitosGeneralesComponent,
  RequisitosMatriculaUniversitariaComponent,
  RequisitosMatriculaTecnicaAuxiliarComponent } from './components/requisitos/requisitos.component';
import { HomeComponent } from './components/home/home.component';
import { HomeProfesionalesComponent } from './components/home/homeProfesionales.component';
import { AgendaComponent } from './components/turnos/agenda.component';
import { NuevoTurnoComponent } from './components/turnos/nuevo-turno.component';
import { SolicitarTurnoMatriculacionComponent } from './components/turnos/solicitar-turno-matriculacion.component';
import { SolicitarTurnoRenovacionComponent } from './components/turnos/solicitar-turno-renovacion.component';
import { ConfiguracionAgendaComponent } from './components/turnos/configuracion-agenda.component';
import { ProfesionalComponent } from './components/profesionales/profesional.component';
import { ListadoTurnosComponent } from './components/turnos/listado-turnos.component';
import { DetalleProfesionalComponent } from './components/profesionales/detalle-profesional.component';
import { ListadoNumeracionMatriculasComponent } from './components/numeracion/listado-numeracion-matriculas.component';
import { NumeracionMatriculasComponent } from './components/numeracion/numeracion-matriculas.component';
import { ListadoComponent } from './components/base/mat-listado.component';
import { SolicitarTurnoComponent } from './components/turnos/solicitar-turno.component';
import { ContactoDomiciliosProfesionalComponent } from './components/profesionales/contacto/contacto-domicilios-profesional.component';
import { FormacionGradoComponent } from './components/profesionales/formacionGrado/formacion-grado.component';
import { FormacionGradoDetalleComponent } from './components/profesionales/formacionGrado/formacion-grado-detalle.component';
import { FormacionPosgradoDetalleComponent } from './components/profesionales/formacionPosgrado/formacion-posgrado-detalle.component';
import { RenovacionesProfesionalComponent } from './components/profesionales/renovaciones-profesional.component';
import { FotoProfesionalComponent } from './components/profesionales/foto/foto-profesional.component';
import { FirmasProfesionalComponent } from './components/profesionales/firmas/firmas-profesional.component';
import { NotasProfesionalComponent } from './components/profesionales/notas/notas-profesional.component';
import { SancionesComponent } from './components/profesionales/sanciones/sanciones.component';
import { SancionesFormComponent } from './components/profesionales/sanciones/sanciones-form.component';
import { HeaderProfesionalComponent } from './components/profesionales/header-profesional.component';
import { FormacionPosgradoComponent } from './components/profesionales/formacionPosgrado/formacion-posgrado.component';
import { FormacionPosgradoFormComponent } from './components/profesionales/formacionPosgrado/formacion-posgrado-form.component';
import { ListarProfesionalesComponent } from './components/profesionales/listar-profesionales.component';



import { TurnosComponent } from './components/turnos/turnos.component';


// Locales
import { AppComponent } from './app.component';
import { routing, appRoutingProviders } from './app.routing';

const COMPS_PROFESIONAL = [
  ProfesionalComponent,
  DetalleProfesionalComponent,
  HeaderProfesionalComponent,
  ContactoDomiciliosProfesionalComponent,
  FotoProfesionalComponent,
  FirmasProfesionalComponent,
  NotasProfesionalComponent,
  SancionesComponent,
  SancionesFormComponent,
  FormacionGradoComponent,
  FormacionGradoDetalleComponent,
  FormacionPosgradoComponent,
  FormacionPosgradoDetalleComponent,
  FormacionPosgradoFormComponent,
  ListarProfesionalesComponent
];


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HomeProfesionalesComponent,
    ListadoComponent,
    RequisitosGeneralesComponent,
    RequisitosMatriculaUniversitariaComponent,
    RequisitosMatriculaTecnicaAuxiliarComponent,
    AgendaComponent, ConfiguracionAgendaComponent,
    NuevoTurnoComponent, SolicitarTurnoMatriculacionComponent, SolicitarTurnoRenovacionComponent, SolicitarTurnoComponent,
    ListadoTurnosComponent, ListadoNumeracionMatriculasComponent, NumeracionMatriculasComponent,
    TurnosComponent,
    COMPS_PROFESIONAL
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    PlexModule,
    routing,
    FileUploadModule,
    InfiniteScrollModule,
    Daterangepicker,
    ImageUploadModule.forRoot(),
  ],
  providers: [
    Plex,
    Auth,
    RoutingGuard,
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
    NumeracionMatriculasService,
    appRoutingProviders,
    SIISAService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

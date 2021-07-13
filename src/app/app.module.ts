// Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';

// Global

import { PlexModule, Plex, PlexVisualizadorService } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { RoutingGuard } from './app.routings-guard.class';
import { PDFUtils } from './utils/PDFUtils';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';
import { ImageUploadModule } from 'angular2-image-upload';
// import { Plex } from '@andes/plex';
import { ScrollComponent } from './components/base/plex-scroll.component';

// Servicios
import { AgendaService } from './services/agenda.service';
import { CambioDniService } from './services/cambioDni.service';
import { PaisService } from './services/pais.service';
import { ProvinciaService } from './services/provincia.service';
import { LocalidadService } from './services/localidad.service';
import { ProfesionService } from './services/profesion.service';
import { EntidadFormadoraService } from './services/entidadFormadora.service';
import { ModalidadesCertificacionService } from './services/modalidadesCertificacion.service';

import { TurnoService } from './services/turno.service';
import { ExcelService } from './services/excel.service';
import { ProfesionalService } from './services/profesional.service';
import { SexoService } from './services/sexo.service';
import { NumeracionMatriculasService } from './services/numeracionMatriculas.service';
import { SIISAService } from './services/siisa.service';
// import { DataService } from './services/data.service';

// Componentes
import {
  RequisitosGeneralesComponent,
  RequisitosMatriculaUniversitariaComponent,
  RequisitosMatriculaTecnicaAuxiliarComponent
} from './components/requisitos/requisitos.component';
import { HomeComponent } from './components/home/home.component';
import { HomeProfesionalesComponent } from './components/home/homeProfesionales.component';
import { AgendaComponent } from './components/turnos/agenda.component';
import { AgendaFormComponent } from './components/turnos/agenda.form.component';
import { NuevoTurnoComponent } from './components/turnos/nuevo-turno.component';
import { SolicitarTurnoMatriculacionComponent } from './components/turnos/solicitar-turno-matriculacion.component';
import { SolicitarTurnoRenovacionComponent } from './components/turnos/solicitar-turno-renovacion.component';
import { ConfiguracionAgendaComponent } from './components/turnos/configuracion-agenda.component';
import { ProfesionalComponent } from './components/profesionales/profesional.component';
import { ListadoTurnosComponent } from './components/turnos/listado-turnos.component';
import { DetalleProfesionalComponent } from './components/profesionales/detalle-profesional.component';
import { ListadoNumeracionMatriculasComponent } from './components/numeracion/listado-numeracion-matriculas.component';
import { NumeracionMatriculasFormComponent } from './components/numeracion/numeracion-matriculas-form.component';
import { NumeracionMatriculasComponent } from './components/numeracion/numeracion-matriculas.component';
import { ListadoComponent } from './components/base/mat-listado.component';
import { SolicitarTurnoComponent } from './components/turnos/solicitar-turno.component';
import { ContactoDomiciliosProfesionalComponent } from './components/profesionales/contacto/contacto-domicilios-profesional.component';
import { FormacionGradoComponent } from './components/profesionales/formacionGrado/formacion-grado.component';
import { FormacionGradoDetalleComponent } from './components/profesionales/formacionGrado/formacion-grado-detalle.component';
import { FormacionPosgradoDetalleComponent } from './components/profesionales/formacionPosgrado/formacion-posgrado-detalle.component';
import { RenovacionesProfesionalComponent } from './components/profesionales/renovaciones-profesional.component';
import { SubirFotoProfesionalComponent } from './components/profesionales/foto/subir-foto-profesional.component';
import { FotoGeneralComponent } from './components/profesionales/foto-general.component';
import { OtroDatosComponent } from './components/profesionales/otrosDatos/otros-datos.component';
import { FirmasProfesionalComponent } from './components/profesionales/firmas/firmas-profesional.component';
import { NotasProfesionalComponent } from './components/profesionales/notas/notas-profesional.component';
import { SancionesComponent } from './components/profesionales/sanciones/sanciones.component';
import { SancionesFormComponent } from './components/profesionales/sanciones/sanciones-form.component';
import { HeaderProfesionalComponent } from './components/profesionales/header-profesional.component';
import { FormacionPosgradoComponent } from './components/profesionales/formacionPosgrado/formacion-posgrado.component';
import { FormacionPosgradoFormComponent } from './components/profesionales/formacionPosgrado/formacion-posgrado-form.component';
import { FormacionGradoFormComponent } from './components/profesionales/formacionGrado/formacion-grado-form.component';
import { ListarProfesionalesComponent } from './components/profesionales/listar-profesionales.component';
import { SelectOrganizacionComponent } from './components/home/selectOrganizacion.component';
import { HomeAdministracionComponent } from './components/home/homeAdministracion.component';
import { CambioDniComponent } from './components/profesionales/cambioDni/cambio-dni.component';
import { ListadoCambioDniComponent } from './components/profesionales/cambioDni/listado-cambio-dni.component';
import { SolicitarSobreTurnoMatriculacionComponent } from './components/turnos/sobreTurnoMatriculacion.component';
import { WebcamModule } from 'ngx-webcam';
import { GuiaProfesionalComponent } from './components/guiaProfesional/guiaProfesional.component';
import { TurnosComponent } from './components/turnos/turnos.component';
import { ListadoTurnosPdfComponent } from './components/turnos/listado-turnos-pdf.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { UploadFileComponent } from './shared/components/upload-file.component';

// Locales
import { AppComponent } from './app.component';
import { routing, appRoutingProviders } from './app.routing';

const COMPS_PROFESIONAL = [
  ProfesionalComponent,
  DetalleProfesionalComponent,
  HeaderProfesionalComponent,
  ContactoDomiciliosProfesionalComponent,
  SubirFotoProfesionalComponent,
  FirmasProfesionalComponent,
  NotasProfesionalComponent,
  SancionesComponent,
  SancionesFormComponent,
  FormacionGradoComponent,
  FormacionGradoFormComponent,
  FormacionGradoDetalleComponent,
  FormacionPosgradoComponent,
  FormacionPosgradoDetalleComponent,
  FormacionPosgradoFormComponent,
  ListarProfesionalesComponent,
  OtroDatosComponent,
  CambioDniComponent,
  ListadoCambioDniComponent,
];

// Pipes
import { EdadPipe } from './pipes/edad.pipe';
import { ProfesionalPipe } from './pipes/profesional.pipe';
import { FechaPipe } from './pipes/fecha.pipe';
import { SupervisoresComponent } from './components/supervisor/listado-supervisores.component';
import { TextFilterPipe } from './pipes/textFilter.pipe';
import { UsuarioService } from './services/usuario.service';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { Ng2ImgToolsModule } from 'ng2-img-tools';
import { TituloProfesionalComponent } from './components/profesionales/tituloProfesional/adjunto-titulo-profesional.component';
import { SeleccionTurnosComponent } from './components/turnos/seleccion-turnos/seleccion-turnos.component';
import { SeleccionProfesionalComponent } from './components/turnos/seleccion-profesional/seleccion-profesional.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HomeProfesionalesComponent,
    HomeAdministracionComponent,
    ListadoComponent,
    RequisitosGeneralesComponent,
    RequisitosMatriculaUniversitariaComponent,
    RequisitosMatriculaTecnicaAuxiliarComponent,
    AgendaComponent, ConfiguracionAgendaComponent, AgendaFormComponent,
    NuevoTurnoComponent, SolicitarTurnoMatriculacionComponent,
    SolicitarSobreTurnoMatriculacionComponent, SolicitarTurnoRenovacionComponent,
    SolicitarTurnoComponent,
    ListadoTurnosComponent, ListadoNumeracionMatriculasComponent, NumeracionMatriculasComponent, NumeracionMatriculasFormComponent,
    TurnosComponent,
    FotoGeneralComponent,
    EdadPipe,
    ProfesionalPipe,
    FechaPipe,
    TextFilterPipe,
    SelectOrganizacionComponent,
    COMPS_PROFESIONAL,
    RenovacionesProfesionalComponent,
    GuiaProfesionalComponent,
    ScrollComponent,
    SupervisoresComponent,
    ListadoTurnosPdfComponent,
    ReportesComponent,
    UploadFileComponent,
    TituloProfesionalComponent,
    SeleccionTurnosComponent,
    SeleccionProfesionalComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    PlexModule.forRoot({ networkLoading: true }),
    routing,
    InfiniteScrollModule,
    Ng2ImgMaxModule,
    Ng2ImgToolsModule,
    ImageUploadModule.forRoot(),
    WebcamModule

  ],
  providers: [
    Plex,
    Server,
    Auth,
    RoutingGuard,
    AgendaService,
    PaisService,
    ProvinciaService,
    LocalidadService,
    ProfesionService,
    ExcelService,
    EntidadFormadoraService,
    TurnoService,
    ProfesionalService,
    SexoService,
    CambioDniService,
    PDFUtils,
    NumeracionMatriculasService,
    appRoutingProviders,
    SIISAService,
    ModalidadesCertificacionService,
    UsuarioService,
    ListadoTurnosPdfComponent,
    PlexVisualizadorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

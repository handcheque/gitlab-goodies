import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OAuthModule } from 'angular-oauth2-oidc';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { DragulaModule } from 'ng2-dragula';
import { MomentModule } from 'ngx-moment';
import { StorageServiceModule } from 'ngx-webstorage-service';

import { GitlabService } from './services/gitlab.service';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { EisenhowerMatrixComponent } from './eisenhower-matrix';
import { WorkBreakdownScheduleComponent } from './work-breakdown-schedule';
import { TimeTrackingComponent } from './time-tracking';

import {
  IssuesResolver,
  UserResolver,
  ProjectsResolver,
  GroupsResolver,
  MilestonesResolver
} from './app.resolver';

@NgModule({
  declarations: [
    AppComponent,
    EisenhowerMatrixComponent,
    WorkBreakdownScheduleComponent,
    TimeTrackingComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModule.forRoot(),
    AppRoutingModule,
    OAuthModule.forRoot(),
    HttpClientModule,
    Ng4LoadingSpinnerModule.forRoot(),
    DragulaModule,
    MomentModule,
    StorageServiceModule,

  ],
  providers: [
    GitlabService,
    IssuesResolver,
    UserResolver,
    ProjectsResolver,
    GroupsResolver,
    MilestonesResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

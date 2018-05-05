import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router, NavigationStart, NavigationEnd } from '@angular/router';

import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

import { EisenhowerMatrixComponent } from './eisenhower-matrix';
import { WorkBreakdownScheduleComponent } from './work-breakdown-schedule';
import { TimeTrackingComponent } from './time-tracking';

import {
  IssuesResolver,
  UserResolver,
  GroupsResolver,
  ProjectsResolver,
  MilestonesResolver,
} from './app.resolver';

const routes: Routes = [
  //{ path: '',      component: HomeComponent },
  {
    path: 'eisenhower-matrix',
    component: EisenhowerMatrixComponent,
    resolve: {
              issues: IssuesResolver,
              user: UserResolver
            }
  },
  {
    path: 'work-breakdown-schedule',
    component: WorkBreakdownScheduleComponent,
    resolve: {
      groups: GroupsResolver,
      projects: ProjectsResolver,
      milestones: MilestonesResolver,
      issues: IssuesResolver
    }
  },
  {
    path: 'time-tracking',
    component: TimeTrackingComponent,
    resolve: {
      projects: ProjectsResolver,
      issues: IssuesResolver,
      user: UserResolver
    }
  },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(router:Router, spinner:Ng4LoadingSpinnerService) {
    router.events.subscribe(event => {
      if(event instanceof NavigationStart) {
        spinner.show();
      }
      else if(event instanceof NavigationEnd) {
        spinner.hide();
      }
    });
  }
}

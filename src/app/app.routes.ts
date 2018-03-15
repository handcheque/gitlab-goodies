import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { HomeResolver } from './home/home.resolver.service';
import { WorkBreakdownScheduleComponent } from './work-breakdown-schedule';
import { AboutComponent } from './about';
import { NoContentComponent } from './no-content';

import { UserResolver, IssuesResolver, GroupsResolver, ProjectsResolver, MilestonesResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '',      component: AboutComponent },
  {
    path: 'ehm',
    component: HomeComponent,
    resolve: {
              issues: HomeResolver,
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
  { path: 'about', component: AboutComponent },
  { path: '**',    component: NoContentComponent },
];

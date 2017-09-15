import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { HomeResolver } from './home/home.resolver.service';
import { AboutComponent } from './about';
import { NoContentComponent } from './no-content';

import { DataResolver, UserResolver } from './app.resolver';

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
  { path: 'about', component: AboutComponent },
  { path: '**',    component: NoContentComponent },
];

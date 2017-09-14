import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Injectable }             from '@angular/core';
import { Observable }             from 'rxjs/Observable';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';

import { Issue, GitlabService }  from '../services/gitlab.service';

@Injectable()
export class HomeResolver implements Resolve<Issue[]> {
  constructor(private gitlab: GitlabService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Issue[]> {
    return this.gitlab.getIssues();
  }
}

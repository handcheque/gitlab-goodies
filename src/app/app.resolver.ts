import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { GitlabService, User, Issue, Group, Project, Milestone } from './services/gitlab.service';

@Injectable()
export class UserResolver implements Resolve<any> {
  constructor(private gitlab: GitlabService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
    return this.gitlab.getCurrentUser();
  }
}

@Injectable()
export class IssuesResolver implements Resolve<Issue[]> {
  constructor(private gitlab: GitlabService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Issue[]> {
    return this.gitlab.getIssues();
  }
}

@Injectable()
export class GroupsResolver implements Resolve<Group[]> {
  constructor(private gitlab: GitlabService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Group[]> {
    return this.gitlab.getGroups();
  }
}

@Injectable()
export class ProjectsResolver implements Resolve<Project[]> {
  constructor(private gitlab: GitlabService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Project[]> {
    return this.gitlab.getProjects();
  }
}

@Injectable()
export class MilestonesResolver implements Resolve<Milestone[]> {
  constructor(private gitlab: GitlabService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Group[]> {
    return this.gitlab.getAllMilestones();
  }
}


/**
 * An array of services to resolve routes with data.
 */
export const APP_RESOLVER_PROVIDERS = [
  UserResolver,
  IssuesResolver,
  GroupsResolver,
  MilestonesResolver,
  ProjectsResolver
];

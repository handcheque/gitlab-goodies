import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';


export class Group {
  constructor(
    public id: number,
    public name: string,
    public path: string,
    public description: string,
    public visibility: string,
    public lfs_enabled: boolean,
    public avatar_url: string,
    public web_url: string,
    request_access_enabled: boolean,
    full_name: string,
    full_path: string,
    parent_id?: number
  ) {}
}

export class Issue {
  constructor(
    public id: number,
    public iid: number,
    public project_id: number,
    public title: string,
    public labels: string[],
    public assignee?: {
      name: string
    },
    public state?: string
  ) { }
}

export class User {
  constructor(public id: number, public username: string, public labels: string[]) { }
}

export class Project {
  constructor(
    public id: number,
    public web_url: string,
    public name: string,
    public path: string
  ) { }
}

export class Milestone {
  constructor(
    public id: number,
  ) { }
}


export class ProjectLabel {
  constructor(
    public id: number,
    public name: string,
    public color: string,
  ) { }
}


import { Injectable } from '@angular/core';

@Injectable()
export class GitlabService {

  public url = process.env.API_URL + '/api/v4';

  constructor(
    private oauthService: OAuthService,
    private httpClient: HttpClient
  ){}

  getMilestones(project_id): Observable<Milestone[]> {
    return this.httpClient.get(
      this.url + "/projects/" + project_id + "/milestones",
      {
        headers: this.getHeaders(),
        responseType: 'json'
      }
    );
  }


  getAllMilestones(): Observable<Milestone[]> {
    return this.getProjects().mergeMap(
      projects => projects.map(project => this.getMilestones(project.id))
    ).concatAll().reduce((collected_milestones, next_list) => collected_milestones.concat(next_list), []);
  }


  getProjects(): Observable<Project[]> {
    var params = new HttpParams().set("simple", "true").set("per_page", "100");

    return this.httpClient.get(this.url + '/projects' , {
      headers: this.getHeaders(),
      params: params,
      responseType: 'json'
    });

  }


  getGroups(): Observable<Group[]> {
    var params = new HttpParams().set("per_page", "100").set("all_available", "true");

    return this.httpClient.get(this.url + '/groups' , {
      headers: this.getHeaders(),
      params: params,
      responseType: 'json'
    });

  }

  getIssues(): Observable<Issue[]> {
    var params = new HttpParams().set("per_page", "100");

    return this.httpClient.get(this.url + '/issues' , {
      headers: this.getHeaders(),
      params: params,
      responseType: 'json'
    });

  }

  getIssue(id: number | string) {
    return this.getIssues()
      .map(issues => issues.find(issue => issue.id === +id));
  }

  getProject(id: number | string) {
    return this.httpClient.get(`${this.url}/projects/${id}` , {
      headers: this.getHeaders(),
      responseType: 'json'
    });
  }

  getProjectLabels(id: number | string): Observable<ProjectLabel[]> {
    return this.httpClient.get(`${this.url}/projects/${id}/labels` , {
      headers: this.getHeaders(),
      responseType: 'json'
    });
  }

  updateProjectLabel(project_id, project_label) {
    return this.httpClient.put(`${this.url}/projects/${project_id}/labels/${project_label.id}`,
      project_label,
      {
        headers: this.getHeaders(),
        responseType: 'json',
      }
    );
  }

  createProjectLabel(project_id, project_label) {
    return this.httpClient.post(`${this.url}/projects/${project_id}/labels`,
      project_label,
      {
        headers: this.getHeaders(),
        responseType: 'json',
      }
    );
  }


  updateIssue(issue: Issue) {
    console.log("Updating issue");
    return this.httpClient.put(`${this.url}/projects/${issue.project_id}/issues/${issue.iid}`,
      {
        id: issue.id,
        labels: issue.labels.filter((label, i,ar) => ar.indexOf(label) === i).join(',')
      },
      {
        headers: this.getHeaders(),
        responseType: 'json',
      }
    );
  }


  getCurrentUser(): Observable<User> {
    return this.httpClient.get(this.url + '/user' , {
      headers: this.getHeaders(),
      responseType: 'json'
    });
  }

  private getHeaders() {
    return new HttpHeaders({
      "Authorization": "Bearer " + this.oauthService.getAccessToken()
    });

  }

}

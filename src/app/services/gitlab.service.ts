import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';


export class Issue {
  constructor(
    public id: number,
    public iid: number,
    public project_id: number,
    public title: string,
    public labels: string[] | string,
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
    public iid: number,
    public labels: string[],
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
    if(issue.labels instanceof Array) {
      issue.labels = issue.labels.filter((label, i,ar) => ar.indexOf(label) === i).join(',');
    }
    return this.httpClient.put(`${this.url}/projects/${issue.project_id}/issues/${issue.iid}`,
      issue,
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

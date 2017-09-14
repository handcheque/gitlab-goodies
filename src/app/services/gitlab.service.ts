import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';


export class Issue {
  constructor(
    public id: number,
    public title: string,
    public labels: string[],
    public assignee?: {
      name: string
    }
  ) { }
}

export class User {
  constructor(public id: number, public username: string, public labels: string[]) { }
}


import { Injectable } from '@angular/core';

@Injectable()
export class GitlabService {

  public url = 'https://gitlab.handcheque-hq.com/api/v4';

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

  getCurrentUser() {
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

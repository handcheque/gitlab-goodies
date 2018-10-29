import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/last';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs';

import { HttpHeaders, HttpClient, HttpParams, HttpResponse, HttpRequest } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../../environments/environment';


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
    public assignees: User[],
    public milestone?: Milestone,
    public assignee?: User,
    public state?: string
  ) { }
}

export class User {
  constructor(public id: number, public name: string, public username: string, public labels?: string[]) { }
}

export class Project {
  constructor(
    public id: number,
    public web_url: string,
    public name: string,
    public path: string,
    public namespace: {
      id: number
    },
  ) { }
}

export class Milestone {
  constructor(
    public id: number,
    public start_date: string,
    public due_date: string,
    public title: string,
    public description: string
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

  public currentUser:User = null;

  public url = environment.apiUrl + '/api/v4';

  constructor(
    private oauthService: OAuthService,
    private httpClient: HttpClient
  ){}

  private async get(url, options) {
    let result = await this.httpClient.get(url , options).first().toPromise();
    console.log(result);
    return result;
  }

  getMilestones(project_id): Observable<Milestone[]> {
    return this.httpClient.get<Milestone[]>(
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
    var params = new HttpParams().set("per_page", "100");

    return this.httpClient.get<Project[]>(this.url + '/projects' , {
      headers: this.getHeaders(),
      params: params,
      responseType: 'json'
    });

  }


  getGroups(): Observable<Group[]> {
    var params = new HttpParams().set("per_page", "100").set("all_available", "true");

    return this.httpClient.get<Group[]>(this.url + '/groups' , {
      headers: this.getHeaders(),
      params: params,
      responseType: 'json'
    });

  }

  getIssuePage(i, scope) {
    var params = new HttpParams().set("per_page", "100").set("page", i).set("scope", scope);

    return this.httpClient.get<Issue[]>(this.url + '/issues' , {
      headers: this.getHeaders(),
      params: params,
      responseType: 'json'
    });
  }

  getIssues(scope?: string): Observable<Issue[]> {
    if(scope == undefined)
    {
      scope = "all";
    }
    let params = new HttpParams()
      .set("per_page", "100")
      .set("scope", scope);

    let result = this.httpClient.request(new HttpRequest("GET", this.url + '/issues' , {
      headers: this.getHeaders(),
      params: params,
      responseType: 'json'
    }));

    return result.last()
      .map(event => Number((event as HttpResponse<Issue[]>).headers.get("X-Total-Pages")))
      .map(this.createRangeList)
      .mergeMap(page_list => page_list.map(i => this.getIssuePage(i+1, scope)))
      .concatAll()
      .reduce((collected, next_list) => collected.concat(next_list), []);
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
    return this.httpClient.get<ProjectLabel[]>(`${this.url}/projects/${id}/labels` , {
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

  spendTime(issue: Issue, human_time: String) {
      return this.httpClient.post(`${this.url}/projects/${issue.project_id}/issues/${issue.iid}/add_spent_time`,
      {
        duration: human_time
      },
      {
        headers: this.getHeaders(),
        responseType: 'json',
      }
    );

  }

  createIssueComment(issue: Issue, comment: string): Observable<any> {
    return this.httpClient.post(`${this.url}/projects/${issue.project_id}/issues/${issue.iid}/notes`,
      {
        body: comment,
      },
      {
        headers: this.getHeaders(),
        responseType:'json'
      }
    );
  }

  getCurrentUser(): Observable<User> {
    if(this.currentUser == null) {
      return this.httpClient.get<User>(this.url + '/user' , {
        headers: this.getHeaders(),
        responseType: 'json'
      });
    }
    else {
      return Observable.of(this.currentUser);
    }
  }

  private getHeaders() {
    return new HttpHeaders({
      "Authorization": "Bearer " + this.oauthService.getAccessToken()
    });

  }

  private createRangeList(count: number): number[] {
    let page_list = [];
    for(let i = 0; i<count; i++)
    {
      page_list.push(i);
    }
    return page_list;
  }

}

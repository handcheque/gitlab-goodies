import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  Inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import 'rxjs/add/operator/takeWhile';

import { StorageService, LOCAL_STORAGE } from 'ngx-webstorage-service';

import * as moment from 'moment';

import { Issue, Project, User, GitlabService } from '../services/gitlab.service';

const STORAGE_KEY = 'time-tracking-data';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'time-tracking',
  providers: [
  ],
  styleUrls: [ './time-tracking.component.scss' ],
  templateUrl: './time-tracking.component.html'
})

export class TimeTrackingComponent implements OnInit {

  public active_tracker_data: any = {
    start_time: moment().format("HH:mm"),
    start_date: moment().format("YYYY-MM-DD"),
  };
  public time_tracking_data: {projects: Project[], issues: Issue[], user: User} = {issues:[], projects:[], user: null};
  public next_issue: any = {};
  public currently_tracking: boolean = false;

  private alive: boolean = true;

  public duration_string: string = "";



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gitlab: GitlabService,
    @Inject(LOCAL_STORAGE) private storage: StorageService,
    ) {
  }


  private async initData() {
    if(this.storage.has(STORAGE_KEY))
    {
      this.active_tracker_data = this.storage.get(STORAGE_KEY);
      this.currently_tracking = true;
    }

    let raw_data = <{projects: Project[], issues: Issue[], user: User}> await this.route.data.first().toPromise();
    this.time_tracking_data = {
      user: raw_data.user,
      issues: raw_data.issues
        .filter((issue) => issue.assignee && issue.assignee.username == raw_data.user.username)
        .filter((issue) => issue.state != 'closed')
        .filter((issue) => raw_data.projects.find((project) => project.id == issue.project_id))
        ,
      projects: raw_data.projects,

    };
  }

  public ngOnInit() {
    this.initData();


    TimerObservable.create(0, 10000)
      .takeWhile(() => this.alive)
      .subscribe(() => {
        if(this.currently_tracking) {
          this.duration_string = moment(this.active_tracker_data.start_date + ' ' + this.active_tracker_data.start_time).fromNow(true);
        }
      });
  }

  public ngOnDestroy() {
    this.alive = false;
  }

  public startTracking() {
    this.currently_tracking = true;
    if(!this.active_tracker_data.custom_start_time) {
      this.active_tracker_data.start_time = moment().format("HH:mm");
      this.active_tracker_data.start_date = moment().format("YYYY-MM-DD");
    }

    this.duration_string = moment(this.active_tracker_data.start_date + ' ' + this.active_tracker_data.start_time).fromNow(true);

    this.storage.set(STORAGE_KEY, this.active_tracker_data);
  }

  public stopTracking() {
    console.log(this.active_tracker_data);

    let comment_body = "###### Time Log\n\n";
    comment_body += "```yaml\n";
    comment_body += "timelog:\n";
    comment_body += `  start: ${this.active_tracker_data.start_date + ' ' + this.active_tracker_data.start_time}\n`;
    comment_body += `  end: ${this.active_tracker_data.end_date + ' ' + this.active_tracker_data.end_time}\n`;
    comment_body += `  note: ""\n`;
    comment_body += "```\n";

    this.gitlab.createIssueComment(this.getCurrentIssue(), comment_body);

    this.currently_tracking = false;
    this.storage.remove(STORAGE_KEY);
  }

  public getCurrentIssue(): Issue {
    return this.time_tracking_data.issues.find((issue) => issue.id == <number>this.active_tracker_data.issue_id);
  }


  public getProject(issue: Issue): Project {
    return this.time_tracking_data.projects.find((project) => project.id == issue.project_id);
  }

  public setCurrentDateTime() {
    this.active_tracker_data.end_time = moment().format("HH:mm");
    this.active_tracker_data.end_date = moment().format("YYYY-MM-DD");
  }

  public resetTracking() {
    this.active_tracker_data = {
      start_time: moment().format("HH:mm"),
      start_date: moment().format("YYYY-MM-DD"),
    };
    this.currently_tracking = false;
    this.storage.remove(STORAGE_KEY);
  }



}

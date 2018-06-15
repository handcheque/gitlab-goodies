// Nummer, Name, Status (not started, WIP, completed) responsible person, start, end

import {
  Component,
  OnInit,
  ElementRef,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { Group, Project, Milestone, GitlabService, Issue } from '../services/gitlab.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'work-breakdown-schedule',
  providers: [
  ],
  styleUrls: [ './work-breakdown-schedule.component.scss' ],
  templateUrl: './work-breakdown-schedule.component.html',
})

export class WorkBreakdownScheduleComponent implements OnInit {

  public wbsData: any = [];
  /**
   * TypeScript public modifiers
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    element: ElementRef,
    ) {
  }

  private async initData() {
    let data_raw = await this.route.data.first().toPromise();

    console.log(data_raw);

    this.wbsData = data_raw["groups"]
      .filter(group => group.full_path == `handcheque/${group.path}`)
      .map(group => {
        return {
          "id": group.id,
          "name": group.name,
          "url": group.web_url,
          "projects": data_raw.projects
            .filter(project => project.namespace.full_path.startsWith(`handcheque/${group.path}`))
            .map(project => {
              return {
                "id": project.id,
                "name": project.namespace.full_path.split("/").slice(2).map(path_element =>path_element.substring(0,4) + " - ") + project.name,
                "url": project.web_url,
                "milestones": data_raw.milestones
                  .filter(milestone => milestone.project_id == project.id && milestone.title.startsWith("WP - "))
                  .map(milestone => {
                    return {
                      "id": milestone.id,
                      "name": milestone.title,
                      "start_date": milestone.start_date,
                      "due_date": milestone.due_date,
                      "url": project.web_url + "/milestones/" + milestone.iid,
                      "status": this.getMilestoneStatus(data_raw.issues.filter(issue => issue.milestone && issue.milestone.id == milestone.id), milestone)
                    };

                  })
                  .sort((milestone1, milestone2) => {
                    if(milestone1.start_date > milestone2.start_date)
                    {
                      return 1;
                    }
                    if(milestone1.start_date < milestone2.start_date)
                    {
                      return -1;
                    }
                    return 0;
                  })
                }
            }).sort((project1, project2) => {
              if(project1.name > project2.name)
              {
                return 1;
              }
              if(project1.name < project2.name)
              {
                return -1;
              }
              return 0;
            })
        };
    });

    console.log(this.wbsData);
  }

  public ngOnInit() {
    this.initData();
  }

  private getMilestoneStatus(issues: Issue[], milestone: Milestone):any {
    let progressStatus = "";
    if(issues.length == 0)
    {
      progressStatus = "empty";
    }
    if(issues.every(issue => issue.assignees.length == 0 && issue.state == 'opened'))
    {
      progressStatus = "not started";
    }
    else if(issues.some(issue => issue.assignees.length > 0 && issue.state == 'opened'))
    {
      progressStatus = "in progress";
    }
    else if(issues.every(issue => issue.state == 'closed'))
    {
      progressStatus = "completed";
    }
    else {
      progressStatus = "stalled";
    }

    let alertStatus = "";

    if(progressStatus == "stalled")
    {
      alertStatus = "warning";
    }
    if(progressStatus == "empty")
    {
      alertStatus = "warning";
    }
    if(progressStatus != "completed" && milestone.due_date < moment().add(1, 'weeks').format("YYYY-MM-DD"))
    {
      alertStatus = "warning";
    }
    if(progressStatus == "not started" && milestone.start_date < moment().format("YYYY-MM-DD"))
    {
      alertStatus = "alarm";
    }
    if(progressStatus != "completed" && milestone.due_date < moment().format("YYYY-MM-DD"))
    {
      alertStatus = "alarm";
    }

    let percentageCompleted = 0;

    if(issues.length > 0)
    {
      percentageCompleted = issues.filter(issue => issue.state == "closed").length / issues.length * 100;
    }


    return {
      progressStatus: progressStatus,
      alertStatus: alertStatus,
      percentageCompleted: percentageCompleted
    }
  }

}

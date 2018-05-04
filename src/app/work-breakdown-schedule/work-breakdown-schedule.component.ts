// Nummer, Name, Status (not started, WIP, completed) responsible person, start, end

import {
  Component,
  OnInit,
  ElementRef,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Group, Project, Milestone, GitlabService } from '../services/gitlab.service';

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
      .filter(group => group.name != '10k' && group.name != 'handcheque')
      .map((group, group_index) => {
        return {
          "id": group.id,
          "name": group.name,
          "index": group_index + 1,
          "prefix": group_index + 1,
          "url": group.web_url,
          "projects": data_raw.projects
            .filter(project => project.namespace.id == group.id)
            .map((project, project_index) => {
              return {
                "id": project.id,
                "name": project.name,
                "index": project_index + 1,
                "prefix": (group_index + 1) + "." + (project_index + 1),
                "url": project.web_url,
                "milestones": data_raw.milestones
                  .filter(milestone => milestone.project_id == project.id)
                  .map((milestone, milestone_index) => {
                    return {
                      "id": milestone.id,
                      "name": milestone.title,
                      "index": milestone_index + 1,
                      "prefix": (group_index + 1) + "." + (project_index + 1) + "." + (milestone_index + 1),
                      "url": project.web_url + "/milestones/" + milestone.iid,
                      "issues": data_raw.issues.filter(issue => issue.milestone && issue.milestone.id == milestone.id).map((issue, issue_index) => {
                        return {
                          "id": issue.id,
                          "name": issue.title,
                          "type": "issue",
                          "index": issue_index + 1,
                          "prefix": (group_index + 1) + "." + (project_index + 1) + "." + (milestone_index + 1) + "." + (issue_index + 1),
                        }
                      })
                    }
                  })
                }
            })
        };
    });

    console.log(this.wbsData);
  }
  
  public ngOnInit() {
    this.initData();
  }


}

import {
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { Issue, User, GitlabService } from '../services/gitlab.service';

@Component({
  selector: 'app-eisenhower-matrix',
  providers: [
  ],
  styleUrls: [ './eisenhower-matrix.component.scss' ],
  templateUrl: './eisenhower-matrix.component.html',
  encapsulation: ViewEncapsulation.None,
})

export class EisenhowerMatrixComponent implements OnInit {
  /**
   * Set our default values
   */
  public localState = { value: '' };

  private labels = [
    {name:"now", color: '#FF4400'},
    {name:"important", color: '#FF00FF'},
    {name:"later", color: '#7F8C8D'},
    {name:"nice to have", color: '#A8D695'}
  ]

  /**
   * TypeScript public modifiers
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dragulaService: DragulaService,
    private gitlab: GitlabService
    ) {
      dragulaService.dropModel.subscribe((value) => {
        let issue_id = value[1].id.split('-')[1];
        let new_quadrant = value[2].id.split('-')[1];

        let issue: Issue = this[new_quadrant].find((issue) => `${issue.id}` === issue_id);

        this.fixLabels(issue.project_id).then((result) =>{
          if(new_quadrant === 'q1')
          {
            if(issue.labels instanceof Array) {
              issue.labels = issue.labels.filter((label) => label != 'later').filter((label) => label != 'nice to have').concat(['now', 'important']);
            }
            gitlab.updateIssue(issue).subscribe((value) => console.log(value));
          }
          else if(new_quadrant === 'q2')
          {
            if(issue.labels instanceof Array) {
              issue.labels = issue.labels.filter((label) => label != 'now').filter((label) => label != 'nice to have').concat(['later', 'important']);
            }
            gitlab.updateIssue(issue).subscribe((value) => console.log(value));
          }
          else if(new_quadrant === 'q3')
          {
            if(issue.labels instanceof Array) {
              issue.labels = issue.labels.filter((label) => label != 'later').filter((label) => label != 'important').concat(['now', 'nice to have']);
            }
            gitlab.updateIssue(issue).subscribe((value) => console.log(value));
          }
          else if(new_quadrant === 'q4')
          {
            if(issue.labels instanceof Array) {
              issue.labels = issue.labels.filter((label) => label != 'now').filter((label) => label != 'important').concat(['later', 'nice to have']);
            }
            gitlab.updateIssue(issue).subscribe((value) => console.log(value));
          }
        })
      });

  }


  public q1: Issue[] = [];
  public q2: Issue[] = [];
  public q3: Issue[] = [];
  public q4: Issue[] = [];


  public ngOnInit() {
    this.route.data
      .subscribe((data: { issues: Issue[], user: User }) => {

        let assigned_issues = data.issues
          .filter((issue) => issue.assignee && issue.assignee.name == data.user.username)
          .filter((issue) => issue.state != 'closed');

        this.q1 = assigned_issues.filter((issue) => issue.labels.indexOf('now') > -1 && issue.labels.indexOf('important') > -1);
        this.q2 = assigned_issues.filter((issue) => issue.labels.indexOf('now') < 0 && issue.labels.indexOf('important') > -1);
        this.q3 = assigned_issues.filter((issue) => issue.labels.indexOf('now') > -1 && issue.labels.indexOf('important') < 0);
        this.q4 = assigned_issues.filter((issue) => issue.labels.indexOf('now') < 0 && issue.labels.indexOf('important') < 0);

      });
  }

  private fixLabels(project_id): Promise<Object> {
    let fixed_promise = new Promise((resolve, reject) => {
      let label_observables: Observable<Object>[] = [];
      let project_observable = this.gitlab.getProjectLabels(project_id);
      label_observables.push(project_observable);
      project_observable.subscribe((project_labels) => {
        for(var label of this.labels) {
          let matching_project_label = project_labels.find((project_label) => project_label.name === label.name)
          if(matching_project_label)
          {
            if(matching_project_label.color === label.color)
            {
              label_observables.push(Observable.of("Nothing to do!"));
            }
            else
            {
              console.log("Updating Label ...")
              matching_project_label.color = label.color;
              label_observables.push(this.gitlab.updateProjectLabel(project_id, matching_project_label));
            }
          }
          else
          {
            console.log("Creating Label ...");
            label_observables.push(this.gitlab.createProjectLabel(project_id, label));
          }
          Observable.forkJoin(label_observables).subscribe((value) => resolve(value));
        }
      });
    });
    return fixed_promise;
  }

}

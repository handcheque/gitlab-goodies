import {
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { AppState } from '../app.service';
import { Title } from './title';
import { Issue, User, GitlabService } from '../services/gitlab.service';

@Component({
  /**
   * The selector is what angular internally uses
   * for `document.querySelectorAll(selector)` in our index.html
   * where, in this case, selector is the string 'home'.
   */
  selector: 'home',  // <home></home>
  /**
   * We need to tell Angular's Dependency Injection which providers are in our app.
   */
  providers: [
    Title
  ],
  /**
   * Our list of styles in our component. We may add more to compose many styles together.
   */
  styleUrls: [ './home.component.scss' ],
  /**
   * Every Angular template is first compiled by the browser before Angular runs it's compiler.
   */
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {
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
    public appState: AppState,
    public title: Title,
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
            issue.labels = issue.labels.filter((label) => label != 'later').filter((label) => label != 'nice to have').concat(['now', 'important']);
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
    console.log('hello `Home` component');



    this.route.data
      .subscribe((data: { issues: Issue[], user: User }) => {

        let assigned_issues = data.issues.filter((issue) => issue.assignee && issue.assignee.name == data.user.username)

        this.q1 = assigned_issues.filter((issue) => issue.labels.find((label) => label === 'now') && issue.labels.find((label) => label === 'important'));
        this.q2 = assigned_issues.filter((issue) => !issue.labels.find((label) => label === 'now') && issue.labels.find((label) => label === 'important'));
        this.q3 = assigned_issues.filter((issue) => issue.labels.find((label) => label === 'now') && !issue.labels.find((label) => label === 'important'));
        this.q4 = assigned_issues.filter((issue) => !issue.labels.find((label) => label === 'now') && !issue.labels.find((label) => label === 'important'));

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
            console.log("Found:");
            console.log(matching_project_label);
            console.log(label);
            if(matching_project_label.color === label.color)
            {
              console.log("Perfect Match!")
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
            console.log("Not Found:");
            console.log(label);
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

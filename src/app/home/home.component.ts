import {
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppState } from '../app.service';
import { Title } from './title';
import { Issue, User } from '../services/gitlab.service';

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
  /**
   * TypeScript public modifiers
   */
  constructor(
    public appState: AppState,
    public title: Title,
    private route: ActivatedRoute,
    private router: Router,
    ) {

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


    /**
     * this.title.getData().subscribe(data => this.data = data);
     */
  }

  public submitState(value: string) {
    console.log('submitState', value);
    this.appState.set('value', value);
    this.localState.value = '';
  }
}

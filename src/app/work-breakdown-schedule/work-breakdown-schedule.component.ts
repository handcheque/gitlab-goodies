import {
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { AppState } from '../app.service';
import { Group, Project, Milestone, GitlabService } from '../services/gitlab.service';

@Component({
  /**
   * The selector is what angular internally uses
   * for `document.querySelectorAll(selector)` in our index.html
   * where, in this case, selector is the string 'home'.
   */
  selector: 'work-breakdown-schedule',  // <home></home>
  /**
   * We need to tell Angular's Dependency Injection which providers are in our app.
   */
  providers: [
  ],
  /**
   * Our list of styles in our component. We may add more to compose many styles together.
   */
  styleUrls: [ './work-breakdown-schedule.component.scss' ],
  /**
   * Every Angular template is first compiled by the browser before Angular runs it's compiler.
   */
  templateUrl: './work-breakdown-schedule.component.html'
})

export class WorkBreakdownScheduleComponent implements OnInit {

  /**
   * TypeScript public modifiers
   */
  constructor(
    public appState: AppState,
    private route: ActivatedRoute,
    private router: Router,
    ) {

  }

  public ngOnInit() {
    this.route.data
      .subscribe((data: { groups: Group[], projects: Project[], milestones: Milestone[] }) => {
        console.log(data);

      });
  }


}

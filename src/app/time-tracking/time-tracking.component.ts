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

  /**
   * The selector is what angular internally uses
   * for `document.querySelectorAll(selector)` in our index.html
   * where, in this case, selector is the string 'home'.
   */
  selector: 'time-tracking',
  /**
   * We need to tell Angular's Dependency Injection which providers are in our app.
   */
  providers: [
  ],
  /**
   * Our list of styles in our component. We may add more to compose many styles together.
   */
  styleUrls: [ './time-tracking.component.scss' ],
  /**
   * Every Angular template is first compiled by the browser before Angular runs it's compiler.
   */
  templateUrl: './time-tracking.component.html'
})

export class TimeTrackingComponent implements OnInit {

  public current_open_issue: any;
  public time_tracking_data: any = {};
  public next_issue: any = {};
  /**
   * TypeScript public modifiers
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    element: ElementRef,
    ) {
  }

  private onResize() {
    this.initData();
  }



  private async initData() {
    this.time_tracking_data = await this.route.data.first().toPromise();
  }

  public ngOnInit() {
    this.initData();
  }


}

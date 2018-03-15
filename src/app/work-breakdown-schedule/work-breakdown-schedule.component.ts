// Nummer, Name, Status (not started, WIP, completed) responsible person, start, end

import {
  Component,
  OnInit,
  ElementRef,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { AppState } from '../app.service';
import { Group, Project, Milestone, GitlabService } from '../services/gitlab.service';
import { D3Service, D3, Selection } from 'd3-ng2-service';

@Component({
  encapsulation: ViewEncapsulation.None,

  /**
   * The selector is what angular internally uses
   * for `document.querySelectorAll(selector)` in our index.html
   * where, in this case, selector is the string 'home'.
   */
  selector: 'work-breakdown-schedule',
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

  private d3: D3;
  private data: any;
  /**
   * TypeScript public modifiers
   */
  constructor(
    public appState: AppState,
    private route: ActivatedRoute,
    private router: Router,
    element: ElementRef,
    d3Service: D3Service
    ) {
    this.d3 = d3Service.getD3();
  }

  private onResize() {
    this.initData();
  }

  private async initData() {
    if(!this.data) {
      this.data = await this.route.data.first().toPromise();
    }
    console.log(this.data);
    let container_div = document.getElementById('wbs-diagram');
    if(container_div.children.length)
    {
      container_div.children.item(0).remove();
    }
    let d3 = this.d3; // <-- for convenience use a block scope variable
    let d3ParentElement = d3.select("#wbs-diagram"); // <-- use the D3 select method
    let width = container_div.clientWidth;
    let height = 1000;
    let d3Svg = d3ParentElement.append<SVGSVGElement>('svg').attr("width", width).attr("height", height);
    let d3G = d3Svg.append<SVGGElement>('g').attr("transform", "translate(40, 40)");

    let tree_data = d3.hierarchy({
      "name": "handcheque",
      "children": this.data["groups"].filter(group => group.name != '10k' && group.name != 'handcheque').map((group, group_index) => {
        return {
          "id": group.id,
          "name": group.name,
          "type": "group",
          "index": group_index + 1,
          "prefix": group_index + 1,
          "children": this.data.projects.filter(project => project.namespace.id == group.id).map((project, project_index) => {
            return {
              "id": project.id,
              "name": project.name,
              "type": "project",
              "index": project_index + 1,
              "prefix": (group_index + 1) + "." + (project_index + 1),
              "children": this.data.milestones.filter(milestone => milestone.project_id == project.id).map((milestone, milestone_index) => {
                return {
                  "id": milestone.id,
                  "name": milestone.title,
                  "type": "milestone",
                  "index": milestone_index + 1,
                  "prefix": (group_index + 1) + "." + (project_index + 1) + "." + (milestone_index + 1),
                  "children": this.data.issues.filter(issue => issue.milestone && issue.milestone.id == milestone.id).map((issue, issue_index) => {
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
      }),
    });

    let column_offset = 8;

    tree_data.children.forEach((group, index) => {
      group.x = index * width / tree_data.children.length;
      group.y = 10;


      let offset = group.y + 20;
      group.children.forEach((project, index) => {
        if(index == 0) {
          offset = group.y + 20;
        }
        project.x = group.x + column_offset;
        project.y = offset;
        offset += 20
        if(project.children) {
          project.children.forEach((milestone, index) =>{
            milestone.x = project.x + column_offset;
            milestone.y = offset;
            offset += 20;
            if(milestone.children) {
              milestone.children.forEach((issue, index) =>{
                issue.x = milestone.x + column_offset;
                issue.y = offset;
                offset += 20;
              });
            }
          });
        }
      });
    });


    let link = d3G.selectAll(".link")
      .data(tree_data.links().filter(link => !!link.source.parent))
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
          .x(d => d.x)
          .y(d => d.y)
        );

    var node = d3G.selectAll(".node")
        .data(tree_data.descendants().filter(node => !!node.parent))
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", d => "translate(" + d.x + "," + d.y + ")")

    // place the name atribute left or right depending if children
    node.append("text")
      .attr("dx", 1)
      .attr("dy", 3)
      .attr("text-anchor", "start")
      .text(d => d.data.prefix + " " + d.data.name)
  }

  public ngOnInit() {
    this.initData();
  }


}

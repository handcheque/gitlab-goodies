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
  private parentNativeElement: any;
  public data: any;
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
    this.parentNativeElement = element.nativeElement;
  }

  private update(tree, root, source, svg) {


    let i = 0;
    let duration = 750;

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });
        //.on("click", click);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // // Enter any new links at the parent's previous position.
    // link.enter().insert("path", "g")
    //     .attr("class", "link")
    //     .attr("d", function(d) {
    //       var o = {x: source.x0, y: source.y0};
    //       return diagonal({source: o, target: o});
    //     });
    //
    // // Transition links to their new position.
    // link.transition()
    //     .duration(duration)
    //     .attr("d", diagonal);
    //
    // // Transition exiting nodes to the parent's new position.
    // link.exit().transition()
    //     .duration(duration)
    //     .attr("d", function(d) {
    //       var o = {x: source.x, y: source.y};
    //       return diagonal({source: o, target: o});
    //     })
    //     .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  public ngOnInit() {
    let d3 = this.d3; // <-- for convenience use a block scope variable
    let d3ParentElement: Selection<any, any, any, any>; // <-- Use the Selection interface (very basic here for illustration only)

    this.route.data
      .subscribe((data: { groups: Group[], projects: Project[], milestones: Milestone[] }) => {

        console.log(data);

        d3ParentElement = d3.select("#wbs-diagram"); // <-- use the D3 select method

        let d3Svg = d3ParentElement.append<SVGSVGElement>('svg').attr("width", 800).attr("height", 800);

        let width = +d3Svg.attr('width');
        let height = +d3Svg.attr('height');

        let d3G = d3Svg.append<SVGGElement>('g').attr("transform", "translate(40, 0)");;
        let tree_data = d3.hierarchy({
          "name": "handcheque",
          "children": data["groups"].map(group => {
            return {
              "name": group.name,
              "children": data.projects.filter(project => project.namespace.id == group.id)
            };
          }),
        });


        let tree = d3.tree().size([800, 800]);

        console.log("creating links");

        let link = d3G.selectAll(".link")
          .data(tree(tree_data).links())
          .enter().append("path")
          .attr("class", "link")
          .attr("d", d3.linkHorizontal()
              .x(function(d) { return d.x; })
              .y(function(d) { return d.y; }));

        console.log("creating nodes");


        var node = d3G.selectAll(".node")
            .data(tree_data.descendants())
            .enter().append("g")
              .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
              .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

        node.append("circle")
          .attr("r", 2.5);

        // place the name atribute left or right depending if children
        node.append("text")
          .attr("dx", function(d) { return d.children ? -8 : 8; })
          .attr("dy", 3)
          .attr("text-anchor", d => d.children ? "end" : "start")
          .text(d => d.data["name"])


      });
  }


}

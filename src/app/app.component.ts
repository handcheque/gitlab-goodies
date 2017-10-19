/**
 * Angular 2 decorators and services
 */
import { authConfig } from './auth.config';
import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppState } from './app.service';
import { User, GitlabService } from './services/gitlab.service';
import {
  OAuthService,
  JwksValidationHandler
} from 'angular-oauth2-oidc';



/**
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.css'
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public angularclassLogo = 'assets/img/angularclass-avatar.png';
  public name = 'Gitlab Eisenhower Matrix';
  public url = 'https://gitlab.handcheque-hq.com/api/v4';

  public user:User;

  constructor(
    public appState: AppState,
    private oauthService: OAuthService,
    private httpClient: HttpClient,
    private gitlabService: GitlabService,
    private router: Router
  ) {
    this.configureWithNewConfigApi();
    this.gitlabService.getCurrentUser().subscribe((user)=>this.user = user);
  }

  private configureWithNewConfigApi() {

    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();

    // Optional
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.events.subscribe(e => {
      console.log("OAUTH Event\n============");
      console.log(e);
    });

    this.oauthService.events.filter(e => e.type === 'session_terminated').subscribe(e => {
      console.debug('Your session has been terminated!');
    });

    this.oauthService.tryLogin({onTokenReceived: (info) => {
        console.debug('state', info.state);
    }});
  }

  public login() {
    this.oauthService.initImplicitFlow();
  }

  public logout() {
    console.log("log out");
    this.oauthService.logOut();
    this.user = null;
    this.router.navigate(['/']);
  }



  public ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }

}

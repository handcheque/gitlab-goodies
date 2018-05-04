import { authConfig } from './auth.config';
import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { User, GitlabService } from './services/gitlab.service';
import {
  OAuthService,
  JwksValidationHandler
} from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  public user:User;

  constructor(
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

}

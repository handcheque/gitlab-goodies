/**
 * Angular 2 decorators and services
 */
import { authConfig } from './auth.config';
import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppState } from './app.service';
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

  constructor(
    public appState: AppState,
    private oauthService: OAuthService,
    private httpClient: HttpClient
  ) {
    this.configureWithNewConfigApi();

  }

  private configureWithNewConfigApi() {

    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    //this.oauthService.loadDiscoveryDocumentAndTryLogin();

    // Optional
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.events.subscribe(e => {
      console.debug('oauth/oidc event', e);
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

  public logoff() {
    this.oauthService.logOut();
  }



  public ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }

}

/**
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */

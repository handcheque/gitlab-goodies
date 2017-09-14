import {
  Component,
  OnInit
} from '@angular/core';

import { OAuthService } from 'angular-oauth2-oidc';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { AppState } from '../app.service';
import { Title } from './title';
import { XLargeDirective } from './x-large';

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
  styleUrls: [ './home.component.css' ],
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
  public url = 'https://gitlab.handcheque-hq.com/api/v4';
  /**
   * TypeScript public modifiers
   */
  constructor(
    public appState: AppState,
    public title: Title,
    private oauthService: OAuthService,
    private httpClient: HttpClient
  ) {
    console.log(this.oauthService.getAccessToken());
    var headers = new HttpHeaders({
      "Authorization": "Bearer " + this.oauthService.getAccessToken()
    });
    this.httpClient.get(this.url + '/issues' , {
      headers: headers,
      responseType: 'json'
    }).subscribe((result) => console.log(result));
  }


  public login() {
    this.oauthService.initImplicitFlow();
  }

  public logoff() {
    this.oauthService.logOut();
  }

  public get name() {
    let claims = this.oauthService.getIdentityClaims();
    if (!claims) return null;
    return claims['given_name'];
  }

  public ngOnInit() {
    console.log('hello `Home` component');
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

// This api will come in the next version

import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {

  // Url of the Identity Provider
  loginUrl: 'https://gitlab.handcheque-hq.com/oauth/authorize',
  logoutUrl: 'https://gitlab.handcheque-hq.com/oauth/authorize',

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/',

  // URL of the SPA to redirect the user after silent refresh
  silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: '5ebe45ce7ca2bf1c6f95bcb693c67fc76e056a91d3fbb1c36a34054bae0c8c03',

  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  scope: 'api read_user',

  oidc: false,

  responseType: 'token',

  showDebugInformation: true,

  sessionChecksEnabled: true
}

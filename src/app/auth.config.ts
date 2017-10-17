// This api will come in the next version

import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {

  // Url of the Identity Provider
  loginUrl: process.env.API_URL + '/oauth/authorize',
  logoutUrl: process.env.API_URL + '/oauth/authorize',

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/',

  // URL of the SPA to redirect the user after silent refresh
  silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: process.env.API_KEY,

  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  scope: 'api read_user',

  oidc: false,

  responseType: 'token',

  showDebugInformation: true,

  sessionChecksEnabled: true
}

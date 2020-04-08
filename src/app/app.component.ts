import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService, AuthConfig, OAuthErrorEvent } from 'angular-oauth2-oidc';
import { SignatureValidationHandler } from './signature-validation-handler';

/* A private proxy server is required b/c ADFS and Azure AD do not support CORS */
export const PRIVATE_PROXY_SERVER: string = 'localhost:8080/';
export const TENANT_GUID: string = '20f62116-4d0c-44ac-8a45-390ca2765601';

export const authConfig: AuthConfig = {
  issuer: 'https://login.microsoftonline.com/' + TENANT_GUID + '/v2.0',
  redirectUri: window.location.origin,
  requestAccessToken: false,
  showDebugInformation: true,
  clientId: 'ba4f7616-e06a-4c5c-865a-625852d32623',
  strictDiscoveryDocumentValidation: false
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  raw = '';
  title = 'oidc-azure';

  constructor(private httpClient: HttpClient, private oauthService: OAuthService) {
    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new SignatureValidationHandler();

    /*
    * From this url: https://login.microsoftonline.com/<enter domain name>/v2.0/.well-known/openid-configuration
    * you can find the loginUrl and tokenEndpoint
     */

     this.oauthService.loadDiscoveryDocument( 'https://login.microsoftonline.com/20f62116-4d0c-44ac-8a45-390ca2765601/v2.0/.well-known/openid-configuration' ).then( doc => {
	    this.oauthService.tryLogin({
	    onTokenReceived: context => {

        console.log( this.oauthService.getIdTokenExpiration() );
            }
         })
    });

    this.oauthService.responseType = 'id_token';
    this.oauthService.scope = 'openid email profile';

    this.oauthService.loginUrl = 'https://login.microsoftonline.com/' + TENANT_GUID + '/oauth2/v2.0/authorize';

    this.oauthService.events.subscribe(event => {
      if (event instanceof OAuthErrorEvent) {
        console.error(event);
      } else {
        console.warn(event);
      }
    });
    this.oauthService.setupAutomaticSilentRefresh();
  }

  login() {
    this.oauthService.initImplicitFlow();
    console.log( this.oauthService.getIdToken() );
  }

  logout() {
    this.oauthService.logOut();
  }

  get givenName() {
    const claims = this.oauthService.
    getIdentityClaims();
    if (!claims) {
      return null;
    }
    return claims['name'];
  }

  get_private() {



    this.oauthService
      .silentRefresh()
      .then(info => console.debug('refresh ok', info))
      .catch(err => console.error('refresh error', err));

    console.log( this.oauthService.getIdToken() );

  }

}

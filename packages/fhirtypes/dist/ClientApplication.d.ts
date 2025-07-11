/*
 * This is a generated file
 * Do not edit manually.
 */

import { Attachment } from './Attachment';
import { Extension } from './Extension';
import { IdentityProvider } from './IdentityProvider';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';

/**
 * Medplum client application for automated access.
 */
export interface ClientApplication {

  /**
   * This is a ClientApplication resource
   */
  readonly resourceType: 'ClientApplication';

  /**
   * The logical id of the resource, as used in the URL for the resource.
   * Once assigned, this value never changes.
   */
  id?: string;

  /**
   * The metadata about the resource. This is content that is maintained by
   * the infrastructure. Changes to the content might not always be
   * associated with version changes to the resource.
   */
  meta?: Meta;

  /**
   * A reference to a set of rules that were followed when the resource was
   * constructed, and which must be understood when processing the content.
   * Often, this is a reference to an implementation guide that defines the
   * special rules along with other profiles etc.
   */
  implicitRules?: string;

  /**
   * The base language in which the resource is written.
   */
  language?: string;

  /**
   * A human-readable narrative that contains a summary of the resource and
   * can be used to represent the content of the resource to a human. The
   * narrative need not encode all the structured data, but is required to
   * contain sufficient detail to make it &quot;clinically safe&quot; for a human to
   * just read the narrative. Resource definitions may define what content
   * should be represented in the narrative to ensure clinical safety.
   */
  text?: Narrative;

  /**
   * These resources do not have an independent existence apart from the
   * resource that contains them - they cannot be identified independently,
   * and nor can they have their own independent transaction scope.
   */
  contained?: Resource[];

  /**
   * May be used to represent additional information that is not part of
   * the basic definition of the resource. To make the use of extensions
   * safe and manageable, there is a strict set of governance  applied to
   * the definition and use of extensions. Though any implementer can
   * define an extension, there is a set of requirements that SHALL be met
   * as part of the definition of the extension.
   */
  extension?: Extension[];

  /**
   * May be used to represent additional information that is not part of
   * the basic definition of the resource and that modifies the
   * understanding of the element that contains it and/or the understanding
   * of the containing element's descendants. Usually modifier elements
   * provide negation or qualification. To make the use of extensions safe
   * and manageable, there is a strict set of governance applied to the
   * definition and use of extensions. Though any implementer is allowed to
   * define an extension, there is a set of requirements that SHALL be met
   * as part of the definition of the extension. Applications processing a
   * resource are required to check for modifier extensions.
   *
   * Modifier extensions SHALL NOT change the meaning of any elements on
   * Resource or DomainResource (including cannot change the meaning of
   * modifierExtension itself).
   */
  modifierExtension?: Extension[];

  /**
   * The client application status. The status is active by default. The
   * status can be set to error to indicate that the client application is
   * not working properly. The status can be set to off to indicate that
   * the client application is no longer in use.
   */
  status?: 'active' | 'off' | 'error';

  /**
   * A name associated with the ClientApplication.
   */
  name?: string;

  /**
   * A summary, characterization or explanation of the ClientApplication.
   */
  description?: string;

  /**
   * Custom values for the Log In form.
   */
  signInForm?: ClientApplicationSignInForm;

  /**
   * Client secret string used to verify the identity of a client.
   */
  secret?: string;

  /**
   * Old version of the client secret that is being rotated out.  Instances
   * of the client using this value should update to use the value in
   * ClientApplication.secret
   */
  retiringSecret?: string;

  /**
   * Optional JWKS URI for public key verification of JWTs issued by the
   * authorization server (client_secret_jwt).
   */
  jwksUri?: string;

  /**
   * Optional redirect URI used when redirecting a client back to the
   * client application.
   */
  redirectUri?: string;

  /**
   * Optional launch URI for SMART EHR launch sequence.
   */
  launchUri?: string;

  /**
   * Flag to make PKCE optional for this client application. PKCE is
   * required by default for compliance with Smart App Launch. It can be
   * disabled for compatibility with legacy client applications.
   */
  pkceOptional?: boolean;

  /**
   * Optional external Identity Provider (IdP) for the client application.
   */
  identityProvider?: IdentityProvider;

  /**
   * Optional configuration to set the access token duration
   */
  accessTokenLifetime?: string;

  /**
   * Optional configuration to set the refresh token duration
   */
  refreshTokenLifetime?: string;

  /**
   * Optional CORS allowed origin for the client application.  By default,
   * all origins are allowed.
   */
  allowedOrigin?: string[];

  /**
   * Optional default OAuth scope for the client application. This scope is
   * used when the client application does not specify a scope in the
   * authorization request.
   */
  defaultScope?: string[];
}

/**
 * Custom values for the Log In form.
 */
export interface ClientApplicationSignInForm {

  /**
   * Welcome string for the Log In Form.
   */
  welcomeString?: string;

  /**
   * Logo for the Log In Form.
   */
  logo?: Attachment;
}

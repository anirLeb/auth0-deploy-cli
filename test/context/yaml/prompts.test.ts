import fs from 'fs-extra';
import path from 'path';
import { expect } from 'chai';

import Context from '../../../src/context/yaml';
import promptsHandler from '../../../src/context/yaml/handlers/prompts';
import { cleanThenMkdir, testDataDir, mockMgmtClient } from '../../utils';

describe('#YAML context prompts', () => {
  it('should process prompts', async () => {
    const dir = path.join(testDataDir, 'yaml', 'prompts');
    cleanThenMkdir(dir);

    const yaml = `
      prompts:
        identifier_first: true
        universal_login_experience: classic
        customText:
          en:
            login:
              login:
                description: text in english
                title: this is title
                buttonText: Button text
            mfa:
              mfa-detect-browser-capabilities:
                pickAuthenticatorText: "Try another method"
                reloadButtonText: "Reload"
                noJSErrorTitle: "JavaScript Required"
              mfa-login-options:
                pageTitle: "Log in to \${clientName}"
                backText: "Go back"
                title: "Other Methods"
                authenticatorNamesSMS: "SMS"
              mfa-enroll-result:
                pageTitle: "Secure Your Account"
                enrolledTitle: "You're All Set!"
                enrolledDescription: "You have successfully added a new authentication factor."
                invalidTicketTitle: "Invalid Link"
              mfa-begin-enroll-options:
                pageTitle: "Log in to \${clientName}"
                backText: "Go back"
                title: "Keep Your Account Safe"
            signup-password:
              signup-password:
                buttonText: Continue signup password
                description: Set your password for \${companyName} to continue to \${clientName}
                editEmailText: Edit
                editLinkScreenReadableText: Edit email address
                emailPlaceholder: Email address
                federatedConnectionButtonText: Continue with \${connectionName}
                footerLinkText: Log in
                footerText: Already have an account?
                invitationDescription: >-
                  Sign Up to accept \${inviterName}'s invitation to join \${companyName}
                  on \${clientName}.
                loginActionLinkText: \${footerLinkText}
                loginActionText: \${footerText}
                logoAltText: \${companyName}
                pageTitle: Create a password to sign up | \${clientName}
                passwordPlaceholder: Password
                passwordSecurityText: 'Your password must contain:'
                title: Create Your Account!
                usernamePlaceholder: Username
    `;

    const yamlFile = path.join(dir, 'config.yaml');
    fs.writeFileSync(yamlFile, yaml);

    const config = { AUTH0_INPUT_FILE: yamlFile };
    const context = new Context(config, mockMgmtClient());
    await context.loadAssetsFromLocal();

    expect(context.assets.prompts).to.deep.equal({
      customText: {
        en: {
          login: {
            login: {
              buttonText: 'Button text',
              description: 'text in english',
              title: 'this is title',
            },
          },
          mfa: {
            'mfa-begin-enroll-options': {
              backText: 'Go back',
              pageTitle: 'Log in to ${clientName}',
              title: 'Keep Your Account Safe',
            },
            'mfa-detect-browser-capabilities': {
              noJSErrorTitle: 'JavaScript Required',
              pickAuthenticatorText: 'Try another method',
              reloadButtonText: 'Reload',
            },
            'mfa-enroll-result': {
              enrolledDescription: 'You have successfully added a new authentication factor.',
              enrolledTitle: "You're All Set!",
              invalidTicketTitle: 'Invalid Link',
              pageTitle: 'Secure Your Account',
            },
            'mfa-login-options': {
              authenticatorNamesSMS: 'SMS',
              backText: 'Go back',
              pageTitle: 'Log in to ${clientName}',
              title: 'Other Methods',
            },
          },
          'signup-password': {
            'signup-password': {
              buttonText: 'Continue signup password',
              description: 'Set your password for ${companyName} to continue to ${clientName}',
              editEmailText: 'Edit',
              editLinkScreenReadableText: 'Edit email address',
              emailPlaceholder: 'Email address',
              federatedConnectionButtonText: 'Continue with ${connectionName}',
              footerLinkText: 'Log in',
              footerText: 'Already have an account?',
              invitationDescription:
                "Sign Up to accept ${inviterName}'s invitation to join ${companyName} on ${clientName}.",
              loginActionLinkText: '${footerLinkText}',
              loginActionText: '${footerText}',
              logoAltText: '${companyName}',
              pageTitle: 'Create a password to sign up | ${clientName}',
              passwordPlaceholder: 'Password',
              passwordSecurityText: 'Your password must contain:',
              title: 'Create Your Account!',
              usernamePlaceholder: 'Username',
            },
          },
        },
      },
      identifier_first: true,
      universal_login_experience: 'classic',
    });
  });

  it('should dump prompts settings and prompts custom text', async () => {
    const context = new Context({ AUTH0_INPUT_FILE: './test.yml' }, mockMgmtClient());
    context.assets.prompts = {
      universal_login_experience: 'classic',
      identifier_first: true,
      customText: {
        en: {
          login: {
            login: {
              buttonText: 'English login button text',
              description: 'English login description',
            },
          },
          mfa: {
            'mfa-begin-enroll-options': {
              title: 'Keep Your Account Safe',
            },
            'mfa-detect-browser-capabilities': {
              noJSErrorTitle: 'JavaScript Required',
            },
            'mfa-enroll-result': {
              enrolledDescription: 'You have successfully added a new authentication factor.',
            },
            'mfa-login-options': {
              title: 'Other Methods',
            },
          },
        },
        fr: {
          login: {
            login: {
              buttonText: 'French login button text',
              description: 'French login description',
            },
          },
        },
      },
    };

    const dumped = await promptsHandler.dump(context);
    expect(dumped).to.deep.equal({ prompts: context.assets.prompts });
  });
});

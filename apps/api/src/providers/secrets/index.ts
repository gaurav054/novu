import { EmailProviderIdEnum } from '@novu/shared';
import { MailtrapAccountId, MailtrapApiKey, MailtrapInboxId } from '@novu/testing';
import axios from 'axios';

export interface IMailtrapSecrets {
  accountId: MailtrapAccountId;
  apiKey: MailtrapApiKey;
  inboxId: MailtrapInboxId;
}

const getDopplerSecrets = async () => {
  const response = await axios.get(
    `https://${process.env.DOPPLER_TOKEN}@api.doppler.com/v3/configs/config/secrets/download?format=json`
  );

  return response.data;
};

export const injectDopplerSecrets = async (): Promise<void> => {
  const dopplerSecrets = await getDopplerSecrets();

  const providerSecrets = Object.entries(dopplerSecrets).filter((dopplerSecret): boolean => {
    return dopplerSecret[0].startsWith('REGRESSION_');
  });

  for (const [key, value] of providerSecrets) {
    process.env[key] = `${value}`;
  }
};

export const getMailtrapSecrets = (): IMailtrapSecrets => {
  const accountId = Number(process.env.REGRESSION_MAILTRAP_ACCOUNT_ID);
  const apiKey = process.env.REGRESSION_MAILTRAP_API_KEY;
  const inboxId = Number(process.env.REGRESSION_MAILTRAP_INBOX_ID);

  if (!accountId || !apiKey || !inboxId) {
    throw new Error('Missing any Mailtrap.io secrets');
  }

  return {
    accountId,
    apiKey,
    inboxId,
  };
};

export const getProviderSecrets = (providerId: EmailProviderIdEnum): Record<string, string> => {
  const providers = {
    [EmailProviderIdEnum.CustomSMTP]: {
      host: process.env.REGRESSION_CUSTOM_SMTP_HOST,
      port: process.env.REGRESSION_CUSTOM_SMTP_PORT,
      user: process.env.REGRESSION_CUSTOM_SMTP_USERNAME,
      password: process.env.REGRESSION_CUSTOM_SMTP_PASSWORD,
    },
    [EmailProviderIdEnum.Mailjet]: {
      apiKey: process.env.REGRESSION_MAILJET_API_KEY,
      secretKey: process.env.REGRESSION_MAILJET_API_SECRET,
    },
    [EmailProviderIdEnum.Novu]: {
      apiKey: process.env.REGRESSION_NOVU_API_KEY,
    },
    [EmailProviderIdEnum.SendGrid]: {
      apiKey: process.env.REGRESSION_SENDGRID_API_KEY,
    },
    [EmailProviderIdEnum.Sendinblue]: {
      apiKey: process.env.REGRESSION_SENDINBLUE_API_KEY,
    },
  };

  const secrets = providers[providerId];

  if (!secrets) {
    throw new Error(`Missing secrets for provider ${providerId} in regression test suite`);
  }

  return secrets;
};
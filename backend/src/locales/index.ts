import { environment } from '@app/config';
import * as dotenv from 'dotenv';
import { I18n } from 'i18n';

dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

const i18nConfigurations = {
  locales: environment.appLang.split(','),
  directory: `${__dirname}/`,
  languageHeaderField: 'lan',
  defaultLocale: environment.appLang.split(',')[0],
  autoReload: true,
  updateFiles: false,
};
const i18n = new I18n(i18nConfigurations);

export default i18n;

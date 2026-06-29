/** Strongly-type the t() function against the EN dictionary shape. */
import 'i18next';
import type { TranslationDict } from './en';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationDict;
    };
  }
}

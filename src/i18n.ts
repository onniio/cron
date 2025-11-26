import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LangStorageKey = 'cron_lang';

function getQueryLang(): 'zh-CN' | 'en' | null {
  try {
    const v = new URL(window.location.href).searchParams.get('lang');
    if (v === 'zh-CN' || v === 'en') return v;
  } catch {}
  return null;
}

const resources = {
  'zh-CN': {
    translation: {
      appName: 'Cron Guru',
      title: 'Cron 表达式解释器',
      subtitle: '校验 Cron 规则，输出自然语言说明，并预览未来触发时间。',
      examples: '示例',
      back: '返回',

      cronExpression: 'Cron 表达式',
      timezone: '时区',
      next: '未来次数',
      dialect: '方言',
      normalized: '规范化结果',
      description: '自然语言说明',
      nextRuns: '未来触发时间',
      shareUrl: '分享链接',
      copy: '复制',
      copied: '已复制',
      validationError: '校验错误',
      emptyExpression: '表达式不能为空。',
      domDowWarn: '注意：在经典 crontab 中，"每月几号"和"星期几"是 OR 关系（满足其一即可触发）。',

      language: '语言',
      theme: '主题',
      dark: '深色',
      light: '浅色',
      zh: '中文',
      en: 'English',

      fields: '字段数',
      fieldHint: 'minute hour dom month dow'
    }
  },
  en: {
    translation: {
      appName: 'Cron Guru',
      title: 'Cron expression interpreter',
      subtitle: 'Validate cron schedules, translate them into plain language, and preview the next run times.',
      examples: 'Examples',
      back: 'Back',

      cronExpression: 'Cron Expression',
      timezone: 'Timezone',
      next: 'Next',
      dialect: 'Dialect',
      normalized: 'Normalized',
      description: 'Description',
      nextRuns: 'Next Runs',
      shareUrl: 'Shareable URL',
      copy: 'Copy',
      copied: 'Copied',
      validationError: 'Validation Error',
      emptyExpression: 'Empty expression.',
      domDowWarn: 'Note: In classic crontab, day-of-month and day-of-week are ORed (either match can trigger).',

      language: 'Language',
      theme: 'Theme',
      dark: 'Dark',
      light: 'Light',
      zh: '中文',
      en: 'English',

      fields: 'fields',
      fieldHint: 'minute hour dom month dow'
    }
  }
} as const;

const queryLang = getQueryLang();
const savedLang = localStorage.getItem(LangStorageKey);
const initialLng = (queryLang || (savedLang === 'en' ? 'en' : savedLang === 'zh-CN' ? 'zh-CN' : null) || 'zh-CN');

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false }
});

export default i18n;

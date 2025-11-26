import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const STORAGE_KEY = 'cron_lang';

const resources = {
  'zh-CN': {
    translation: {
      title: 'Cron 表达式解释器',
      subtitle: '校验 Cron 规则，输出自然语言说明，并预览未来触发时间。',
      cronExpression: 'Cron 表达式',
      timezone: '时区',
      next: '未来次数',
      dialect: '方言',
      normalized: '规范化结果',
      description: '自然语言说明',
      nextRuns: '未来触发时间',
      examples: '示例',
      back: '返回',
      shareUrl: '分享链接',
      copy: '复制',
      validationError: '校验错误',
      emptyExpression: '表达式不能为空。',
      domDowWarn: '注意：在经典 crontab 中，“每月几号”和“星期几”是 OR 关系（满足其一即可触发）。',
      theme: '主题',
      language: '语言',
      dark: '深色',
      light: '浅色',
      en: 'English',
      zh: '中文'
    }
  },
  'en': {
    translation: {
      title: 'Cron expression interpreter',
      subtitle: 'Validate cron schedules, translate them into plain language, and preview the next run times.',
      cronExpression: 'Cron Expression',
      timezone: 'Timezone',
      next: 'Next',
      dialect: 'Dialect',
      normalized: 'Normalized',
      description: 'Description',
      nextRuns: 'Next Runs',
      examples: 'Examples',
      back: 'Back',
      shareUrl: 'Shareable URL',
      copy: 'Copy',
      validationError: 'Validation Error',
      emptyExpression: 'Empty expression.',
      domDowWarn: 'Note: In classic crontab, day-of-month and day-of-week are ORed (either match can trigger).',
      theme: 'Theme',
      language: 'Language',
      dark: 'Dark',
      light: 'Light',
      en: 'English',
      zh: '中文'
    }
  }
};

const saved = localStorage.getItem(STORAGE_KEY);
const initialLng = saved || 'zh-CN'; 

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false }
});

export const LangStorageKey = STORAGE_KEY;
export default i18n;

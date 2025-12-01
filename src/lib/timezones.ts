export interface TimezoneInfo {
  value: string;
  label: string;
  offset: string;
  region: string;
}

export const TIMEZONES: TimezoneInfo[] = [
  // 亚洲
  { value: 'Asia/Shanghai', label: '中国标准时间 (北京)', offset: 'UTC+8', region: '亚洲' },
  { value: 'Asia/Hong_Kong', label: '香港时间', offset: 'UTC+8', region: '亚洲' },
  { value: 'Asia/Tokyo', label: '日本标准时间 (东京)', offset: 'UTC+9', region: '亚洲' },
  { value: 'Asia/Seoul', label: '韩国标准时间 (首尔)', offset: 'UTC+9', region: '亚洲' },
  { value: 'Asia/Singapore', label: '新加坡时间', offset: 'UTC+8', region: '亚洲' },
  { value: 'Asia/Kolkata', label: '印度标准时间 (加尔各答)', offset: 'UTC+5:30', region: '亚洲' },
  { value: 'Asia/Dubai', label: '阿联酋时间 (迪拜)', offset: 'UTC+4', region: '亚洲' },
  { value: 'Asia/Bangkok', label: '泰国时间 (曼谷)', offset: 'UTC+7', region: '亚洲' },
  
  // 欧洲
  { value: 'Europe/London', label: '英国时间 (伦敦)', offset: 'UTC+0', region: '欧洲' },
  { value: 'Europe/Paris', label: '中欧时间 (巴黎)', offset: 'UTC+1', region: '欧洲' },
  { value: 'Europe/Berlin', label: '中欧时间 (柏林)', offset: 'UTC+1', region: '欧洲' },
  { value: 'Europe/Moscow', label: '莫斯科时间', offset: 'UTC+3', region: '欧洲' },
  { value: 'Europe/Rome', label: '中欧时间 (罗马)', offset: 'UTC+1', region: '欧洲' },
  { value: 'Europe/Madrid', label: '中欧时间 (马德里)', offset: 'UTC+1', region: '欧洲' },
  
  // 美洲
  { value: 'America/New_York', label: '美国东部时间 (纽约)', offset: 'UTC-5', region: '美洲' },
  { value: 'America/Chicago', label: '美国中部时间 (芝加哥)', offset: 'UTC-6', region: '美洲' },
  { value: 'America/Denver', label: '美国山地时间 (丹佛)', offset: 'UTC-7', region: '美洲' },
  { value: 'America/Los_Angeles', label: '美国太平洋时间 (洛杉矶)', offset: 'UTC-8', region: '美洲' },
  { value: 'America/Toronto', label: '加拿大东部时间 (多伦多)', offset: 'UTC-5', region: '美洲' },
  { value: 'America/Sao_Paulo', label: '巴西时间 (圣保罗)', offset: 'UTC-3', region: '美洲' },
  { value: 'America/Mexico_City', label: '墨西哥时间 (墨西哥城)', offset: 'UTC-6', region: '美洲' },
  
  // 大洋洲
  { value: 'Australia/Sydney', label: '澳大利亚东部时间 (悉尼)', offset: 'UTC+10', region: '大洋洲' },
  { value: 'Australia/Melbourne', label: '澳大利亚东部时间 (墨尔本)', offset: 'UTC+10', region: '大洋洲' },
  { value: 'Australia/Perth', label: '澳大利亚西部时间 (珀斯)', offset: 'UTC+8', region: '大洋洲' },
  { value: 'Pacific/Auckland', label: '新西兰时间 (奥克兰)', offset: 'UTC+12', region: '大洋洲' },
  
  // 非洲
  { value: 'Africa/Cairo', label: '东非时间 (开罗)', offset: 'UTC+2', region: '非洲' },
  { value: 'Africa/Johannesburg', label: '南非时间 (约翰内斯堡)', offset: 'UTC+2', region: '非洲' },
  { value: 'Africa/Lagos', label: '西非时间 (拉各斯)', offset: 'UTC+1', region: '非洲' },
  
  // UTC
  { value: 'UTC', label: '协调世界时 (UTC)', offset: 'UTC+0', region: 'UTC' },
];

export const getTimezoneByValue = (value: string): TimezoneInfo | undefined => {
  return TIMEZONES.find(tz => tz.value === value);
};

export const getTimezonesByRegion = (region: string): TimezoneInfo[] => {
  return TIMEZONES.filter(tz => tz.region === region);
};

export const getDefaultTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai';
  } catch {
    return 'Asia/Shanghai';
  }
};

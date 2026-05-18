import type {CompanyProfile} from './types';

export const companyProfiles: CompanyProfile[] = [
  {id: 'openai', name: 'OpenAI', accent: '#139a74', logoMark: 'openai'},
  {id: 'anthropic', name: 'Anthropic', accent: '#d38b14', logoMark: 'anthropic'},
  {id: 'google', name: 'Google', accent: '#2d6ed8', logoMark: 'google'},
  {id: 'xai', name: 'xAI', accent: '#777f90', logoMark: 'xai'},
  {id: 'tesla', name: 'Tesla', accent: '#b92f3a', logoMark: 'tesla'},
  {id: 'figure', name: 'Figure', accent: '#8d95a8', logoMark: 'figure'},
  {id: 'cursor', name: 'Cursor', accent: '#7c9cf0'},
  {id: 'deepseek', name: 'DeepSeek', accent: '#4d8bd6', logoMark: 'deepseek'},
  {id: 'qwen', name: 'Alibaba', accent: '#8c79d6'},
  {id: 'moonshot-kimi', name: 'Moonshot AI', accent: '#56a3a6'},
  {id: 'zhipu-glm', name: 'Zhipu AI', accent: '#c78f38'},
  {id: 'mistral-ai', name: 'Mistral AI', accent: '#ff9f1c'},
  {id: 'midjourney', name: 'Midjourney', accent: '#c0537a'},
  {id: 'stability-ai', name: 'Stability AI', accent: '#6b8e4e'},
  {id: 'black-forest-labs', name: 'Black Forest Labs', accent: '#7b6bd6'},
  {id: 'runway-video', name: 'Runway', accent: '#d7d0c3'},
  {id: 'luma-ai', name: 'Luma AI', accent: '#58a9c7'},
  {id: 'pika-labs', name: 'Pika', accent: '#e39b4d'},
  {id: 'kuaishou-kling', name: 'Kuaishou', accent: '#c75c4f'},
  {id: 'bytedance-seedance', name: 'ByteDance', accent: '#5f75d6'},
  {id: 'tencent-hunyuan-3d', name: 'Tencent', accent: '#327ec7'},
  {id: 'tripo-ai', name: 'Tripo AI', accent: '#d15f45'},
];

export const companyProfilesById = companyProfiles.reduce<Record<string, CompanyProfile>>((profiles, profile) => {
  profiles[profile.id] = profile;
  return profiles;
}, {});

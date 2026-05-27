import type {CompanyProfile} from './types';

export const companyProfiles: CompanyProfile[] = [
  {id: 'openai', name: 'OpenAI', accent: '#139a74', logoMark: 'openai', raceRank: 1},
  {id: 'anthropic', name: 'Anthropic', accent: '#d38b14', logoMark: 'anthropic', raceRank: 2},
  {id: 'google', name: 'Google', accent: '#2d6ed8', logoMark: 'google', raceRank: 3},
  {id: 'xai', name: 'xAI', accent: '#777f90', logoMark: 'xai', raceRank: 4},
  {id: 'cursor', name: 'Cursor', accent: '#7c9cf0', logoMark: 'cursor', raceRank: 5},
  {id: 'deepseek', name: 'DeepSeek', accent: '#4d8bd6', logoMark: 'deepseek', raceRank: 6},
  {id: 'mistral-ai', name: 'Mistral AI', accent: '#ff9f1c', raceRank: 7},
  {id: 'moonshot-kimi', name: 'Moonshot AI', accent: '#56a3a6', raceRank: 8},
  {id: 'qwen', name: 'Alibaba', accent: '#8c79d6', raceRank: 9},
  {id: 'zhipu-glm', name: 'Zhipu AI', accent: '#c78f38', raceRank: 10},
  {id: 'tesla', name: 'Tesla', accent: '#b92f3a', logoMark: 'tesla', raceRank: 20},
  {id: 'figure', name: 'Figure', accent: '#8d95a8', logoMark: 'figure', raceRank: 21},
  {id: 'waymo', name: 'Waymo', accent: '#19a87d', raceRank: 22},
  {id: 'zoox', name: 'Zoox', accent: '#8f6bd6', raceRank: 23},
  {id: 'midjourney', name: 'Midjourney', accent: '#c0537a', raceRank: 30},
  {id: 'stability-ai', name: 'Stability AI', accent: '#6b8e4e', raceRank: 31},
  {id: 'black-forest-labs', name: 'Black Forest Labs', accent: '#7b6bd6', raceRank: 32},
  {id: 'runway-video', name: 'Runway', accent: '#d7d0c3', raceRank: 33},
  {id: 'luma-ai', name: 'Luma AI', accent: '#58a9c7', raceRank: 34},
  {id: 'pika-labs', name: 'Pika', accent: '#e39b4d', raceRank: 35},
  {id: 'kuaishou-kling', name: 'Kuaishou', accent: '#c75c4f', raceRank: 36},
  {id: 'bytedance-seedance', name: 'ByteDance', accent: '#5f75d6', raceRank: 37},
  {id: 'tencent-hunyuan-3d', name: 'Tencent', accent: '#327ec7', raceRank: 38},
  {id: 'tripo-ai', name: 'Tripo AI', accent: '#d15f45', raceRank: 39},
  {id: 'lightricks', name: 'Lightricks', accent: '#4f9f8a', raceRank: 40},
];

export const companyProfilesById = companyProfiles.reduce<Record<string, CompanyProfile>>((profiles, profile) => {
  profiles[profile.id] = profile;
  return profiles;
}, {});

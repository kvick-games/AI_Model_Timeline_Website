export type ModelClassId =
  | 'frontier-llms'
  | 'open-source-llms'
  | 'image-generation'
  | 'video-generation'
  | '3d-generation'
  | 'coding-harnesses'
  | 'events'
  | 'robotics'
  | 'vehicle-autonomy';

export type PresetId =
  | 'frontier-llms'
  | 'chinese-open-source'
  | 'mistral'
  | 'image-generation'
  | 'video-generation'
  | '3d-generation'
  | 'coding-harnesses'
  | 'events'
  | 'robotics'
  | 'vehicle-autonomy';

export type PresetConfig = {
  id: PresetId;
  classId: ModelClassId;
  label: string;
  description: string;
};

export type TimelineEventKind = 'release' | 'event';

export type TimelineEventTypeId =
  | 'model-release'
  | 'product-launch'
  | 'research-release'
  | 'announcement'
  | 'public-demo'
  | 'deployment'
  | 'livestream';

export type TimelineEventTypeConfig = {
  id: TimelineEventTypeId;
  kind: TimelineEventKind;
  label: string;
  shortLabel: string;
  description: string;
};

export type ReleaseRecord = {
  articleSlug?: string;
  classes?: ModelClassId[];
  endDate?: string;
  eventType?: TimelineEventTypeId;
  name: string;
  presets?: PresetId[];
  date: string;
};

export type ProductLineId = string;
export type ProductMarkerShape = 'circle' | 'square' | 'diamond';

export type ProductLineConfig = {
  id: ProductLineId;
  label: string;
  shortLabel: string;
  classId: ModelClassId;
  markerShape: ProductMarkerShape;
};

export type ProductLineRecord = ProductLineConfig & {
  defaultClasses?: ModelClassId[];
  defaultPresets?: PresetId[];
  releases: ReleaseRecord[];
};

export type ArticleLogoMark =
  | 'anthropic'
  | 'claude'
  | 'deepseek'
  | 'gemini'
  | 'generic'
  | 'google'
  | 'gpt'
  | 'openai'
  | 'figure'
  | 'tesla'
  | 'sora'
  | 'xai';

export type CompanyProfile = {
  id: string;
  name: string;
  accent: string;
  logoMark?: ArticleLogoMark;
};

export type CompanyRecord = CompanyProfile & {
  defaultClasses: ModelClassId[];
  defaultPresets: PresetId[];
  productLines: ProductLineRecord[];
};

export type ProcessedRelease = ReleaseRecord & {
  articleSlug: string;
  classes: ModelClassId[];
  dateLabel: string;
  dateRangeLabel: string;
  durationDays: number;
  endDateLabel?: string;
  endGlobalDay: number;
  eventKind: TimelineEventKind;
  eventType: TimelineEventTypeId;
  eventTypeLabel: string;
  eventTypeShortLabel: string;
  globalDay: number;
  gap: number;
  presets: PresetId[];
};

export type ProcessedProductLine = Omit<ProductLineRecord, 'releases'> & {
  averageGap: number | null;
  latestRelease: ProcessedRelease | null;
  releases: ProcessedRelease[];
  startDay: number;
  totalSpan: number;
};

export type ProcessedCompany = Omit<CompanyRecord, 'productLines'> & {
  averageGap: number | null;
  latestProductLine: ProcessedProductLine | null;
  latestRelease: ProcessedRelease | null;
  productLines: ProcessedProductLine[];
  startDay: number;
  totalSpan: number;
};

export type ArticleFact = {
  label: string;
  value: string;
};

export type ArticleSection = {
  heading: string;
  body: string[];
};

export type ArticleSource = {
  label: string;
  url: string;
};

export type ArticleMedia = {
  alt: string;
  caption?: string;
  src: string;
};

export type ModelLogo = {
  modelLabel: string;
  modelMark: ArticleLogoMark;
};

export type ModelArticle = {
  slug: string;
  release: {
    companyId: string;
    productLineId: string;
    name: string;
    date: string;
    endDate?: string;
  };
  logo: ModelLogo;
  eyebrow: string;
  title: string;
  dek: string;
  summary: string;
  impact: string;
  media?: ArticleMedia;
  facts: ArticleFact[];
  sections: ArticleSection[];
  sources: ArticleSource[];
};

export type ModelReleaseIndexEntry = {
  accent: string;
  article: ModelArticle | null;
  classes: ModelClassId[];
  companyLogoMark: ArticleLogoMark;
  companyId: string;
  companyName: string;
  date: string;
  dateLabel: string;
  dateRangeLabel: string;
  durationDays: number;
  endDate?: string;
  endDateLabel?: string;
  eventKind: TimelineEventKind;
  eventType: TimelineEventTypeId;
  eventTypeLabel: string;
  eventTypeShortLabel: string;
  name: string;
  nextName: string | null;
  nextSlug: string | null;
  presets: PresetId[];
  previousName: string | null;
  previousSlug: string | null;
  productLineId: string;
  productLineLabel: string;
  productLineShortLabel: string;
  slug: string;
};

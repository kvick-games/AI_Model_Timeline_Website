import {
  companies,
  formatTimelineDate,
  formatTimelineDateRange,
  getReleaseClasses,
  getReleaseEventType,
  getReleasePresets,
  getReleaseSlug,
  parseTimelineDate,
} from './timeline';
import {modelArticlesBySlug} from './modelArticles';
import type {ModelReleaseIndexEntry} from './types';

function buildModelReleaseIndex() {
  const entries: ModelReleaseIndexEntry[] = [];

  companies.forEach((company) => {
    company.productLines.forEach((productLine) => {
      const sortedReleases = [...productLine.releases].sort(
        (left, right) => parseTimelineDate(left.date).getTime() - parseTimelineDate(right.date).getTime(),
      );
      const releaseSlugs = sortedReleases.map((release) => getReleaseSlug(company.id, productLine.id, release));

      sortedReleases.forEach((release, releaseIndex) => {
        const slug = releaseSlugs[releaseIndex];
        const eventType = getReleaseEventType(release);
        const startDate = parseTimelineDate(release.date);
        const endDate = release.endDate ? parseTimelineDate(release.endDate) : startDate;
        const durationDays = Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())
          ? 1
          : Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

        entries.push({
          accent: company.accent,
          article: modelArticlesBySlug[slug] ?? null,
          classes: getReleaseClasses(company, productLine, release),
          companyLogoMark: company.logoMark ?? 'generic',
          companyId: company.id,
          companyName: company.name,
          date: release.date,
          dateLabel: formatTimelineDate(release.date),
          dateRangeLabel: formatTimelineDateRange(release.date, release.endDate),
          durationDays,
          endDate: release.endDate,
          endDateLabel: release.endDate ? formatTimelineDate(release.endDate) : undefined,
          eventKind: eventType.kind,
          eventType: eventType.id,
          eventTypeLabel: eventType.label,
          eventTypeShortLabel: eventType.shortLabel,
          name: release.name,
          nextName: sortedReleases[releaseIndex + 1]?.name ?? null,
          nextSlug: releaseSlugs[releaseIndex + 1] ?? null,
          presets: getReleasePresets(company, productLine, release),
          previousName: sortedReleases[releaseIndex - 1]?.name ?? null,
          previousSlug: releaseSlugs[releaseIndex - 1] ?? null,
          productLineId: productLine.id,
          productLineLabel: productLine.label,
          productLineShortLabel: productLine.shortLabel,
          slug,
        });
      });
    });
  });

  return entries;
}

export const modelReleaseIndex = buildModelReleaseIndex();

export const modelReleaseIndexBySlug = modelReleaseIndex.reduce<Record<string, ModelReleaseIndexEntry>>(
  (entries, entry) => {
    entries[entry.slug] = entry;
    return entries;
  },
  {},
);

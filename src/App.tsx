import {useLayoutEffect, useMemo, useState} from 'react';
import {TimelineExperience} from '@kvick-games/timeline-library';
import {Banknote} from 'lucide-react';
import {createPortal} from 'react-dom';
import {aiTimelineDefinition} from './data/aiTimelineDefinition';
import {modelReleaseIndex} from './data/releaseIndex';
import {
  formatTokenPricingBadge,
  formatTokenPricingFact,
  getTokenPricingTier,
  tokenPricingBySlug,
} from './data/tokenPricing';

const COST_OVERLAY_STORAGE_KEY = 'ai-timeline-cost-overlay';
const FILTER_PANEL_SELECTOR = '[data-filter-panel]';
const FILTER_PANEL_TOGGLE_HOST_ATTRIBUTE = 'data-token-cost-filter-toggle-host';
const TIMELINE_PIN_SELECTOR = 'button[data-timeline-pin]';
const TOKEN_COST_BADGE_SELECTOR = '[data-token-cost-badge]';

type PinCostAnnotation = {
  label: string;
  tier: string;
  title: string;
};

function getInitialCostOverlayState() {
  if (typeof window === 'undefined') {
    return false;
  }

  const savedValue = window.localStorage.getItem(COST_OVERLAY_STORAGE_KEY);
  return savedValue === null ? false : savedValue === 'on';
}

function clearCostAttributes(pin: HTMLButtonElement) {
  pin.removeAttribute('data-token-cost-label');
  pin.removeAttribute('data-token-cost-tier');
  pin.removeAttribute('data-token-cost-title');
  pin.querySelector(TOKEN_COST_BADGE_SELECTOR)?.remove();
}

function syncCostBadge(pin: HTMLButtonElement, label: string) {
  let badge = pin.querySelector<HTMLSpanElement>(TOKEN_COST_BADGE_SELECTOR);

  if (!badge) {
    badge = document.createElement('span');
    badge.setAttribute('data-token-cost-badge', '');
    badge.setAttribute('aria-hidden', 'true');

    const icon = document.createElement('span');
    icon.setAttribute('data-token-cost-badge-icon', '');
    icon.textContent = '$';

    const labelElement = document.createElement('span');
    labelElement.setAttribute('data-token-cost-badge-label', '');

    badge.append(icon, labelElement);
    pin.appendChild(badge);
  }

  const labelElement = badge.querySelector<HTMLSpanElement>('[data-token-cost-badge-label]');

  if (labelElement) {
    labelElement.textContent = label;
  }
}

function TimelineCostOverlay({enabled}: {enabled: boolean}) {
  const annotationsByAriaLabel = useMemo(() => {
    const annotations = new Map<string, PinCostAnnotation>();

    modelReleaseIndex.forEach((entry) => {
      const pricing = tokenPricingBySlug[entry.slug];

      if (!pricing) {
        return;
      }

      const annotation = {
        label: formatTokenPricingBadge(pricing),
        tier: getTokenPricingTier(pricing),
        title: formatTokenPricingFact(pricing),
      };
      const eventNoun = entry.eventKind === 'event' ? 'event' : 'release';

      annotations.set(`Open ${eventNoun} for ${entry.name}, ${entry.dateRangeLabel}`, annotation);
      annotations.set(`Open release for ${entry.name}, ${entry.dateRangeLabel}`, annotation);
    });

    return annotations;
  }, []);

  useLayoutEffect(() => {
    let animationFrame = 0;

    const annotatePins = () => {
      document.querySelectorAll<HTMLButtonElement>(TIMELINE_PIN_SELECTOR).forEach((pin) => {
        const ariaLabel = pin.getAttribute('aria-label');
        const annotation = ariaLabel ? annotationsByAriaLabel.get(ariaLabel) : undefined;

        if (!enabled || !annotation) {
          clearCostAttributes(pin);
          return;
        }

        pin.setAttribute('data-token-cost-label', annotation.label);
        pin.setAttribute('data-token-cost-tier', annotation.tier);
        pin.setAttribute('data-token-cost-title', annotation.title);
        syncCostBadge(pin, annotation.label);
      });
    };

    const scheduleAnnotation = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(annotatePins);
    };

    annotatePins();

    const observer = new MutationObserver(scheduleAnnotation);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-label', 'data-timeline-pin'],
      childList: true,
      subtree: true,
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      document.querySelectorAll<HTMLButtonElement>(TIMELINE_PIN_SELECTOR).forEach(clearCostAttributes);
    };
  }, [annotationsByAriaLabel, enabled]);

  return null;
}

function FilterPanelCostTogglePortal({enabled, onToggle}: {enabled: boolean; onToggle: () => void}) {
  const [hostElement, setHostElement] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    let animationFrame = 0;
    let retryInterval = 0;
    let retryTimeout = 0;

    const syncHostElement = () => {
      const filterPanel = document.querySelector<HTMLElement>(FILTER_PANEL_SELECTOR);
      const panelContent = filterPanel?.firstElementChild as HTMLElement | null | undefined;

      if (!panelContent) {
        setHostElement(null);
        return;
      }

      let host = Array.from(panelContent.children).find((child) =>
        child.hasAttribute(FILTER_PANEL_TOGGLE_HOST_ATTRIBUTE),
      ) as HTMLElement | undefined;

      if (!host) {
        host = document.createElement('div');
        host.setAttribute(FILTER_PANEL_TOGGLE_HOST_ATTRIBUTE, '');
        panelContent.insertBefore(host, panelContent.firstChild);
      }

      setHostElement(host);
    };

    const scheduleHostSync = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(syncHostElement);
    };

    syncHostElement();
    retryTimeout = window.setTimeout(syncHostElement, 100);
    retryInterval = window.setInterval(syncHostElement, 400);

    const observer = new MutationObserver(scheduleHostSync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'data-filter-panel'],
      childList: true,
      subtree: true,
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearInterval(retryInterval);
      window.clearTimeout(retryTimeout);
      observer.disconnect();
    };
  }, []);

  if (!hostElement) {
    return null;
  }

  return createPortal(
    <section className="token-cost-filter-section" aria-label="Timeline overlays">
      <p className="token-cost-filter-heading">Overlays</p>
      <button
        type="button"
        className={`token-cost-panel-toggle${enabled ? ' is-active' : ''}`}
        aria-pressed={enabled}
        aria-label={enabled ? 'Hide token costs' : 'Show token costs'}
        title={enabled ? 'Hide token costs' : 'Show token costs'}
        onClick={onToggle}
      >
        <span className="token-cost-panel-toggle-icon" aria-hidden="true">
          <Banknote size={18} strokeWidth={1.9} />
          <span className="token-cost-panel-toggle-icon-coin">$</span>
        </span>
        <span className="token-cost-panel-toggle-copy">
          <span className="token-cost-panel-toggle-label">Costs</span>
          <span className="token-cost-panel-toggle-meta">Token API pricing</span>
        </span>
        <span className="token-cost-panel-toggle-state">{enabled ? 'On' : 'Off'}</span>
      </button>
    </section>,
    hostElement,
  );
}

export default function App() {
  const [showCostOverlay, setShowCostOverlay] = useState(getInitialCostOverlayState);

  const toggleCostOverlay = () => {
    setShowCostOverlay((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem(COST_OVERLAY_STORAGE_KEY, nextValue ? 'on' : 'off');
      return nextValue;
    });
  };

  return (
    <div className={`timeline-shell${showCostOverlay ? ' token-cost-overlay-enabled' : ''}`}>
      <TimelineCostOverlay enabled={showCostOverlay} />
      <FilterPanelCostTogglePortal enabled={showCostOverlay} onToggle={toggleCostOverlay} />
      <TimelineExperience definition={aiTimelineDefinition} />
    </div>
  );
}

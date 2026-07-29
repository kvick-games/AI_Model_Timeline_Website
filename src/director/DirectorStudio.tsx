import {
  ArrowsOutSimple,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Check,
  ClipboardText,
  CornersOut,
  FilmStrip,
  MagnifyingGlass,
  Pause,
  Play,
  SkipBack,
  SlidersHorizontal,
  X,
} from '@phosphor-icons/react';
import type {
  TimelineExperienceController,
  TimelineExperienceState,
  TimelineFilterState,
} from '@kvick-games/timeline-library';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type RefObject} from 'react';
import {aiTimelineDefinition} from '../data/aiTimelineDefinition';
import {modelReleaseIndex} from '../data/releaseIndex';
import type {ModelReleaseIndexEntry} from '../data/types';
import {
  buildDirectorCaption,
  buildDirectorScenes,
  createInitialDirectorState,
  DIRECTOR_PACE_TIMINGS,
  directorReducer,
  estimateDirectorRuntimeMs,
  formatDirectorRuntime,
  getDefaultDirectorSelection,
  getDirectorPickerEntries,
  getSelectedDirectorEntries,
  saveDirectorPreferences,
  type DirectorAspectRatio,
  type DirectorPace,
  type DirectorScene,
} from './directorState';

type DirectorStudioProps = {
  controllerRef: RefObject<TimelineExperienceController | null>;
  onClose: () => void;
};

type StageRect = {bottom: number; height: number; left: number; right: number; top: number; width: number};

const ASPECT_VALUES: Record<DirectorAspectRatio, number> = {
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '1:1': 1,
};

const NODE_FOCUS_ANCHORS: Record<DirectorAspectRatio, {x: number; y: number}> = {
  '16:9': {x: 0.73, y: 0.42},
  '9:16': {x: 0.5, y: 0.36},
  '1:1': {x: 0.64, y: 0.4},
};

const MAX_PICKER_RESULTS = 80;

function isTextInput(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function getDirectorFilterState(entries: ModelReleaseIndexEntry[]): TimelineFilterState {
  const domainIds = aiTimelineDefinition.filterGroups.flatMap((group) => group.domainIds);
  const domainIdSet = new Set(domainIds);
  const selectedDomainIds = [...new Set(entries.flatMap((entry) => entry.presets.filter((preset) => domainIdSet.has(preset))))];

  return {
    attributeIds: [],
    companyIds: [],
    contentType: 'all',
    domainIds: selectedDomainIds.length > 0 ? selectedDomainIds : [...aiTimelineDefinition.defaultFilterState.domainIds],
  };
}

function formatSceneDateRange(entries: ModelReleaseIndexEntry[]) {
  if (entries.length === 0) {
    return 'No nodes selected';
  }

  const first = entries[0];
  const last = entries[entries.length - 1];
  return first.date === last.date ? first.dateLabel : `${first.dateLabel} — ${last.dateLabel}`;
}

function getSceneFocusTarget(scene: DirectorScene, selectedSlugs: string[]) {
  if (scene.kind === 'node') {
    return {kind: 'slug' as const, slug: scene.entry.slug};
  }

  if (scene.kind === 'intro') {
    return {kind: 'default' as const};
  }

  return {kind: 'slugs' as const, slugs: selectedSlugs};
}

function getStageFocusAnchor(aspectRatio: DirectorAspectRatio, stageRect: StageRect | null) {
  const anchor = NODE_FOCUS_ANCHORS[aspectRatio];

  if (!stageRect) {
    return anchor;
  }

  return {
    x: (stageRect.left + stageRect.width * anchor.x) / window.innerWidth,
    y: (stageRect.top + stageRect.height * anchor.y) / window.innerHeight,
  };
}

function DirectorStageOverlay({
  headline,
  scene,
  sceneIndex,
  sceneCount,
  selectedEntries,
  subtitle,
}: {
  headline: string;
  scene: DirectorScene | null;
  sceneIndex: number;
  sceneCount: number;
  selectedEntries: ModelReleaseIndexEntry[];
  subtitle: string;
}) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? {duration: 0.16}
    : {type: 'spring' as const, stiffness: 100, damping: 20};

  return (
    <div className="director-stage-overlay" aria-live="polite">
      <div className="director-progress-track" aria-hidden="true">
        <motion.span
          animate={{scaleX: sceneCount > 0 ? (sceneIndex + 1) / sceneCount : 0}}
          initial={false}
          transition={transition}
        />
      </div>

      <>
        {scene?.kind === 'intro' ? (
          <motion.div
            key="director-intro"
            className="director-title-card"
            initial={{opacity: 0, x: -28, y: 12}}
            animate={{opacity: 1, x: 0, y: 0}}
            exit={{opacity: 0, x: 18, transition: {duration: 0.18}}}
            transition={transition}
          >
            <p className="director-kicker">Timeline briefing</p>
            <h2>{headline || 'AI timeline update'}</h2>
            <p>{subtitle}</p>
            <div className="director-title-meta">
              <span>{selectedEntries.length} nodes</span>
              <span>{formatSceneDateRange(selectedEntries)}</span>
            </div>
          </motion.div>
        ) : null}

        {scene?.kind === 'node' ? (
          <motion.div
            key={scene.entry.slug}
            className="director-lower-third"
            style={{['--director-accent' as string]: scene.entry.accent}}
            initial={{opacity: 0, x: -24, y: 18}}
            animate={{opacity: 1, x: 0, y: 0}}
            exit={{opacity: 0, x: 16, y: -8, transition: {duration: 0.18}}}
            transition={transition}
          >
            <div className="director-lower-third-rule" />
            <div className="director-lower-third-copy">
              <p className="director-kicker">
                {scene.entry.companyName} <span>{scene.entry.eventTypeLabel}</span>
              </p>
              <h2>{scene.entry.name}</h2>
              <p className="director-node-context">
                {scene.entry.productLineLabel} <span>{scene.entry.dateRangeLabel}</span>
              </p>
            </div>
            <span className="director-scene-count">
              {String(selectedEntries.findIndex((entry) => entry.slug === scene.entry.slug) + 1).padStart(2, '0')}
              <i />
              {String(selectedEntries.length).padStart(2, '0')}
            </span>
          </motion.div>
        ) : null}

        {scene?.kind === 'outro' ? (
          <motion.div
            key="director-outro"
            className="director-outro-card"
            initial={{opacity: 0, y: 22}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, transition: {duration: 0.18}}}
            transition={transition}
          >
            <p className="director-kicker">Update mapped</p>
            <h2>{selectedEntries.length} additions on one timeline</h2>
            <p className="director-outro-link">
              <span>Explore the full chronology at</span>
              <span>kvick-games.github.io/AI_Model_Timeline_Website</span>
            </p>
          </motion.div>
        ) : null}
      </>
    </div>
  );
}

export function DirectorStudio({controllerRef, onClose}: DirectorStudioProps) {
  const controller = useMemo<TimelineExperienceController>(
    () => ({
      cancelFocus() {
        controllerRef.current?.cancelFocus();
      },
      focus(target, options) {
        return controllerRef.current?.focus(target, options) ?? Promise.resolve('unavailable');
      },
      getState() {
        if (!controllerRef.current) {
          throw new Error('Timeline controller is unavailable.');
        }
        return controllerRef.current.getState();
      },
      restoreState(nextState) {
        return controllerRef.current?.restoreState(nextState) ?? Promise.resolve();
      },
      setState(nextState) {
        return controllerRef.current?.setState(nextState) ?? Promise.resolve();
      },
    }),
    [controllerRef],
  );
  const [state, dispatch] = useReducer(directorReducer, modelReleaseIndex, createInitialDirectorState);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [stageRect, setStageRect] = useState<StageRect | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const initialTimelineStateRef = useRef<TimelineExperienceState>(controller.getState());
  const closingRef = useRef(false);
  const selectedEntries = useMemo(
    () => getSelectedDirectorEntries(modelReleaseIndex, state.selectedSlugs),
    [state.selectedSlugs],
  );
  const scenes = useMemo(() => buildDirectorScenes(state, modelReleaseIndex), [state]);
  const currentScene = scenes[state.sceneIndex] ?? null;
  const activeSlug = currentScene?.kind === 'node' ? currentScene.entry.slug : null;
  const runtimeLabel = formatDirectorRuntime(estimateDirectorRuntimeMs(state, modelReleaseIndex));
  const caption = useMemo(() => buildDirectorCaption(state, modelReleaseIndex), [state]);
  const isPlaybackActive = state.status === 'playing' || state.status === 'paused' || state.status === 'finished';

  const pickerEntries = useMemo(() => {
    const query = state.search.trim().toLowerCase();
    return getDirectorPickerEntries(modelReleaseIndex)
      .sort((left, right) => right.date.localeCompare(left.date) || left.name.localeCompare(right.name))
      .filter((entry) =>
        !query || `${entry.name} ${entry.companyName} ${entry.productLineLabel} ${entry.eventTypeLabel}`.toLowerCase().includes(query),
      )
      .slice(0, MAX_PICKER_RESULTS);
  }, [state.search]);

  const syncStageRect = useCallback(() => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    setStageRect({bottom: rect.bottom, height: rect.height, left: rect.left, right: rect.right, top: rect.top, width: rect.width});
  }, []);

  useLayoutEffect(() => {
    syncStageRect();
    const observer = new ResizeObserver(syncStageRect);
    if (stageRef.current) {
      observer.observe(stageRef.current);
    }
    window.addEventListener('resize', syncStageRect);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncStageRect);
    };
  }, [state.aspectRatio, syncStageRect]);

  useEffect(() => {
    saveDirectorPreferences(state);
  }, [state.aspectRatio, state.headline, state.includeIntro, state.includeOutro, state.pace, state.subtitle, state.windowDays]);

  useLayoutEffect(() => {
    let frame = 0;
    const selectedSlugSet = new Set(state.selectedSlugs);
    const syncPins = () => {
      document.querySelectorAll<HTMLButtonElement>('[data-timeline-pin][data-timeline-slug]').forEach((pin) => {
        const slug = pin.dataset.timelineSlug ?? '';
        pin.toggleAttribute('data-director-selected', selectedSlugSet.has(slug));
        pin.toggleAttribute('data-director-active', slug === activeSlug);
      });
    };
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncPins);
    };
    syncPins();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {childList: true, subtree: true});
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      document.querySelectorAll('[data-director-selected], [data-director-active]').forEach((pin) => {
        pin.removeAttribute('data-director-selected');
        pin.removeAttribute('data-director-active');
      });
    };
  }, [activeSlug, state.selectedSlugs]);

  useEffect(() => {
    let cancelled = false;
    const prepare = async () => {
      await controller.setState({
        filterState: getDirectorFilterState(selectedEntries),
        hiddenCompanyIds: [],
        route: {kind: 'timeline'},
        showTimelineGrid: true,
        significanceDisplayLimit: 'all',
      });
      if (!cancelled && state.status === 'idle' && state.selectedSlugs.length > 0) {
        void controller.focus({kind: 'slugs', slugs: state.selectedSlugs}, {maxZoom: 1.08, stiffness: 12});
      }
    };
    void prepare();
    return () => {
      cancelled = true;
    };
  }, [controller, selectedEntries, state.selectedSlugs, state.status]);

  useEffect(() => {
    if ((state.status !== 'playing' && state.status !== 'paused') || !currentScene) {
      return undefined;
    }

    let cancelled = false;
    let focusTimer = 0;
    let holdTimer = 0;
    const timings = DIRECTOR_PACE_TIMINGS[state.pace];
    const runScene = async () => {
      await Promise.race([
        controller.focus(getSceneFocusTarget(currentScene, state.selectedSlugs), {
          anchor: currentScene.kind === 'node' ? getStageFocusAnchor(state.aspectRatio, stageRect) : undefined,
          durationMs: timings.focusMs,
          maxZoom: currentScene.kind === 'node' ? (state.aspectRatio === '9:16' ? 1.38 : 1.72) : 1.02,
          stiffness: timings.stiffness,
        }),
        new Promise<void>((resolve) => {
          focusTimer = window.setTimeout(resolve, timings.focusMs);
        }),
      ]);
      if (cancelled) {
        return;
      }
      if (state.status === 'paused') {
        return;
      }
      holdTimer = window.setTimeout(() => {
        if (state.sceneIndex >= scenes.length - 1) {
          dispatch({type: 'set_status', value: 'finished'});
          return;
        }
        dispatch({type: 'set_scene', value: state.sceneIndex + 1});
      }, currentScene.durationMs);
    };
    void runScene();
    return () => {
      cancelled = true;
      window.clearTimeout(focusTimer);
      window.clearTimeout(holdTimer);
      controller.cancelFocus();
    };
  }, [controller, currentScene, scenes.length, stageRect, state.aspectRatio, state.pace, state.sceneIndex, state.selectedSlugs, state.status]);

  useEffect(() => {
    if (state.sceneIndex < scenes.length) {
      return;
    }
    dispatch({type: 'set_scene', value: Math.max(0, scenes.length - 1)});
  }, [scenes.length, state.sceneIndex]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && state.status === 'playing') {
        dispatch({type: 'set_status', value: 'paused'});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.status]);

  useEffect(() => {
    const handleFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      window.requestAnimationFrame(syncStageRect);
    };
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, [syncStageRect]);

  const closeStudio = useCallback(async () => {
    if (closingRef.current) {
      return;
    }
    closingRef.current = true;
    controller.cancelFocus();
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
    await controller.restoreState(initialTimelineStateRef.current);
    onClose();
  }, [controller, onClose]);

  const moveScene = useCallback(
    (direction: -1 | 1) => {
      if (scenes.length === 0) {
        return;
      }
      controller.cancelFocus();
      dispatch({type: 'set_status', value: 'paused'});
      dispatch({type: 'set_scene', value: Math.max(0, Math.min(scenes.length - 1, state.sceneIndex + direction))});
    },
    [controller, scenes.length, state.sceneIndex],
  );

  const goToScene = useCallback(
    (sceneIndex: number) => {
      if (scenes.length === 0) {
        return;
      }
      controller.cancelFocus();
      dispatch({type: 'set_status', value: 'paused'});
      dispatch({type: 'set_scene', value: Math.max(0, Math.min(scenes.length - 1, sceneIndex))});
    },
    [controller, scenes.length],
  );

  const togglePlayback = useCallback(() => {
    if (scenes.length === 0) {
      return;
    }
    if (state.status === 'playing') {
      dispatch({type: 'set_status', value: 'paused'});
      return;
    }
    if (state.status === 'finished') {
      dispatch({type: 'set_scene', value: 0});
    }
    dispatch({type: 'set_status', value: 'playing'});
  }, [scenes.length, state.status]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        void closeStudio();
        return;
      }
      if (isTextInput(event.target)) {
        return;
      }
      if (event.key === ' ') {
        event.preventDefault();
        togglePlayback();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveScene(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveScene(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeStudio, moveScene, togglePlayback]);

  const selectWindow = (windowDays: 7 | 14 | 30) => {
    const selection = getDefaultDirectorSelection(modelReleaseIndex, windowDays);
    dispatch({
      type: 'set_window',
      fallbackSelection: selection.fallbackSelection,
      slugs: selection.slugs,
      value: windowDays,
    });
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const stageStyle = {
    ['--director-aspect' as string]: String(ASPECT_VALUES[state.aspectRatio]),
  };

  return (
    <div className={`director-studio is-${state.status}`} data-director-aspect={state.aspectRatio}>
      {stageRect ? (
        <div className="director-mattes" aria-hidden="true">
          <i style={{height: stageRect.top, left: 0, right: 0, top: 0}} />
          <i style={{bottom: 0, height: Math.max(0, window.innerHeight - stageRect.bottom), left: 0, right: 0}} />
          <i style={{height: stageRect.height, left: 0, top: stageRect.top, width: stageRect.left}} />
          <i style={{height: stageRect.height, right: 0, top: stageRect.top, width: Math.max(0, window.innerWidth - stageRect.right)}} />
        </div>
      ) : null}

      <div ref={stageRef} className="director-stage" style={stageStyle}>
        <div className="director-safe-guides" aria-hidden="true"><i /><i /></div>
        <DirectorStageOverlay
          headline={state.headline}
          scene={currentScene}
          sceneCount={scenes.length}
          sceneIndex={state.sceneIndex}
          selectedEntries={selectedEntries}
          subtitle={state.subtitle}
        />
      </div>

      <AnimatePresence>
        {!isPlaybackActive ? (
          <motion.aside
            className="director-panel"
            initial={{opacity: 0, x: -28}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -18}}
            transition={{type: 'spring', stiffness: 100, damping: 20}}
          >
            <header className="director-panel-header">
              <div>
                <p className="director-kicker">Production tools</p>
                <h1>Director mode</h1>
              </div>
              <button type="button" className="director-icon-button" aria-label="Close Director mode" onClick={() => void closeStudio()}>
                <X size={18} weight="bold" />
              </button>
            </header>

            <div className="director-panel-scroll">
              <section className="director-control-section">
                <div className="director-section-heading">
                  <span><FilmStrip size={17} weight="regular" /> Story</span>
                  <b>{runtimeLabel}</b>
                </div>
                <label className="director-field">
                  <span>Headline</span>
                  <input value={state.headline} onChange={(event) => dispatch({type: 'set_headline', value: event.target.value})} />
                </label>
                <label className="director-field">
                  <span>Subtitle</span>
                  <textarea rows={2} value={state.subtitle} onChange={(event) => dispatch({type: 'set_subtitle', value: event.target.value})} />
                </label>
                <div className="director-inline-toggles">
                  <button type="button" aria-pressed={state.includeIntro} onClick={() => dispatch({type: 'set_include_intro', value: !state.includeIntro})}>Intro <b>{state.includeIntro ? 'On' : 'Off'}</b></button>
                  <button type="button" aria-pressed={state.includeOutro} onClick={() => dispatch({type: 'set_include_outro', value: !state.includeOutro})}>Outro <b>{state.includeOutro ? 'On' : 'Off'}</b></button>
                </div>
              </section>

              <section className="director-control-section">
                <div className="director-section-heading"><span><CornersOut size={17} /> Format</span></div>
                <div className="director-segmented" aria-label="Capture aspect ratio">
                  {(['16:9', '9:16', '1:1'] as DirectorAspectRatio[]).map((aspectRatio) => (
                    <button key={aspectRatio} type="button" aria-pressed={state.aspectRatio === aspectRatio} onClick={() => dispatch({type: 'set_aspect_ratio', value: aspectRatio})}>{aspectRatio}</button>
                  ))}
                </div>
                <div className="director-segmented" aria-label="Playback pace">
                  {(['fast', 'balanced', 'cinematic'] as DirectorPace[]).map((pace) => (
                    <button key={pace} type="button" aria-pressed={state.pace === pace} onClick={() => dispatch({type: 'set_pace', value: pace})}>{pace}</button>
                  ))}
                </div>
              </section>

              <section className="director-control-section">
                <div className="director-section-heading">
                  <span><CalendarBlank size={17} /> New nodes</span>
                  <b>{state.selectedSlugs.length} selected</b>
                </div>
                <div className="director-segmented is-compact" aria-label="Recent date window">
                  {([7, 14, 30] as const).map((days) => (
                    <button key={days} type="button" aria-pressed={state.windowDays === days} onClick={() => selectWindow(days)}>{days} days</button>
                  ))}
                </div>
                {state.fallbackSelection ? <p className="director-inline-notice">No nodes landed in this window, so the latest five are staged.</p> : null}
                <label className="director-search">
                  <MagnifyingGlass size={16} />
                  <input aria-label="Search timeline nodes" placeholder="Search every timeline node" value={state.search} onChange={(event) => dispatch({type: 'set_search', value: event.target.value})} />
                </label>
                <div className="director-node-picker">
                  {pickerEntries.length > 0 ? pickerEntries.map((entry) => {
                    const selected = state.selectedSlugs.includes(entry.slug);
                    return (
                      <button key={entry.slug} type="button" className={selected ? 'is-selected' : ''} aria-pressed={selected} onClick={() => dispatch({type: 'toggle_slug', value: entry.slug})}>
                        <span className="director-node-check">{selected ? <Check size={13} weight="bold" /> : null}</span>
                        <span><b>{entry.name}</b><small>{entry.companyName} · {entry.dateLabel}</small></span>
                      </button>
                    );
                  }) : <div className="director-empty-picker">No timeline nodes match that search.</div>}
                </div>
              </section>

              <section className="director-control-section">
                <div className="director-section-heading"><span><ClipboardText size={17} /> Post caption</span></div>
                <textarea className="director-caption-preview" readOnly rows={7} value={caption} />
                <button type="button" className="director-secondary-button" disabled={!caption} onClick={() => void copyCaption()}>
                  {copied ? <Check size={17} weight="bold" /> : <ClipboardText size={17} />}
                  {copied ? 'Copied' : 'Copy caption'}
                </button>
              </section>
            </div>

            <footer className="director-panel-footer">
              <button type="button" className="director-secondary-button" onClick={() => void toggleFullscreen()}>
                <ArrowsOutSimple size={18} /> {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </button>
              <button type="button" className="director-primary-button" disabled={scenes.length === 0} onClick={togglePlayback}>
                <Play size={18} weight="fill" /> Play showcase
              </button>
            </footer>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {isPlaybackActive ? (
        <div className="director-playback-controls">
          <button type="button" aria-label="Jump to sequence start" onClick={() => goToScene(0)} disabled={state.sceneIndex === 0}><SkipBack size={18} weight="fill" /></button>
          <button type="button" aria-label="Previous scene" onClick={() => moveScene(-1)} disabled={state.sceneIndex === 0}><CaretLeft size={18} weight="bold" /></button>
          <button type="button" className="is-primary" aria-label={state.status === 'playing' ? 'Pause showcase' : 'Play showcase'} onClick={togglePlayback}>
            {state.status === 'playing' ? <Pause size={19} weight="fill" /> : <Play size={19} weight="fill" />}
          </button>
          <button type="button" aria-label="Next scene" onClick={() => moveScene(1)} disabled={state.sceneIndex >= scenes.length - 1}><CaretRight size={18} weight="bold" /></button>
          <div className="director-scene-pips" aria-label={`Scene ${state.sceneIndex + 1} of ${scenes.length}`}>
            {scenes.map((scene, index) => (
              <button
                key={scene.key}
                type="button"
                aria-label={`Go to scene ${index + 1}`}
                aria-current={index === state.sceneIndex ? 'step' : undefined}
                className={index < state.sceneIndex ? 'is-complete' : ''}
                onClick={() => goToScene(index)}
              />
            ))}
          </div>
          <button type="button" aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={() => void toggleFullscreen()}><ArrowsOutSimple size={18} /></button>
        </div>
      ) : null}

      <button type="button" className="director-exit-button" aria-label="Exit Director mode" onClick={() => void closeStudio()}>
        <X size={16} weight="bold" /><span>Exit director</span>
      </button>

      <div className="director-shortcuts" aria-hidden="true">
        <SlidersHorizontal size={15} /> Space play/pause · Arrows scenes · Esc exit
      </div>
    </div>
  );
}

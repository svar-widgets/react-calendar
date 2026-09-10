import {
  useContext,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import { useStore } from '@svar-ui/lib-react';
import store from '../../context.js';
import { drag } from '../../directives/drag.js';
import { clickevent } from '../../directives/clickevent.js';
import { clickdate } from '../../directives/clickdate.js';
import { Popup } from '@svar-ui/react-core';
import Headers from './Headers.jsx';
import SectionContent from './SectionContent.jsx';
import EventProjection from './EventProjection.jsx';
import { resolveEventPosition } from './resolveEventPosition.js';
import { useEventOverlay } from '../useEventOverlay.jsx';
import './Sections.css';

const scope = 'wx-aacpUHlw';

// Lane height must match BarSection
const BAR_LANE_HEIGHT = 28;

function getMinContentHeight(section) {
  if (!section.yHeaders) return 0;
  const innerLevel = section.yHeaders[section.yHeaders.length - 1];
  if (!innerLevel || innerLevel.length === 0) return 0;
  const first = innerLevel[0];
  const minUnitHeight = first.ui?.minUnitHeight;
  return typeof minUnitHeight === 'number'
    ? innerLevel.length * minUnitHeight
    : 0;
}

function getBarSectionHeight(section, hasProjection) {
  if (section.mode !== 'bars' || typeof section.size === 'number') return 0;
  let maxLanes = 0;
  for (const p of section.primitives) {
    const lanes = p.totalLanes ?? 1;
    if (lanes > maxLanes) maxLanes = lanes;
  }
  if (!maxLanes && hasProjection) {
    maxLanes = 1;
  }
  return maxLanes * BAR_LANE_HEIGHT;
}

function sectionMinHeight(section, hasProjection) {
  if (typeof section.size !== 'number') {
    return getBarSectionHeight(section, hasProjection);
  }
  return getMinContentHeight(section);
}

function sectionFlex(section, sticky) {
  if (sticky) return '0 0 auto';
  if (section.mode === 'list' || section.mode === 'year') return '0 0 auto';
  return typeof section.size === 'number' ? '1' : '0 0 auto';
}

function SectionRow({
  section,
  idx,
  visibleSectionsLength,
  stickyCount,
  stickyOffsets,
  hasYHeaders,
  gridOverflow,
  onGridOverflow,
  sizes,
  sectionElsRef,
  contentElsRef,
  ready,
  cellCss,
  eventCss,
  eventContent,
  view,
  tooltip,
  readonly,
  api,
  viewValue,
  overlay,
  eventPopup,
  projection,
}) {
  const sticky = idx < stickyCount;
  const secDx = (sizes[section.name]?.width ?? 0) / 100;
  const containerHeight = sizes[section.name]?.height ?? 0;
  const minHeight = getMinContentHeight(section);
  const barHeight = getBarSectionHeight(section, !!projection);
  const secDy = Math.max(containerHeight, minHeight, barHeight) / 100;
  const minH = sectionMinHeight(section, !!projection);

  const contentRef = useRef(null);
  const dragRef = useRef(null);
  const clickeventRef = useRef(null);
  const clickdateRef = useRef(null);

  const dragOptions = useMemo(
    () => ({
      mode: section.mode,
      dx: secDx,
      dy: secDy,
      xHeaders: section.xHeaders,
      yHeaders: section.yHeaders,
      sectionName: section.name,
      model: viewValue,
      exec: api.exec,
      getEvent: (id) => api.getEvent(id),
      move: !readonly && !!section.ui?.drag,
      clipDrag: section.ui?.clipDrag !== false,
      create: !readonly && !!section.ui?.dragCreate,
    }),
    [
      section.mode,
      secDx,
      secDy,
      section.xHeaders,
      section.yHeaders,
      section.name,
      viewValue,
      api,
      readonly,
      section.ui,
    ],
  );

  const clickeventOptions = useMemo(
    () => ({
      exec: api.exec,
      getEvent: (id) => api.getEvent(id),
      onEventPopup: eventPopup ? overlay.handleEventPopup : undefined,
    }),
    [api, eventPopup, overlay.handleEventPopup],
  );

  const clickdateOptions = useMemo(() => ({ exec: api.exec }), [api.exec]);

  // Setup directives
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    dragRef.current = drag(el, dragOptions);
    clickeventRef.current = clickevent(el, clickeventOptions);
    clickdateRef.current = clickdate(el, clickdateOptions);

    return () => {
      dragRef.current?.destroy?.();
      clickeventRef.current?.destroy?.();
      clickdateRef.current?.destroy?.();
    };
  }, []);

  // Update directive options when deps change
  useEffect(() => {
    dragRef.current?.update?.(dragOptions);
  }, [dragOptions]);

  useEffect(() => {
    clickeventRef.current?.update?.(clickeventOptions);
  }, [clickeventOptions]);

  useEffect(() => {
    clickdateRef.current?.update?.(clickdateOptions);
  }, [clickdateOptions]);

  const sectionClassName = [
    'wx-section',
    scope,
    idx === visibleSectionsLength - 1 ? 'wx-section-last' : '',
    sticky ? 'wx-section-sticky' : '',
    section.mode === 'grid' && !!gridOverflow[section.name]
      ? 'wx-section-grid'
      : '',
    hasYHeaders ? 'wx-has-y-headers' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const sectionStyle = {
    flex: sectionFlex(section, sticky),
    minHeight: minH > 0 ? `${minH}px` : undefined,
    top: sticky ? `${stickyOffsets[idx] ?? 0}px` : undefined,
    zIndex: sticky ? 10 - idx : undefined,
  };

  return (
    <div
      className={sectionClassName}
      style={sectionStyle}
      ref={(el) => {
        if (el) sectionElsRef.current[section.name] = el;
      }}
    >
      {section.yVisible !== false ? (
        <div className={`wx-y-headers-area ${scope}`}>
          <Headers headers={section.yHeaders} direction="y" />
        </div>
      ) : hasYHeaders ? (
        <div className={`wx-header-spacer ${scope}`}></div>
      ) : null}

      <div
        className={`wx-section-content ${scope}`}
        ref={(el) => {
          contentRef.current = el;
          if (el) contentElsRef.current[section.name] = el;
        }}
        onMouseMove={tooltip ? overlay.handleTooltipMove : undefined}
        onMouseLeave={tooltip ? overlay.handleTooltipLeave : undefined}
      >
        {section.ui?.dragCreate && (
          <div
            className={`wx-drag-stub ${scope}`}
            data-drag-stub=""
            aria-hidden="true"
          ></div>
        )}
        <SectionContent
          section={section}
          dx={secDx}
          dy={secDy}
          scrollHeight={null}
          measured={ready && !!sizes[section.name]}
          cellCss={cellCss}
          eventCss={eventCss}
          eventContent={eventContent}
          view={view}
          tooltip={tooltip}
          onoverflow={
            section.mode === 'grid'
              ? (overflow) => onGridOverflow(section.name, overflow)
              : undefined
          }
        />
        {projection && (
          <EventProjection
            primitives={projection.primitives}
            dx={secDx}
            dy={secDy}
          />
        )}
      </div>
    </div>
  );
}

function Sections({
  data,
  cellCss,
  eventCss,
  eventContent,
  view,
  tooltip,
  eventPopup,
  readonly = false,
  eventProjection,
}) {
  const api = useContext(store);
  const viewValue = useStore(api, '_view');

  const [ready, setReady] = useState(false);
  const [sizes, setSizes] = useState({});
  const [xHeadersHeight, setXHeadersHeight] = useState(0);
  const [gridOverflow, setGridOverflow] = useState({});

  const sectionElsRef = useRef({});
  const contentElsRef = useRef({});
  const xHeadersElRef = useRef(null);
  const roRef = useRef(null);

  const measure = useCallback(() => {
    const next = {};
    for (const section of data) {
      const sectionEl = sectionElsRef.current[section.name];
      const contentEl = contentElsRef.current[section.name];
      if (sectionEl && contentEl) {
        const w = contentEl.clientWidth;
        const h = sectionEl.clientHeight;
        next[section.name] = { width: w, height: h };
      }
    }
    setSizes((prev) => {
      for (const key in next) {
        const p = prev[key];
        const n = next[key];
        if (!p || p.width !== n.width || p.height !== n.height) {
          return next;
        }
      }
      // check if keys differ
      if (Object.keys(prev).length !== Object.keys(next).length) return next;
      return prev;
    });
    if (xHeadersElRef.current) {
      const h = xHeadersElRef.current.clientHeight;
      setXHeadersHeight((prev) => (h !== prev ? h : prev));
    } else {
      setXHeadersHeight((prev) => (prev !== 0 ? 0 : prev));
    }
  }, [data]);

  const observeAll = useCallback(() => {
    const ro = roRef.current;
    if (!ro) return;
    ro.disconnect();
    for (const section of data) {
      const el = sectionElsRef.current[section.name];
      if (el) ro.observe(el);
    }
    if (xHeadersElRef.current) ro.observe(xHeadersElRef.current);
  }, [data]);

  useLayoutEffect(() => {
    measure();
    setReady(true);

    roRef.current = new ResizeObserver(() => measure());
    observeAll();
    return () => roRef.current?.disconnect();
  }, [measure, observeAll]);

  useLayoutEffect(() => {
    if (!ready || !roRef.current) return;
    observeAll();
    measure();
  }, [ready, data, measure, observeAll]);

  const onGridOverflow = useCallback((section, overflow) => {
    setGridOverflow((prev) => {
      if (!!prev[section] === overflow) return prev;
      return { ...prev, [section]: overflow };
    });
  }, []);

  // Sections visible without taking the event projection into account.
  // Svelte resolves the projection <-> visibility cycle lazily; React memos
  // cannot, so the base list is computed first and used to place the projection.
  const baseSections = useMemo(
    () =>
      data.filter(
        (s) => s.size !== 'content-optional' || s.primitives.length > 0,
      ),
    [data],
  );

  const projections = useMemo(() => {
    if (!eventProjection || !eventProjection.htmlEvent) return [];
    let event;
    for (const item of baseSections) {
      const size = sizes[item.name];
      const itemDx = (size?.width ?? 0) / 100;
      const itemDy =
        Math.max(
          size?.height ?? 0,
          getMinContentHeight(item),
          getBarSectionHeight(item),
        ) / 100;
      event = resolveEventPosition(
        eventProjection.htmlEvent,
        eventProjection.event,
        item,
        contentElsRef.current[item.name],
        itemDx,
        itemDy,
        viewValue,
        document,
      );
      if (event) break;
    }
    if (!event) return [];
    // store calculated props on the original projection object
    Object.assign(eventProjection.event, event);
    return viewValue.projectEvent(event);
  }, [eventProjection, baseSections, sizes, viewValue, ready]);

  const projectionFor = useCallback(
    (section) => projections.find((item) => item.section === section),
    [projections],
  );

  const visibleSections = useMemo(
    () =>
      data.filter(
        (s) =>
          s.size !== 'content-optional' ||
          s.primitives.length > 0 ||
          !!projectionFor(s.name),
      ),
    [data, projectionFor],
  );

  const stickyCount = useMemo(() => {
    let count = 0;
    for (const s of visibleSections) {
      const sz = s.size ?? 1;
      if (sz === 'content' || sz === 'content-optional') count++;
      else break;
    }
    return count;
  }, [visibleSections]);

  const stickyOffsets = useMemo(() => {
    const offsets = [];
    let acc = xHeadersHeight;
    for (let i = 0; i < stickyCount; i++) {
      offsets[i] = acc;
      const name = visibleSections[i].name;
      acc += sizes[name]?.height ?? 0;
    }
    return offsets;
  }, [stickyCount, xHeadersHeight, visibleSections, sizes]);

  const hasYHeaders = useMemo(
    () =>
      visibleSections.some((s) => s.yHeaders !== null && s.yVisible !== false),
    [visibleSections],
  );

  const xHeaders = useMemo(() => {
    const found = visibleSections.find(
      (s) => s.xHeaders !== null && s.xVisible !== false,
    );
    return found?.xHeaders ?? null;
  }, [visibleSections]);

  const overlay = useEventOverlay(
    (id) => api.getEvent(id),
    (el) => {
      const section = visibleSections.find((s) =>
        sectionElsRef.current[s.name]?.contains(el),
      );
      return section?.mode === 'boxes' ? 'right-start' : 'bottom-start';
    },
  );

  const popupExtra = { trackScroll: true };

  return (
    <div className={`wx-sections ${scope}`}>
      {xHeaders && (
        <div className={`wx-x-headers-row ${scope}`} ref={xHeadersElRef}>
          {hasYHeaders && <div className={`wx-header-corner ${scope}`}></div>}
          <div className={`wx-x-headers-area ${scope}`}>
            <Headers headers={xHeaders} direction="x" />
          </div>
        </div>
      )}

      {visibleSections.map((section, idx) => (
        <SectionRow
          key={section.name}
          section={section}
          idx={idx}
          visibleSectionsLength={visibleSections.length}
          stickyCount={stickyCount}
          stickyOffsets={stickyOffsets}
          hasYHeaders={hasYHeaders}
          gridOverflow={gridOverflow}
          onGridOverflow={onGridOverflow}
          sizes={sizes}
          sectionElsRef={sectionElsRef}
          contentElsRef={contentElsRef}
          ready={ready}
          cellCss={cellCss}
          eventCss={eventCss}
          eventContent={eventContent}
          view={view}
          tooltip={tooltip}
          readonly={readonly}
          api={api}
          viewValue={viewValue}
          overlay={overlay}
          eventPopup={eventPopup}
          projection={projectionFor(section.name)}
        />
      ))}

      {overlay.tooltipState &&
        tooltip &&
        (() => {
          const TooltipCmp = tooltip;
          return (
            <div
              className={`wx-calendar-tooltip ${scope}`}
              style={{
                position: 'fixed',
                left: `${overlay.mousePos.x + 12}px`,
                top: `${overlay.mousePos.y + 16}px`,
                zIndex: 10000,
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <TooltipCmp event={overlay.tooltipState.event} />
            </div>
          );
        })()}

      {overlay.eventPopupState &&
        eventPopup &&
        (() => {
          const EventPopupCmp = eventPopup;
          return (
            <Popup
              at={overlay.eventPopupState.at}
              parent={overlay.eventPopupState.element}
              onCancel={overlay.hideEventPopup}
              {...popupExtra}
            >
              <EventPopupCmp
                event={overlay.eventPopupState.event}
                close={overlay.hideEventPopup}
              />
            </Popup>
          );
        })()}
    </div>
  );
}

export default Sections;

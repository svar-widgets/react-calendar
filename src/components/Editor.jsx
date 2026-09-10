import { useMemo, useContext } from 'react';
import { Editor as EditorBase, registerEditorItem } from '@svar-ui/react-editor';
import { useStore } from '@svar-ui/lib-react';
import { locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/calendar-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { context } from '@svar-ui/react-core';
import store from '../context.js';
import DateTimePicker from './DateTimePicker.jsx';
import EventDatesForm from './EventDatesForm.jsx';
import { getEditorItems } from '../defaults.js';

import './Editor.css';

registerEditorItem('date-time-picker', DateTimePicker);
registerEditorItem('event-dates', EventDatesForm);

export default function Editor({
  api,
  values,
  items,
  placement,
  layout = 'default',
  focus = true,
  css = '',
  topBar,
  autoSave = true,
  onChange,
  onSave,
  onAction,
  ...editorProps
}) {
  void values;

  const editorDataValue = useStore(api, 'editorData');

  let l = useContext(context.i18n);
  if (!l) {
    l = locale({ ...en, ...coreEn });
  }
  const _ = l.getGroup('eventCalendar');

  function translate(value) {
    return typeof value === 'string' ? _(value) : value;
  }

  function applyLocale(list) {
    return list.map((item) => {
      const next = { ...item };
      next.label = translate(next.label);
      return next;
    });
  }

  const calendarCtx = useContext(store);
  const finalPlacement = useMemo(
    () => placement ?? (calendarCtx?.isCompact?.() ? 'fullscreen' : 'sidebar'),
    [placement, calendarCtx],
  );

  const useRecurringForm = useMemo(
    () =>
      !!editorDataValue?.recurring &&
      (editorDataValue?.recurringMode ?? 'series') !== 'single',
    [editorDataValue],
  );

  const cItems = useMemo(
    () => applyLocale(items ?? getEditorItems(useRecurringForm)),
    [items, useRecurringForm, _],
  );

  function handleDelete() {
    const data = editorDataValue;
    if (!data) return;
    api.exec('delete-event', { id: data.id, rawId: data.rawId });
    api.exec('select-event', { id: null, rawId: null });
  }

  const defaultTopBar = {
    items: [
      { comp: 'icon', icon: 'wxi-close', id: 'close' },
      { comp: 'spacer' },
      {
        comp: 'button',
        id: 'delete',
        text: _('Delete'),
        type: 'primary danger',
        onClick: handleDelete,
      },
    ],
  };

  const editorTopBar = topBar === undefined ? defaultTopBar : topBar;

  const editorCss = useMemo(
    () => ['wx-editor-calendar', css].filter(Boolean).join(' '),
    [css],
  );

  function handleSave(ev) {
    onSave?.(ev);
    const data = editorDataValue;
    if (!data) return;
    const mode = data.recurringMode ?? 'series';
    // a series save must not carry the clicked occurrence's context in
    // rawId, or the store would treat it as a single-occurrence edit
    api.exec('update-event', {
      id: data.id,
      rawId: mode === 'series' ? data.id : data.rawId,
      event: { ...ev.values },
      ...(data.recurringOriginalDate && mode !== 'series' ? { mode } : {}),
    });
  }

  function handleChange(ev) {
    onChange?.(ev);
  }

  function handleAction(ev) {
    onAction?.(ev);
    const { item } = ev;
    if (item.id === 'close' && !!item.comp) {
      api.exec('select-event', { id: null, rawId: null });
    }
  }

  return (
    editorDataValue && (
      <EditorBase
        {...editorProps}
        focus={focus}
        items={cItems}
        topBar={editorTopBar}
        autoSave={autoSave}
        onChange={handleChange}
        onAction={handleAction}
        onSave={handleSave}
        placement={finalPlacement}
        layout={layout}
        values={editorDataValue.values}
        css={editorCss}
      />
    )
  );
}

import { useContext, useRef } from 'react';
import { Checkbox, DatePicker, TimePicker } from '@svar-ui/react-core';
import { context } from '@svar-ui/react-core';
import { uid } from '@svar-ui/lib-state';
import './EventDatesForm.css';

const scope = 'wx-aaen7vKW';

export default function EventDatesForm({ value, error, onChange }) {
  const locale = useContext(context.i18n);
  const _ = locale ? locale.getGroup('eventCalendar') : (v) => v;
  const chId = useRef(uid());

  function sameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function update(part) {
    onChange({ value: { ...value, ...part } });
  }

  function pickDate(key, day) {
    if (!day) return;
    const current = value[key];
    const next = new Date(day);
    if (current) {
      next.setHours(current.getHours(), current.getMinutes(), 0, 0);
    }

    if (key === 'start' && sameDay(value.start, value.end)) {
      const end = new Date(value.end);
      end.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
      update({ start: next, end });
    } else {
      update({ [key]: next });
    }
  }

  function pickTime(key, time) {
    const next = new Date(value[key]);
    next.setHours(time.getHours(), time.getMinutes(), 0, 0);
    update({ [key]: next });
  }

  return (
    <div className={`wx-event-dates ${error ? 'wx-error' : ''} ${scope}`}>
      <div className={`wx-date-row ${scope}`}>
        <span className={`wx-date-label ${scope}`}>{_('Start date')}</span>
        <div className={`wx-date-control ${scope}`}>
          <DatePicker
            value={value.start}
            buttons={false}
            onChange={(ev) => pickDate('start', ev.value)}
          />
        </div>
        {!value.allDay && (
          <div className={`wx-time-control ${scope}`}>
            <TimePicker
              value={value.start}
              onChange={(ev) => pickTime('start', ev.value)}
            />
          </div>
        )}
      </div>

      <div className={`wx-date-row ${scope}`}>
        <span className={`wx-date-label ${scope}`}>{_('End date')}</span>
        <div className={`wx-date-control ${scope}`}>
          <DatePicker
            value={value.end}
            buttons={false}
            onChange={(ev) => pickDate('end', ev.value)}
          />
        </div>
        {!value.allDay && (
          <div className={`wx-time-control ${scope}`}>
            <TimePicker
              value={value.end}
              onChange={(ev) => pickTime('end', ev.value)}
            />
          </div>
        )}
      </div>

      <div className={`wx-date-row ${scope}`}>
        <span className={`wx-date-label ${scope}`}></span>
        <Checkbox
          id={chId.current}
          label={_('All day')}
          value={!!value.allDay}
          onChange={(ev) => update({ allDay: ev.value })}
        />
      </div>
    </div>
  );
}

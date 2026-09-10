import { useState, useRef } from 'react';
import { getData } from '../data.js';
import { Calendar, Editor } from '../../src/';
import './DragToCalendar.css';

const scope = 'wx-aadkIHZO';

export default function DragToCalendar() {
  const { data, date } = getData();
  const dataRef = useRef(data);

  // tasks available to drag into the calendar (no dates - resolved on drop)
  const tasks = [
    { id: 't1', text: 'Design review', duration: 60 * 60000 },
    { id: 't2', text: 'Quick sync', duration: 30 * 60000 },
    { id: 't3', text: 'Workshop', duration: 18 * 60000 },
    { id: 't4', text: 'Conference day', duration: 1440 * 60000 },
  ];

  const [api, setApi] = useState(null);
  const [eventProjection, setEventProjection] = useState(null);

  function onTaskDragStart(_ev, task) {
    setEventProjection({ htmlEvent: null, event: { ...task, id: null } });
  }

  function onTaskDragEnd() {
    setEventProjection(null);
  }

  function onTaskDrag(ev) {
    // store plain coordinates, not the React SyntheticEvent - the calendar only
    // reads clientX/clientY and the synthetic object is not meant to be kept
    const htmlEvent = { clientX: ev.clientX, clientY: ev.clientY };
    setEventProjection((prev) => ({ ...prev, htmlEvent }));
    ev.preventDefault();
  }

  function onTaskDrop(ev) {
    if (!api || !eventProjection?.event.start || !eventProjection.event.end)
      return;
    ev.preventDefault();
    void api.exec('add-event', {
      event: { ...eventProjection.event, duration: null },
    });
    setEventProjection(null);
  }

  function formatDuration(minutes) {
    if (minutes >= 1440) return `${minutes / 1440} day`;
    if (minutes >= 60) return `${minutes / 60} h`;
    return `${minutes} min`;
  }

  return (
    <div className={`demo ${scope}`}>
      <div className={`tasks ${scope}`}>
        <h4 className={scope}>Tasks</h4>
        <p className={`hint ${scope}`}>
          Drag a task onto the calendar — it previews as an event box and is
          created on drop.
        </p>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task ${scope}`}
            draggable="true"
            onDragStart={(ev) => onTaskDragStart(ev, task)}
            onDragEnd={onTaskDragEnd}
            role="listitem"
          >
            <div className={`task-title ${scope}`}>{task.text}</div>
            <div className={`task-duration ${scope}`}>
              {formatDuration(task.duration / 60000)}
            </div>
          </div>
        ))}
      </div>

      <div
        className={`calendar-box ${scope}`}
        role="group"
        aria-label="Calendar drop area"
        onDragOver={onTaskDrag}
        onDrop={onTaskDrop}
      >
        <Calendar
          init={setApi}
          events={dataRef.current}
          date={date}
          view="day"
          views={['day', 'month']}
          eventProjection={eventProjection}
        />
        {api && <Editor api={api} />}
      </div>
    </div>
  );
}

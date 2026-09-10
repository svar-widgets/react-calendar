import './EventProjection.css';

const scope = 'wx-aaaZjSFb';
const gap = 2;

function getStyle(primitive, dx, dy) {
  const left = primitive.x * dx + gap;
  const top = primitive.y * dy + gap;
  const width = Math.max(2, primitive.width * dx - gap * 2);
  const height = Math.max(2, primitive.height * dy - gap * 2);
  return { left, top, width, height };
}

export default function EventProjection({ primitives, dx, dy }) {
  return (
    <div className={`wx-event-placeholders ${scope}`} aria-hidden="true">
      {primitives.map((primitive) => (
        <div
          key={primitive.id}
          className={`wx-event-placeholder ${scope}`}
          style={getStyle(primitive, dx, dy)}
        ></div>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { getData } from '../data.js';
import { Calendar, Editor, getToolbarItems } from '../../src/';
import { Layout, Cell } from '@svar-ui/react-layout';
import { Segmented } from '@svar-ui/react-core';
import './Responsive.css';

const scope = 'wx-aac7T7zN';

const buttons = getToolbarItems().filter((item) => item.id !== 'today');
buttons.find((item) => item.id === 'modes').comp = 'segmented-navigation';

const options = [
  { id: 'mobile', label: 'Mobile' },
  { id: 'desktop', label: 'Desktop' },
];

export default function Responsive() {
  const { data, date } = getData();
  const [api, setApi] = useState(null);
  const [size, setSize] = useState('mobile');

  function onSizeChange({ value }) {
    setSize(value);
  }

  return (
    <div className={`responsive ${scope}`}>
      <Layout direction="column">
        <Cell height={32} css="toolbar">
          <Segmented options={options} onChange={onSizeChange} value={size} />
        </Cell>
        <Cell css={`wrapper size-${size}`}>
          <Calendar
            toolbar={{ items: buttons }}
            init={setApi}
            events={data}
            date={date}
            views={['day', 'month', 'agenda', 'year']}
          >
            {api && <Editor api={api} />}
          </Calendar>
        </Cell>
      </Layout>
    </div>
  );
}

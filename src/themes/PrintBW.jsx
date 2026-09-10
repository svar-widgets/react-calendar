import Willow from './Willow.jsx';
import './PrintBW.css';

function PrintBW({ fonts = true, children }) {
  return children ? (
    <Willow fonts={fonts}>
      <div className="wx-bw-theme">{children}</div>
    </Willow>
  ) : (
    <Willow fonts={fonts} />
  );
}

export default PrintBW;

import Willow from './Willow.jsx';
import './Print.css';

function Print({ fonts = true, children }) {
  return children ? (
    <Willow fonts={fonts}>
      <div className="wx-print-theme">{children}</div>
    </Willow>
  ) : (
    <Willow fonts={fonts} />
  );
}

export default Print;

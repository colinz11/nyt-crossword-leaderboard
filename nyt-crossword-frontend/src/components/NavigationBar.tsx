import React from 'react';
import { Link } from 'react-router-dom';

const NavigationBar: React.FC = () => {
  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <ul style={{ listStyleType: 'none', margin: 0, padding: 0, display: 'flex' }}>
        <li style={{ marginRight: '20px' }}>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/puzzle">Puzzle</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar;

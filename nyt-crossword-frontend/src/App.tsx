import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserPage from './pages/UserPage'; // Import the UserPage component

const App: React.FC = () => {
  return (
    <Router>
    <div>
      <h1>Hello World</h1>
      <Routes>
        {/* Route for the UserPage */}
        <Route path="/users/:userId" element={<UserPage />} />
      </Routes>
    </div>
  </Router>

  );
};

export default App;
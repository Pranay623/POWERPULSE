import { useState } from 'react';
import './App.css';
import Starter from './components/Starter/Starter';
import SignInUpForm from './components/signupin/sign';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LocationBox from './components/main/Main';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/start" />} />
        <Route path="/start" element={<Starter />} />
        <Route path="/sign" element={<SignInUpForm />} />
        <Route path="/main" element={<LocationBox />} />
      </Routes>
    </Router>
  );
}

export default App;

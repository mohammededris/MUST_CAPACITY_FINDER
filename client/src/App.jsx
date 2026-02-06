import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import IntroPage from './components/IntroPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
            <Route path="/" element={<IntroPage />} />
            <Route path="/register" element={<LandingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

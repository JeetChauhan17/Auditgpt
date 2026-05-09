import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import FraudRadar from './pages/FraudRadar'
import Report from './pages/Report'
import './App.css'
import SatyamPage from "./pages/SatyamPage";
import CaseStudiesPage from "./pages/CaseStudiesPage";
import CriticalSection from "./pages/CriticalSection";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/radar" element={<FraudRadar />} />
          <Route path="/report/:companyId" element={<Report />} />
          <Route path="/satyam" element={<SatyamPage />} />
          <Route path="/cases" element={<CaseStudiesPage />} /> 
          <Route path="/critical" element={<CriticalSection />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
export default App
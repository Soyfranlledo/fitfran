import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { TabBar } from './components/TabBar';
import { Today } from './pages/Today';
import { Training } from './pages/Training';
import { WorkoutSessionPage } from './pages/WorkoutSession';
import { ExerciseDetail } from './pages/ExerciseDetail';
import { Nutrition } from './pages/Nutrition';
import { Health } from './pages/Health';
import { Settings } from './pages/Settings';

function App() {
  return (
    <HashRouter>
      <div className="mx-auto max-w-md min-h-full pb-28">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/entreno" element={<Training />} />
          <Route path="/entreno/sesion/:dayId" element={<WorkoutSessionPage />} />
          <Route path="/entreno/ejercicio/:exId" element={<ExerciseDetail />} />
          <Route path="/nutricion" element={<Nutrition />} />
          <Route path="/salud" element={<Health />} />
          <Route path="/ajustes" element={<Settings />} />
        </Routes>
      </div>
      <TabBar />
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

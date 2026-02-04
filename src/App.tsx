import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { AICopilot } from '@/components/ai/AICopilot';

import routes from './routes';

import { Toaster } from '@/components/ui/toaster';

const App: React.FC = () => {
  return (
    <Router>
      <IntersectObserver />
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.element}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AICopilot />
      <Toaster />
    </Router>
  );
};

export default App;

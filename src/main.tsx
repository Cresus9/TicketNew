import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { CMSProvider } from './context/CMSContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { NotificationProvider } from './context/NotificationContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <EventProvider>
        <CMSProvider>
          <RealtimeProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </RealtimeProvider>
        </CMSProvider>
      </EventProvider>
    </AuthProvider>
  </StrictMode>
);
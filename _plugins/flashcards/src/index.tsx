import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { PluginProvider } from './utils/plugin/providers/PluginProvider';
import { HashRouter, Route, Routes } from "react-router-dom";
import './index.css';
import { EventEmitterProvider } from './utils/plugin/providers/EventEmitterContext';
import setTheme from './utils/plugin/ThemeSetter';

setTheme();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const Home = lazy(() => import('./routes/DeckOverviewPage'));
const AddCard = lazy(() => import('./routes/toolbar/AddCardPage'));
const Training = lazy(() => import('./routes/deck/FlashcardTrainingPage'));
const SettingsPage = lazy(() => import('./routes/settings/SettingsPage'));
const TranslationSidebar = lazy(() => import('./routes/toolbar/TranslatorPage'));

root.render(
  <React.StrictMode>
    <PluginProvider>
      <div className='text-gray-800 dark:text-gray-200 min-h-[600px]'>
        <EventEmitterProvider>
          <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/deck/:id" element={<Training />} />
              <Route path="/sidebar/add" element={<AddCard />} />
              <Route path="/sidebar/translate" element={<TranslationSidebar />} />
            </Routes>
          </HashRouter>
        </EventEmitterProvider>
      </div>
    </PluginProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

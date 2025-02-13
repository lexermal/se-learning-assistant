import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { PluginProvider } from 'shared-components';
import { HashRouter, Route, Routes } from "react-router-dom";
import { EventEmitterProvider } from 'shared-components';
import { setTheme } from 'shared-components/dist/utils/plugin/ThemeSetter';
import './index.css';
import 'shared-components/dist/style.css';

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
  // <React.StrictMode>
    <PluginProvider>
      <div className='bg-green-300 text-gray-900 dark:text-gray-200 min-h-[600px]'>
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
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

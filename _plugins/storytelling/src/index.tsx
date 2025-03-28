import React, { lazy } from 'react';
// import App from './routes/App';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { PluginProvider, setTheme } from '@rimori/client';
import { HashRouter, Route, Routes } from "react-router-dom";
import './index.css';
// import AddCard from './routes/toolbar/AddCard';
// import SilentReading from './routes/silentReading/page';
import '@rimori/client/dist/style.css';

setTheme();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const SilentReading = lazy(() => import('./routes/silentReading/page'));
const SettingsPage = lazy(() => import('./routes/settings/SettingsPage'));
const DiscussionsPage = lazy(() => import('./routes/discussions/page'));


root.render(
  // <React.StrictMode>
    <PluginProvider>
      <div className='dark:bg-gray-950 bg-white text-gray-900 dark:text-gray-200 min-h-[600px]'>
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* <Route path="/" element={<App />} /> */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/silent-reading" element={<SilentReading />} />
            <Route path="/discussions" element={<DiscussionsPage />} />
            {/* <Route path="/deck/:id" element={<Training />} />
          <Route path="/sidebar/add" element={<AddCard />} /> */}
          </Routes>
        </HashRouter>
      </div>
    </PluginProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React from 'react';
import App from './routes/App';
import ReactDOM from 'react-dom/client';
import Training from './routes/deck/Training';
import reportWebVitals from './reportWebVitals';
import { PluginProvider } from './utils/PluginProvider';
import { HashRouter, Route, Routes } from "react-router-dom";
import './index.css';
import AddCard from './routes/toolbar/AddCard';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <PluginProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/deck/:id" element={<Training />} />
          <Route path="/sidebar/add" element={<AddCard />} />
        </Routes>
      </HashRouter>
    </PluginProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

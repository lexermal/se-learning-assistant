import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './routes/App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import TestApp from './routes/test/page';
import { PluginProvider } from './utils/PluginProvider';
import Training from './routes/deck/Training';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
  { path: "/", element: <App />, },
  { path: "/test", element: <TestApp />, },
  { path: "/deck/:id", element: <Training />, },
]);

root.render(
  <React.StrictMode>
    <PluginProvider>
      <RouterProvider router={router} />
    </PluginProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

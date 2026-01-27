import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Version logging
const version = __APP_VERSION__ || '0.0.0-dev';
const buildTime = __BUILD_TIME__ || 'unknown';

console.log(
    `%c PO Tool %c v${version} %c ${buildTime} `,
    'background: #4f46e5; padding: 2px 4px; border-radius: 4px 0 0 4px; color: #fff; font-weight: bold;',
    'background: #312e81; padding: 2px 4px; color: #fff;',
    'background: #000; padding: 2px 4px; border-radius: 0 4px 4px 0; color: #fbbf24; font-family: monospace;'
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

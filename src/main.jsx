import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Version logging
const version = __APP_VERSION__ || '0.0.0-dev';
console.log(
    `%c PO Tool %c v${version} %c`,
    'background: #4f46e5; padding: 2px 4px; border-radius: 4px 0 0 4px; color: #fff; font-weight: bold;',
    'background: #312e81; padding: 2px 4px; border-radius: 0 4px 4px 0; color: #fff;',
    'background: transparent'
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

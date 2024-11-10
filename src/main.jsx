import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // ตรวจสอบให้แน่ใจว่า path ของไฟล์ถูกต้อง
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

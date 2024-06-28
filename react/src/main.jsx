import React from 'react'
import ReactDOM from 'react-dom/client'
import MainProvider from './providers/MainProvider';
import './assets/css/style.css';

const container = ReactDOM.createRoot(document.getElementById('root'));

container.render(<MainProvider />);
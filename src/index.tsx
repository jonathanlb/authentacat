import React from 'react';
import ReactDOM from 'react-dom/client';
import { BehaviorSubject, debounceTime } from 'rxjs';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { newDemoConfig } from './demoConfig';
import { newConfig } from './config';

import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

const demoMode = false;
const showRideShare = true;

const latestEventFirst = new BehaviorSubject(
  localStorage['latestEventFirst'] === 'true');
const listAllEvents = new BehaviorSubject(
  localStorage['listAllEvents'] === 'true');
const appProps = {
  config: demoMode ?
    newDemoConfig() :
    newConfig({ listAllEvents: listAllEvents.pipe(debounceTime(1000)) }),
  latestEventFirst: latestEventFirst,
  listAllEvents: listAllEvents,
  showRideShare: showRideShare,
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App {...appProps} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

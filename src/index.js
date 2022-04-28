import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css'
import './index.css';
import App from './frontend/components/App.js';

import * as serviceWorker from './serviceWorker';

// import reportWebVitals from './reportWebVitals';
// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

/*
Service workers are well explained in this article:
 https://developers.google.com/web/fundamentals/primers/service-workers/. 
To Summarise: 
A service worker is a script that your browser runs in the background, 
separate from a web page, opening the door to features that don't need 
a web page or user interaction. Today, they already include features like 
push notifications and background sync and have ability to intercept and 
handle network requests, including programmatically managing a cache of responses.
In the future, service workers might support other things like periodic sync or geofencing.
    According to this PR to create-react-app : https://github.com/facebook/create-react-app/pull/1728  
Service workers are introduced with create-react-app via SWPrecacheWebpackPlugin.
Using a server worker with a cache-first strategy offers performance advantages, 
since the network is no longer a bottleneck for fulfilling navigation requests.
It does mean, however, that developers (and users) will only see deployed updates
on the "N+1" visit to a page, since previously cached resources are updated in the background.
  The call to register service worker is enabled by default in new apps but you can always remove it
and then you’re back to regular behaviour.  

_____ If you want your app to work offline and load faster, you can change _____
  unregister() to register() below. Note this comes with some pitfalls.
  Learn more about service workers: https://bit.ly/CRA-PWA
*/
serviceWorker.unregister();

/*  Start the App  */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
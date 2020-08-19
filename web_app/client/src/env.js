(function (window) {
    window.__env = window.__env || {};
  
    // API url
    window.__env.apiUrl = 'http://localhost:3000/api';

    // Socket endpoint for real time data exchange
    window.__env.SOCKET_ENDPOINT = 'http://localhost:3000/api'
  
    // Whether or not to enable debug mode
    // Setting this to false will disable console output
    window.__env.enableDebug = true;
    
    window.__env.NODE_ENV = 'development';
  }(this));
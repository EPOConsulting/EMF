/*
 * ema.js
 * Root namespace module 
 */
var ema = (function () {
  'use strict';
  window.name = 'ema_main_window';
  var initModule = function ($container) {
    ema.shell.configModule();
    ema.shell.initModule($container);
  };
  return { initModule: initModule };
}());
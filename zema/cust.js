/*
 * ema.cust.js
 * sample module for EMA
 */
/*global unescape*/
ema.cust = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  configMap = {
      main_html : String()
  },
  stateMap = {
      container  : undefined
  },

  //internal functions
  generateHTML;

  //public functions
  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/
  //Begin INTERNAL method /generateHTML/
  generateHTML = function () {
    try {
      configMap.main_html = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
      //Start Formcontainer
      '<div class="mhcontent"></div>';
    } catch (e) {
      ema.shell.handleError('generateHTML', e, 'e');
    }
  };
  //End INTERNAL method /generateHTML/
  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
  // Begin Public method /syncFreigabeComplete/
  // End PUBLIC method /syncFreigabeComplete/

  /*
  return { 
    syncFreigabeComplete : syncFreigabeComplete
  };
  */
  //------------------- END PUBLIC METHODS ---------------------
}());

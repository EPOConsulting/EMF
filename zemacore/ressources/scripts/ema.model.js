/*
 * ema.model.js
 * Model module
 */
/*global unescape*/
ema.model = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  logouttimer = null,

  //internal functions
  setLanguagePattern, getUriParameterSub, base64Encode,

  //public functions
  saveToLocalStorage, loadFromLocalStorage, startTimerTask,
  terminateTimerTask, checkLogoutTime, loadLanguagePattern,
  setLogoutTime, setAutosaveNextSave, generateRequestURL, 
  generateSearchURL, formatDateForSap, formatTimeForSap, 
  formatSapDateForDisplay, formatDateTimeForDisplay, formatDateForDisplay, 
  formatTimeForDisplay, generateLeadingZeros, generateCurrentDateTime, 
  getUriParameter, getUri, getDecodedUri, 
  getHostname, generateJSDate, formatNumberForDisplay, 
  formatCurrencyForDisplay, formatNumberForSAP, validateNumericInput, 
  formatSAPDateForInputField, replaceSpecialChars, isNumber, 
  generateAuthHeader, generateRequestObj, detectBrowser, 
  removeLineBreak, addLineBreak, checkLanguagePattern,
  addSearchParameter;

  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/
  //Begin INTERNAL method /setLanguagePattern/
  /*
   * loads selected language
   */
  setLanguagePattern = function (generateMenu) {
    try {
      var 
      category = null, 
      item = null,
      json = ema.shell.getStateMapValue('languageJson');
      for (category in json) {
        if (json.hasOwnProperty(category)) {
          for (item in json[category]) {
            if (json[category].hasOwnProperty(item)) {
              $("." + item).html(json[category][item]);
            }
          }
        }
      }
      if (ema.menu !== undefined && generateMenu === true) {
        ema.menu.generateMenu();
      }
    } catch (e) {
      ema.shell.handleError("setLanguagePattern", e, 'e');
    }
  };
  //End INTERNAL method /setLanguagePattern/
  //Begin INTERNAL method /getUriParameterSub/
  getUriParameterSub = function (paramStr, paramName) {
    try {
      var
      i,
      strReturn,
      strReturnSub,
      uriParams,
      paramPairs,
      paramValue;
      
      strReturn = null;
      
      if (paramStr.indexOf('&') !== -1) {
        //there is more then one parameter in the string
        uriParams = decodeURIComponent(paramStr);
        paramPairs = uriParams.split('&');
        for (i = 0; i < paramPairs.length; i += 1) {
          strReturnSub = getUriParameterSub(paramPairs[i], paramName);
          if (strReturnSub !== null) {
            strReturn = strReturnSub;
          }
        }
      } else if (paramStr.toLowerCase().indexOf(paramName.toLowerCase() + '=') > -1) {
        //parameter found
        paramValue = paramStr.split('=');
        if (paramValue[0].toLowerCase() === paramName.toLowerCase()) {
          strReturn = paramValue[1];
        }
      } else {
        //try to decode the param once more
        try {
          uriParams = decodeURIComponent(window.atob(paramStr));
          strReturnSub = getUriParameterSub(uriParams, paramName);
          if (strReturnSub !== null) {
            strReturn = strReturnSub;
          }
        } catch (e2) {}
      }

      return strReturn;
    } catch (e) {
      ema.shell.handleError("getUriParameterSub", e, 'e');
    }
  };
  //End INTERNAL method /getUriParameterSub/
  //Begin INTERNAL method /Base64Encode/
  base64Encode = function (stringToEncode) {
    try {
      var b64, o1, o2, o3, bits, h1, h2, h3, h4, e = [], pad = '', c;
      
      if (/([^\u0000-\u00ff])/.test(stringToEncode)) throw Error('String must be ASCII');

      b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

      c = stringToEncode.length % 3;  // pad string to length of multiple of 3
      if (c > 0) { 
        while (c++ < 3) { 
          pad += '='; 
          stringToEncode += '\0'; 
        } 
      }
      // note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars

      for (c = 0; c < stringToEncode.length; c += 3) {  // pack three octets into four hexets
        o1 = stringToEncode.charCodeAt(c);
        o2 = stringToEncode.charCodeAt(c + 1);
        o3 = stringToEncode.charCodeAt(c + 2);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hextets to index into code string
        e[c / 3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
      }
      stringToEncode = e.join('');  // use Array.join() for better performance than repeated string appends

      // replace 'A's from padded nulls with '='s
      stringToEncode = stringToEncode.slice(0, stringToEncode.length - pad.length) + pad;

      return stringToEncode;
    } catch (error) {
      ema.shell.handleError("getUriParameterSub", error, 'e');
    }
  };
  //End INTERNAL method /getUriParameterSub/
  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
  //Begin PUBLIC method /saveToLocalStorage/
  saveToLocalStorage = function (key, value) {
    try {
      localStorage[window.btoa(encodeURI(key))] = window.btoa(encodeURI(value));
    } catch (e) {
      ema.shell.handleError("saveToLocalStorage", e, 'e');
    }
  };
  //End PUBLIC method /saveToLocalStorage/
  //Begin PUBLIC method /loadFromLocalStorage/
  loadFromLocalStorage = function (key) {
    try {
      var value = localStorage[window.btoa(encodeURI(key))];
      if (value === undefined) {
        return "";
      } else if (decodeURI(window.atob(value)).indexOf('undefined') > -1) {
        return "";
      } else {
        return decodeURI(window.atob(value));
      }
    } catch (e) {
      ema.shell.handleError("loadFromLocalStorage", e, 'e');
    }
  };
  //End PUBLIC method /loadFromLocalStorage/
  //Begin PUBLIC method /startTimerTask/
  /*
   *  starts webworker for automatic logout 
   */
  startTimerTask = function () {
    try {
      logouttimer = new Worker(ema.shell.getConfigMapConfigValue('COREPATH') + 'ressources/scripts/minutetimer.js');

      logouttimer.onmessage = function (event) {
        ema.model.checkLogoutTime(event);
        ema.shell.processAutosave();
      };
    } catch (e) {
      ema.shell.handleError("startTimerTask", e, 'e');
    }
  };
  //End PUBLIC method /startTimerTask/
  //Begin PUBLIC method /terminateTimerTask/
  /*
   *  stops webworker for automatic logout 
   */
  terminateTimerTask = function () {
    try {
      logouttimer.terminate();
    } catch (e) {
      ema.shell.handleError("terminateTimerTask", e, 'e');
    }
  };
  //End PUBLIC method /terminateTimerTask/
  //Begin PUBLIC method /checkLogoutTime/
  checkLogoutTime = function (event) {
    try {
      var 
      logoutTime = loadFromLocalStorage("LogoutTime"),
      aktTime = new Date();

      if (logoutTime - aktTime.getTime() <= 0) {
        //login expired -> logout user
        ema.shell.logout();
      }
    } catch (e) {
      ema.shell.handleError("checkLogoutTime", e, 'e');
    }
  };
  //End PUBLIC method /checkLogoutTime/
  //Begin PUBLIC method /setLogoutTime/
  /*
   * sets logouttime to now + x minutes
   */
  setLogoutTime = function () {
    try {
      var datum = new Date();
      datum.setMinutes(datum.getMinutes() + ema.shell.getLogoutminutes());
      saveToLocalStorage("LogoutTime", datum.getTime());
    } catch (e) {
      ema.shell.handleError("setLogoutTime", e, 'e');
    }
  };
  //End PUBLIC method /setLogoutTime/
  //Begin PUBLIC method /setAutosaveNextSave/
  /*
   * sets AutosaveNextSave to now + x minutes
   */
  setAutosaveNextSave = function () {
    try {
      var datum = new Date();
      datum.setMinutes(datum.getMinutes() + (ema.shell.getConfigMapConfigValue('AUTOSAVEMINUTES') * 1));
      saveToLocalStorage("AutosaveNextSave", datum.getTime());
    } catch (e) {
      ema.shell.handleError("setAutosaveNextSave", e, 'e');
    }
  };
  //End PUBLIC method /setAutosaveNextSave/
  //Begin PUBLIC method /loadLanguagePattern/
  /*
   * loads a language json from local storage and sets the language
   */
  loadLanguagePattern = function (newLanguage, generateMenu) {
    try {
      if (ema.shell.getStateMapValue('languageJson') === undefined) {
        ema.shell.setLanguage(JSON.parse(loadFromLocalStorage('languageString_' + newLanguage)));
        setLanguagePattern(generateMenu);
      } else {
        setLanguagePattern(generateMenu);
      }
    } catch (e) {
      ema.shell.handleError("loadLanguagePattern", e, 'e');
    }
  };
  //End PUBLIC method /loadLanguagePattern/
  //Begin PUBLIC method /generateRequestURL/
  /*
   * generates a URI for a request to EPO Connector in SAP
   */
  generateRequestURL = function (internalName) {
    try {
      var operation, jsonFormat, indexedDbConfig, reqURL, i, stateful;
      
      indexedDbConfig = ema.shell.getConfigMapIndexedDb();
      operation = '';
      jsonFormat = ema.shell.getConfigMapConfigValue('JSON_FORMAT');
      for (i = 0; i < indexedDbConfig.OBJECTSTTORES.length; i += 1) {
        if (indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME === internalName) {
          operation = indexedDbConfig.OBJECTSTTORES[i].OPERATION;
          if (indexedDbConfig.OBJECTSTTORES[i].JSONFORMAT !== '') {
            jsonFormat = indexedDbConfig.OBJECTSTTORES[i].JSONFORMAT;
          }
          stateful = false;
          if (indexedDbConfig.OBJECTSTTORES[i].STATEFUL !== undefined) {
            if (indexedDbConfig.OBJECTSTTORES[i].STATEFUL === 'true') {
              stateful = true;
            }
          }
        }
      }
      
      if (operation !== undefined && operation !== "") {
        reqURL = "";

        if (jsonFormat === undefined || jsonFormat === null) {
          jsonFormat = ema.shell.getConfigMapConfigValue('JSON_FORMAT');
        }
        reqURL += ema.shell.getConfigMapConfigValue('HOSTPROTOCOL') + '://';
        reqURL += ema.shell.getConfigMapConfigValue('HOSTURL') + ':';
        reqURL += ema.shell.getConfigMapConfigValue('HOSTPORT');
        if (internalName === "LOGON") {
          reqURL += ema.shell.getConfigMapConfigValue('LOGINPATH');
        } else if (stateful === true) {
          reqURL += ema.shell.getConfigMapConfigValue('STATEFULPATH');
        } else {
          reqURL += ema.shell.getConfigMapConfigValue('HOSTPATH');
        }
        reqURL += "?operation=" + operation;
        reqURL += "&sap-client=" + ema.shell.getConfigMapConfigValue('CLIENT');
        reqURL += "&sap-language=" + ema.shell.getStateMapValue('selected_language').toUpperCase();
        reqURL += "&json_strip=" + ema.shell.getConfigMapConfigValue('JSON_STRIP');
        reqURL += "&json_format=" + jsonFormat;
        reqURL += "&debug=" + ema.shell.getConfigMapConfigValue('DEBUG');
        reqURL += "&timeout=" + ema.shell.getConfigMapConfigValue('HOSTTIMEOUT');
        reqURL += "&sequence=1";
        if (internalName !== "LOGON" && ema.shell.getConfigMapConfigValue('AJAX_AUTH') === 'url') {
          reqURL += "&sap-user=" + loadFromLocalStorage("curr_username");
          reqURL += "&sap-password=" + replaceSpecialChars(loadFromLocalStorage("curr_password"));
        }
        return reqURL;
      } else {
        ema.shell.handleCustomError("generateRequestURL", "errgeneraterequesturl", 'e');
      }
    } catch (e) {
      ema.shell.handleError("generateRequestURL", e, 'e');
    }
  };
  //End PUBLIC method /generateRequestURL/
  //Begin PUBLIC method /generateSearchURL/
  /*
   * generates an URI for a request to EPO Search in SAP
   */
  generateSearchURL = function (table, searchVal, limit) {
    try {
      var reqURL;
      
      if (limit === undefined) {
        limit = 20;
      }
      reqURL = '';
      reqURL += ema.shell.getConfigMapConfigValue('HOSTPROTOCOL') + '://';
      reqURL += ema.shell.getConfigMapConfigValue('HOSTURL') + ':';
      reqURL += ema.shell.getConfigMapConfigValue('HOSTPORT');
      reqURL += ema.shell.getConfigMapConfigValue('SEARCHPATH');
      reqURL += "?operation=search";
      reqURL += "&locale=" + ema.shell.getStateMapValue('selected_language').toLowerCase();
      reqURL += "&sap-language=" + ema.shell.getStateMapValue('selected_language').toLowerCase();
      reqURL += "&timeout=" + ema.shell.getConfigMapConfigValue('HOSTTIMEOUT');
      reqURL += "&format=1";
      if (ema.shell.getConfigMapConfigValue('AJAX_AUTH') === 'url') {
        reqURL += "&sap-user=" + loadFromLocalStorage("curr_username");
        reqURL += "&sap-password=" + replaceSpecialChars(loadFromLocalStorage("curr_password"));
      }
      reqURL += "&limit=" + limit;
      reqURL += "&table=" + table;
      reqURL += "&showperpage=" + limit;
      reqURL += "&page=1";
      reqURL += "&sequence=10";
      reqURL += "&key=" + window.btoa(unescape(encodeURIComponent(searchVal)));
     
      return reqURL;
    } catch (e) {
      ema.shell.handleError("generateSearchURL", e, 'e');
    }
  };
  //End PUBLIC method /generateSearchURL/
  //Begin PUBLIC method /formatDateForSap/
  /*
   * formats a datestring for SAP - yyyymmdd
   */
  formatDateForSap = function (strDate) {
    try {
      var
      tmpString = '',
      tmpDate = new Date(strDate);
      if (strDate !== '' && !isNaN(tmpDate.getTime())) {
        tmpString = '' + tmpDate.getFullYear();
        tmpString += '-' + generateLeadingZeros(tmpDate.getMonth() + 1, 2);
        tmpString += '-' + generateLeadingZeros(tmpDate.getDate(), 2);
      }
      return tmpString;
    } catch (e) {
      ema.shell.handleError("formatDateForSap", e, 'e');
    }
  };
  //End PUBLIC method /formatDateForSap/
  //Begin PUBLIC method /formatTimeForSap/
  /*
   * formats a timestring for SAP - hh:mm:ss
   */
  formatTimeForSap = function (strTime) {
    try {
      if (strTime.length === 5) {
        strTime += ':00';
      }
      return strTime;
    } catch (e) {
      ema.shell.handleError("formatTimeForSap", e, 'e');
    }
  };
  //End PUBLIC method /formatTimeForSap/
  //Begin PUBLIC method /formatSapDateForDisplay/
  /*
   * formats a datestring for display
   * expects format is either yyyymmdd or yyyy-mm-dd
   * returns format dd.mm.yyyy 
   */
  formatSapDateForDisplay = function (strDate) {
    try {
      var 
      year, 
      month, 
      day, 
      tmpString,
      tmpArr;

      if (strDate.indexOf('-') > -1) {
        tmpArr = strDate.split('-');
        year = tmpArr[0];
        month = tmpArr[1];
        day = tmpArr[2];
      } else {
        year = strDate.substring(0, 4);
        month = strDate.substring(4, 6);
        day = strDate.substring(6, 8);
      }

      tmpString = day + '.' + month + '.' + year;

      return tmpString;
    } catch (e) {
      ema.shell.handleError("formatSapDateForDisplay", e, 'e');
    }
  };
  //End PUBLIC method /formatSapDateForDisplay/
  //Begin PUBLIC method /formatDateTimeForDisplay/
  /*
   * formats a datetimestring for display
   * expects a date
   * returns format dd.mm.yyyy hh:mm:ss
   */
  formatDateTimeForDisplay = function (newDate) {
    try {
      var year, month, day, hours, minutes, seconds, tmpString;
      
      year = newDate.getFullYear();
      month = generateLeadingZeros(newDate.getMonth() + 1, 2); //January is 0!
      day = generateLeadingZeros(newDate.getDate(), 2);
      hours = generateLeadingZeros(newDate.getHours(), 2);
      minutes = generateLeadingZeros(newDate.getMinutes(), 2);
      seconds = generateLeadingZeros(newDate.getSeconds(), 2);
      
      tmpString = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes + ':' + seconds;
      
      return tmpString;
    } catch (e) {
      ema.shell.handleError("formatDateTimeForDisplay", e, 'e');
    }
  };
  //End PUBLIC method /formatDateTimeForDisplay/
  //Begin PUBLIC method /formatDateForDisplay/
  /*
   * formats a datestring for display
   * expects a date
   * returns format dd.mm.yyyy
   */
  formatDateForDisplay = function (newDate) {
    try {
      var year, month, day, tmpString;
      
      if (Object.prototype.toString.call(newDate) === "[object Date]") {
        if (isNaN(newDate.getTime())) {
          return '';
        }
        else {
          year = newDate.getFullYear();
          month = generateLeadingZeros(newDate.getMonth() + 1, 2); //January is 0!
          day = generateLeadingZeros(newDate.getDate(), 2);
          
          tmpString = day + '.' + month + '.' + year;
          
          return tmpString;
        }
      }
      else {
        return '';
      }
    } catch (e) {
      ema.shell.handleError("formatDateForDisplay", e, 'e');
    }
  };
  //End PUBLIC method /formatDateForDisplay/
  //Begin PUBLIC method /formatTimeForDisplay/
  /*
   * formats a timestring for display
   * expects a date
   * returns format hh:mm:ss
   */
  formatTimeForDisplay = function (newDate) {
    try {
      var hours, minutes, seconds, tmpString;
      
      hours = generateLeadingZeros(newDate.getHours(), 2);
      minutes = generateLeadingZeros(newDate.getMinutes(), 2);
      seconds = generateLeadingZeros(newDate.getSeconds(), 2);
      
      tmpString = hours + ':' + minutes + ':' + seconds;
      
      return tmpString;
    } catch (e) {
      ema.shell.handleError("formatTimeForDisplay", e, 'e');
    }
  };
  //End PUBLIC method /formatTimeForDisplay/
  //Begin PUBLIC method /generateCurrentDateTime/
  /*
   * formats a datetimestring for display
   * expects a boolean if time should be generated
   * returns format dd.mm.yyyy hh:mm:ss or only dd.mm.yyyy
   */
  generateCurrentDateTime = function (generateTime) {
    try {
      var year, month, day, hours, minutes, seconds, newDate, tmpString;
      
      newDate = new Date();
      
      year = newDate.getFullYear();
      month = generateLeadingZeros(newDate.getMonth() + 1, 2); //January is 0!
      day = generateLeadingZeros(newDate.getDate(), 2);
      hours = generateLeadingZeros(newDate.getHours(), 2);
      minutes = generateLeadingZeros(newDate.getMinutes(), 2);
      seconds = generateLeadingZeros(newDate.getSeconds(), 2);
      
      if (generateTime === true) {
        tmpString = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes + ':' + seconds;
      } else {
        tmpString = day + '.' + month + '.' + year;
      }
      
      return tmpString;
    } catch (e) {
      ema.shell.handleError("generateCurrentDateTime", e, 'e');
    }
  };
  //End PUBLIC method /generateCurrentDateTime/
  //Begin PUBLIC method /generateJSDate/
  /*
   * expects a datestring in format dd.mm.yyyy and returns it as dateobject
   */
  generateJSDate = function (dateString) {
    try {
      var 
      tmpString, 
      newDate;
      
      tmpString = dateString.split('.');
      newDate = new Date(tmpString[2], tmpString[1], tmpString[0]);
      
      return newDate;
    } catch (e) {
      ema.shell.handleError("generateJSDate", e, 'e');
    }
  };
  //End PUBLIC method /generateJSDate/
  //Begin PUBLIC method /generateLeadingZeros/
  /*
   * generates x digits of leading zeros as string
   */
  generateLeadingZeros = function (origNumber, digits) {
    try {
      var strReturn = '';

      strReturn = '' + origNumber;
      if (origNumber === '') {
        return '';
      } else {
        while (strReturn.length < digits) {
          strReturn = '0' + strReturn;
        }
        if (strReturn.length > digits) {
          return strReturn.substring(0, digits);
        } else {
          return strReturn;
        }
      }
    } catch (e) {
      ema.shell.handleError("generateLeadingZeros", e, 'e');
    }
  };
  //End PUBLIC method /generateLeadingZeros/
  //Begin PUBLIC method /getUriParameter/
  getUriParameter = function (uri, paramName) {
    try {
      var
      strReturn,
      uriSplit;      
      strReturn = null;
      uriSplit = uri.split('#');
      if (uriSplit.length > 1) {
        strReturn = getUriParameterSub(uriSplit[1], paramName);
      }

      return strReturn;
    } catch (e) {
      ema.shell.handleError("getUriParameter", e, 'e');
    }
  };
  //End PUBLIC method /getUriParameter/
  //Begin PUBLIC method /getUri/
  getUri = function (uri) {
    try {
      var
      uriSplit;
      
      uriSplit = uri.split('#');

      return uriSplit[0];
    } catch (e) {
      ema.shell.handleError("getUri", e, 'e');
    }
  };
  //End PUBLIC method /getUri/
  //Begin PUBLIC method /getDecodedUri/
  getDecodedUri = function (uri) {
    try {
      var
      uriSplit;
      
      uriSplit = uri.split('#');
      
      if (uriSplit[1].indexOf('&') !== -1) {
        return uri;
      } else {
        return uriSplit[0] + '#' + decodeURIComponent(window.atob(uriSplit[1]));
      }
    } catch (e) {
      ema.shell.handleError("getDecodedUri", e, 'e');
    }
  };
  //End PUBLIC method /getDecodedUri/
  //Begin PUBLIC method /getHostname/
  getHostname = function (uri) {
    try {
      var parser = document.createElement('a');
      parser.href = uri;

      /*
      parser.protocol; // => "http:"
      parser.host;     // => "example.com:3000"
      parser.hostname; // => "example.com"
      parser.port;     // => "3000"
      parser.pathname; // => "/pathname/"
      parser.hash;     // => "#hash"
      parser.search;   // => "?search=test"
      */
      
      return parser.hostname;
    } catch (e) {
      ema.shell.handleError("getHostname", e, 'e');
    }
  };
  //End PUBLIC method /getHostname/
  //Begin PUBLIC method /formatNumberForDisplay/
  formatNumberForDisplay = function (numberValue) {
    try {
      var numberStr;
      
      numberStr = numberValue + '';
      numberStr = numberStr.replace('.', ',');
      return numberStr;
    } catch (e) {
      ema.shell.handleError("formatNumberForDisplay", e, 'e');
    }
  };
  //End PUBLIC method /formatNumberForDisplay/
  //Begin PUBLIC method /formatCurrencyForDisplay/
  formatCurrencyForDisplay = function (numberValue) {
    try {
      var 
      numberStr, 
      numberSplit,
      i,
      mod,
      vorKomma,
      nachKomma;
      
      numberStr = numberValue + '';
      numberSplit = numberStr.split('.');
      if (numberSplit.length === 1) {
        nachKomma = '00';
      } else {
        while (numberSplit[1].length < 2) {
          numberSplit[1] += '0';
        }
        nachKomma = numberSplit[1];
      }
      
      if (numberSplit[0].length > 3) {
        mod = numberSplit[0].length % 3;
        vorKomma = (mod > 0 ? (numberSplit[0].substring(0, mod)) : '');
        for (i = 0; i < Math.floor(numberSplit[0].length / 3); i += 1) {
          if ((mod === 0) && (i === 0)) {
            vorKomma += numberSplit[0].substring(mod + 3 * i, mod + 3 * i + 3);
          } else {
            vorKomma += '.' + numberSplit[0].substring(mod + 3 * i, mod + 3 * i + 3);
          }
        }
      } else {
        vorKomma = numberSplit[0];
      }
      
      return vorKomma + ',' + nachKomma;
    } catch (e) {
      ema.shell.handleError("formatCurrencyForDisplay", e, 'e');
    }
  };
  //End PUBLIC method /formatCurrencyForDisplay/
  //Begin PUBLIC method /formatNumberForSAP/
  formatNumberForSAP = function (numberValue) {
    try {
      if (numberValue === '' || isNaN(numberValue)) {
        return 0;
      } else {
        return numberValue * 1;
      }
    } catch (e) {
      ema.shell.handleError("formatNumberForSAP", e, 'e');
    }
  };
  //End PUBLIC method /formatNumberForSAP/
  //Begin PUBLIC method /validateNumericInput/
  validateNumericInput = function (fieldId, kommastellen) {
    try {
      var betragSplit;
      ema.formgenerator.hideError(fieldId);
      if (isNumber($('#' + fieldId).val()) === false) {
        ema.formgenerator.showError(fieldId);
        if (event.type === 'blur') {
          $('#' + fieldId).val('');
        }
      } else if ($('#' + fieldId).val().indexOf('.') > -1) {
        betragSplit = $('#' + fieldId).val().split('.');
        if (betragSplit[1].length > kommastellen) {
          ema.formgenerator.showError(fieldId);
          if (kommastellen * 1 === 0) {
            $('#' + fieldId).val(betragSplit[0]);
          } else {
            $('#' + fieldId).val(betragSplit[0] + '.' + betragSplit[1].substr(0, kommastellen));
          }
        }
      }
    } catch (e) {
      ema.shell.handleError("validateNumericInput", e, 'e');
    }
  };
  //End PUBLIC method /validateNumericInput/
  //Begin PUBLIC method /formatSAPDateForInputField/
  formatSAPDateForInputField = function (strDate) {
    try {
      var 
      year, 
      month, 
      day;

      if (strDate.indexOf('-') === -1) {
        year = strDate.substring(0, 4);
        month = strDate.substring(4, 6);
        day = strDate.substring(6, 8);
        return year + '-' + month + '-' + day;
      } else {
        return strDate;
      }
    } catch (e) {
      ema.shell.handleError("formatSAPDateForInputField", e, 'e');
    }
  };
  //End PUBLIC method /formatSAPDateForInputField/
  //Begin PUBLIC method /replaceSpecialChars/
  replaceSpecialChars = function (textStr) {
    try {
      textStr = textStr.replace(/!/g, "%21"); 
      textStr = textStr.replace(/&/g, "%26"); 
      textStr = textStr.replace(/#/g, "%23"); 
      
      return textStr;
    } catch (e) {
      ema.shell.handleError("replaceSpecialChars", e, 'e');
    }
  };
  //End PUBLIC method /replaceSpecialChars/
  //Begin PUBLIC method /isNumber/
  isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
  //End PUBLIC method /isNumber/
  //Begin PUBLIC method /generateAuthHeader/
  generateAuthHeader = function (xhr) {
    try {
      if (ema.shell.getConfigMapConfigValue('AJAX_AUTH') === 'saphttpfields') {
        xhr.setRequestHeader("sap-language", ema.shell.getStateMapValue('selected_language').toUpperCase());
        xhr.setRequestHeader("sap-client", ema.shell.getConfigMapConfigValue('CLIENT'));
        xhr.setRequestHeader("sap-user", loadFromLocalStorage("curr_username"));
        xhr.setRequestHeader("sap-password", loadFromLocalStorage("curr_password"));
      } else if (ema.shell.getConfigMapConfigValue('AJAX_AUTH') === 'basic') {
        //xhr.setRequestHeader("Authorization", "Basic " + window.btoa(encodeURI(loadFromLocalStorage("curr_username") + ":" + loadFromLocalStorage("curr_password"))));
        //xhr.setRequestHeader("Authorization", "Basic " + window.btoa(unescape(encodeURIComponent(loadFromLocalStorage("curr_username") + ":" + loadFromLocalStorage("curr_password")))));      
        xhr.setRequestHeader("Authorization", "Basic " + base64Encode(loadFromLocalStorage("curr_username") + ":" + loadFromLocalStorage("curr_password")));      
      }
    } catch (e) {
      ema.shell.handleError("generateAuthHeader", e, 'e');
    }
  };
  //End PUBLIC method /generateAuthHeader/
  //Begin PUBLIC method /generateRequestObj/
  generateRequestObj = function (request) {
    try {
      if (ema.shell.getConfigMapConfigValue('AJAX_DATATYPE') === 'jsonp') {
        request = 'request=' + window.btoa(unescape(encodeURIComponent(JSON.stringify(request))));
      } else {
        request = JSON.stringify(request);
      }
      return request;
    } catch (e) {
      ema.shell.handleError("generateRequestObj", e, 'e');
    }
  };
  //End PUBLIC method /generateRequestObj/
  //Begin PUBLIC method /detectBrowser/
  detectBrowser = function () {
    try {
      var
      ua;
      
      ua = window.navigator.userAgent;
      
      if (ua.indexOf('MSIE ') > 0) {
        // IE 10 or older
        return 'Internet Explorer';
      } else if (ua.indexOf('Trident/') > 0) {
        // IE 11
        return 'Internet Explorer';
      } else if (ua.indexOf('Edge/') > 0) {
         // IE 12
        return 'Internet Explorer';
      } else {
        return '';
      }
    } catch (e) {
      ema.shell.handleError("detectBrowser", e, 'e');
    }
  };
  //End PUBLIC method /detectBrowser/
  //Begin PUBLIC method /removeLineBreak/
  removeLineBreak = function (origStr) {
    try {
      if (origStr === undefined || origStr === '') {
        return '';
      } else {
        return origStr.replace(/\n/g, "<br/>");
      }
    } catch (e) {
      ema.shell.handleError("removeLineBreak", e, 'e');
    }
  };
  //End PUBLIC method /removeLineBreak/
  //Begin PUBLIC method /addLineBreak/
  addLineBreak = function (origStr) {
    try {
      if (origStr === undefined || origStr === '') {
        return '';
      } else {
        return origStr.replace(/<br\s*\/?>/mg, "\n");
      }
    } catch (e) {
      ema.shell.handleError("addLineBreak", e, 'e');
    }
  };
  //End PUBLIC method /addLineBreak/
  //Begin PUBLIC method /checkLanguagePattern/
  /*
   * checks language json for duplicates with different texts
   */
  checkLanguagePattern = function () {
    try {
      var 
      category = null, 
      item = null,
      json = ema.shell.getStateMapValue('languageJson'),
      refJson = {},
      errorList = {};
      
      if (json !== undefined) {
        for (category in json) {
          if (json.hasOwnProperty(category)) {
            for (item in json[category]) {
              if (json[category].hasOwnProperty(item)) {
                if (refJson[item] === undefined) {
                  refJson[item] = json[category][item];
                } else {
                  if (refJson[item] !== json[category][item]) {
                    if (errorList[item] !== undefined) {
                      errorList[item] = refJson[item];
                    }
                    errorList[item] += ' - ' + json[category][item];
                  }
                }
              }
            }
          }
        }
      }
      
      return errorList;
    } catch (e) {
      ema.shell.handleError("checkLanguagePattern", e, 'e');
    }
  };
  //End PUBLIC method /checkLanguagePattern/
  // Begin Public method /addSearchParameter/
  addSearchParameter = function (fieldId, param) {
    try {
      if ($('#' + fieldId).val() !== '') {
        $('#' + fieldId).val($('#' + fieldId).val() + ' ' + param + ':');
      } else {
        $('#' + fieldId).val(param + ':');
      }
      $('#' + fieldId).focus();
    } catch (e) {
      ema.shell.handleError('ema_addSearchParameter', e, 'e');
    }
  };
  // End PUBLIC method /addSearchParameter/
  
  return {
    saveToLocalStorage : saveToLocalStorage, 
    loadFromLocalStorage : loadFromLocalStorage,
    startTimerTask : startTimerTask,
    terminateTimerTask : terminateTimerTask, 
    checkLogoutTime : checkLogoutTime,
    loadLanguagePattern : loadLanguagePattern,
    setLogoutTime : setLogoutTime,
    setAutosaveNextSave : setAutosaveNextSave,
    generateRequestURL : generateRequestURL,
    generateSearchURL : generateSearchURL,
    formatDateForSap : formatDateForSap,
    formatTimeForSap : formatTimeForSap,
    formatSapDateForDisplay : formatSapDateForDisplay,
    formatDateTimeForDisplay : formatDateTimeForDisplay,
    formatDateForDisplay : formatDateForDisplay,
    formatTimeForDisplay : formatTimeForDisplay,
    generateLeadingZeros : generateLeadingZeros,
    generateCurrentDateTime : generateCurrentDateTime,
    generateJSDate : generateJSDate,
    getUriParameter : getUriParameter,
    getUri : getUri,
    getDecodedUri : getDecodedUri,
    getHostname : getHostname,
    formatNumberForDisplay : formatNumberForDisplay,
    formatCurrencyForDisplay : formatCurrencyForDisplay,
    formatNumberForSAP : formatNumberForSAP,
    validateNumericInput : validateNumericInput,
    formatSAPDateForInputField : formatSAPDateForInputField,
    replaceSpecialChars : replaceSpecialChars,
    isNumber : isNumber,
    generateAuthHeader : generateAuthHeader,
    generateRequestObj : generateRequestObj,
    detectBrowser : detectBrowser,
    removeLineBreak : removeLineBreak,
    addLineBreak : addLineBreak,
    checkLanguagePattern : checkLanguagePattern,
    addSearchParameter : addSearchParameter
  };
}());
/*
 * ema.login.js
 * login module for EMA
 */
/*global unescape*/
ema.login = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  configMap = {
      main_html : String() + 
      '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
      //Start Formcontainer
      '<div class="mhcontent">' +
      '<div class="w100p loginheader">' +
      ema.formgenerator.generateHeader('', 'lbllogin', '', '', '', '') +
      '</div>' +

      ema.formgenerator.generateRow('text', 'ema_login_username', ema.model.loadFromLocalStorage('last_user'), '', false, '', 'lblusername', '', 'lblerrorusername', false, undefined, '&#XE801;') + 

      ema.formgenerator.generateRow('password', 'ema_login_password', '', '', false, '', 'lblpassword', '', 'lblerrorpassword', false) +

      '<div class="w100p loginclient">' +
      ema.formgenerator.generateRow('text', 'ema_login_client', '', '', true, '', 'lblclient', '', '', false) +
      '</div>' +

      //End Formcontainer
      '</div>'
    },
  stateMap = {
      container  : undefined,
      uriUsername : undefined,
      uriPassword : undefined
    },

  initModule, onModuleLoad, processLogin;
  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/

  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
  // Begin Public method /initModule/
  initModule = function (path, container) {
    try {
      // load HTML and map jQuery collections
      stateMap.container = container;
      ema.shell.addOnloadFunction(path, ema.login.onModuleLoad);
      if (ema.model.loadFromLocalStorage('last_user') !== '') {
        ema.shell.addOnloadFocusField(path, 'ema_login_password');
      } else {
        ema.shell.addOnloadFocusField(path, 'ema_login_username');
      }
      $('#' + container).html(configMap.main_html);
      
      if (ema.model.loadFromLocalStorage('uriUsername') !== '' && ema.model.loadFromLocalStorage('uriPassword') !== '') {
        stateMap.uriUsername = ema.model.loadFromLocalStorage('uriUsername');
        stateMap.uriPassword = ema.model.loadFromLocalStorage('uriPassword');
        processLogin();
      }
    } catch (e) {
      ema.shell.handleError('initModule', e, 'e');
    }
    $('#' + container).on('keypress', 'input', function (args) {
      if (args.keyCode === 13) {
        processLogin();
        return false;
      }
    });
  };
  // End PUBLIC method /initModule/
  // Begin Public method /onModuleLoad/
  onModuleLoad = function (container) {
    try {
      $('#ema_login_client').val(ema.shell.getConfigMapConfigValue('CLIENT'));
      $('#ema_login_password').val('');

      $('#ema_login_username, #ema_login_password').blur(function () {
        if (this.value.length === 0) {
          ema.formgenerator.showError(this.id);
        }
      });
      $('#ema_login_username, #ema_login_password').focus(function () {
        ema.formgenerator.hideError(this.id);
      });
      
      ema.formgenerator.generateFooter(false, false, '', true, 'lblbuttonlogon', 'ema.login.processLogin();');
    } catch (e) {
      ema.shell.handleError('onModuleLoad', e, 'e');
    }
  };
  // End PUBLIC method /onModuleLoad/
  // Begin Public method /processLogin/
  /*
   * sends login to specified server or compares login-information with stored values in local storage
   */
  processLogin = function processLogin() {
    try {
      var 
      request = '',
      requestUrl = '',
      lcase_username = '',
      lcase_username_abbr = '',
      login_attempts = 0,
      indexedDbConfig,
      doLogin,
      username,
      password;
      
      doLogin = true;

      if (stateMap.uriPassword !== undefined && stateMap.uriUsername !== undefined) {
        username = stateMap.uriUsername;
        password = stateMap.uriPassword;
      } else if ($('#ema_login_username').val().length === 0 || $('#ema_login_password').val().length === 0 || $('#ema_login_client').val().length === 0) {
        if ($('#ema_login_username').val().length === 0) {
          ema.formgenerator.showError('ema_login_username');
          doLogin = false;
        }
        if ($('#ema_login_password').val().length === 0) {
          ema.formgenerator.showError('ema_login_password');
          doLogin = false;
        }
        if ($('#ema_login_client').val().length === 0) {
          ema.formgenerator.showError('ema_login_client');
          doLogin = false;
        }
      } else {
        username = $('#ema_login_username').val();
        password = $('#ema_login_password').val();
      }
      if (doLogin === true) {
        if (ema.shell.getStateMapValue('isUserOnline') === true && ema.shell.getStateMapValue('isAppOnline') === true) {
          requestUrl = ema.model.generateRequestURL('LOGON');
          request = {};
          request.IMPORT = {};
          request.IMPORT.I_USER = username;
          request.IMPORT.I_PW = password;

          $.ajax({
            url: requestUrl,
            contentType: 'application/json; charset=UTF-8',
            dataType: ema.shell.getConfigMapConfigValue('AJAX_DATATYPE'),
            type: ema.shell.getConfigMapConfigValue('AJAX_TYPE'),
            data: ema.model.generateRequestObj(request),
            success: function (retString) {
              //check if login was successfull
              var 
              lcase_username = '',
              lcase_username_abbr = '',
              username_abbr = '';

              if (retString.EXPORT.E_ERRORMESSAGE === undefined || retString.EXPORT.E_ERRORMESSAGE === '') {
                ema.shell.hideError();
                //so error was returned
                ema.shell.setUserLoggedOn(true);
                //save username&password in localstorage
                ema.model.saveToLocalStorage('curr_username', username);
                ema.model.saveToLocalStorage('curr_password', password);
                ema.model.saveToLocalStorage('curr_login_attempts', login_attempts);
                if (retString.EXPORT.E_FIRSTNAME !== undefined) {
                  username_abbr = retString.EXPORT.E_FIRSTNAME.substring(0, 1) + '. ' + retString.EXPORT.E_LASTNAME;
                } else {
                  username_abbr = retString.EXPORT.E_LASTNAME;
                }
                ema.model.saveToLocalStorage('curr_username_abbr', username_abbr);
                ema.model.saveToLocalStorage('last_user', username); //Last logged on User
                ema.model.saveToLocalStorage('system', retString.EXPORT.E_SYSID);
                //save username&password for offline login
                lcase_username = 'user_' + username;
                ema.model.saveToLocalStorage(lcase_username.toLowerCase(), password);
                lcase_username_abbr = 'user_abbr_' + $('#ema_login_username').val();
                ema.model.saveToLocalStorage(lcase_username_abbr.toLowerCase(), username_abbr);
                ema.model.saveToLocalStorage('uriUsername', '');
                ema.model.saveToLocalStorage('uripassword', '');
                //Set the Logout Time
                ema.model.setLogoutTime();
                //Start the webworker task
                ema.model.startTimerTask();
                //set up database
                if (ema.shell.getStateMapValue('reqSourcePath') !== '') {
                  ema.datamanager.initDatabase(ema.shell.getStateMapValue('reqSourcePath'), ema.shell.getStateMapValue('reqNavText'));
                  ema.shell.resetReqSourcePath();
                } else {
                  ema.datamanager.initDatabase(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu', 'Home');
                }
              } else {
                ema.shell.setUserLoggedOn(false);
                //there is an error message -> login wasn´t successfull
                ema.shell.handleCustomError('processLogin', retString.EXPORT.E_ERRORMESSAGE, 'e');
                $('#ema_login_password').val('');
              }
            },
            error: function (xhr, status, errorThrown) {
              ema.shell.toggleOnline();
              processLogin();
            }
          });
        } else {
          //offline login with local storage
          lcase_username = 'user_' + $('#ema_login_username').val();
          lcase_username_abbr = 'user_abbr_' + $('#ema_login_username').val();

          if (ema.model.loadFromLocalStorage(lcase_username.toLowerCase()) === $('#ema_login_password').val()) {
            ema.shell.setUserLoggedOn(true);

            ema.model.saveToLocalStorage('curr_username', $('#ema_login_username').val());
            ema.model.saveToLocalStorage('curr_password', $('#ema_login_password').val());
            ema.model.saveToLocalStorage('curr_username_abbr', ema.model.loadFromLocalStorage(lcase_username_abbr.toLowerCase()));
            ema.model.saveToLocalStorage('curr_login_attempts', login_attempts);

            //Set the Logout Time
            ema.model.setLogoutTime();
            //Start the webworker task
            ema.model.startTimerTask();
            if (ema.shell.getStateMapValue('reqSourcePath') !== '') {
              ema.shell.changeHash(ema.shell.getStateMapValue('reqSourcePath'), ema.shell.getStateMapValue('reqNavText'));
              ema.shell.resetReqSourcePath();
            } else {
              ema.shell.changeHash(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu', 'Home');
            }
            //set up database
            ema.datamanager.initDatabase();
          } else {
            //username&password are incorrect
            login_attempts = ema.model.loadFromLocalStorage('curr_login_attempts') * 1;
            if (login_attempts >= 3) {
              //more than 3 unsuccessfull attempts -> delete local storage & indexeddb
              localStorage.clear();
              indexedDbConfig = ema.shell.getConfigMapIndexedDb();
              indexedDB.deleteDatabase(indexedDbConfig.DBNAME);
              ema.shell.handleCustomError('processLogin', 'lblwrongpassword', 'e');
              ema.shell.handleCustomError('processLogin', 'lbldatabasedelete', 'e');
            } else {
              login_attempts += 1;
              ema.model.saveToLocalStorage('curr_login_attempts', login_attempts);
              ema.shell.handleCustomError('processLogin', 'lblwrongpassword', 'e');
            }
          }
        }
      }
    } catch (e) {
      ema.shell.handleError('processLogin', e, 'e');
    }
  };
  // End Public method /processLogin/

  return { 
    initModule : initModule,
    onModuleLoad : onModuleLoad, 
    processLogin : processLogin
  };
  //------------------- END PUBLIC METHODS ---------------------
}());

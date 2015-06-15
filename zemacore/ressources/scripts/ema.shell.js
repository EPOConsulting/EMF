/*
 * ema.shell.js
 * Shell module for EMA
 */
ema.shell = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  configMap = {
      parameter_map : { },
      keyValues: {},
      logoutminutes : '',
      contentContainer  : undefined      
    },
  stateMap = {
      $container  : undefined,
      isUserLoggedOn : false,
      isUserOnline : true,
      isAppOnline : true,
      isMenuGenerated : false,
      expandDashboard : false,
      selected_language : '',
      languages_options : [],
      languageJson : undefined,
      languageFileStatus : undefined,
      languageFiles : undefined,
      contentIdList : {},
      onloadFunctionList : {},
      onUnloadFunctionList : {},
      onloadFocusField: {},
      saveConfirmList: {},
      loadingAnimationList : {},
      divChange: {},
      contentIdMax : 0,
      navList : '',
      hashChangeByClick : false,
      reqSourcePath : '',
      reqNavText : '',
      syncScreenReload : false
    },

  //internal functions
  generateHTML, loadConfig, checkLoginState, 
  loadFooter, importModuleJSFile, generateNavigation, 
  deleteNavigation, loadDashboard, showModule, 
  onHashchange, loadKeyValueFile, loadSapKeyValue, 
  callModuleInitFunction, loadModuleConfig, evaluteModuleConfig, 
  loadModuleScript, loadModuleLanguage, checkModuleLanguageStatus,

  //public functions
  configModule, initModule, handleCustomError,  
  handleError, handleWSError, hideError, 
  getLanguagesOptions, setSelectedLanguage, setUserLoggedOn,
  getStateMapValue, getOnlineStatus, getConfigMapConfigValue, 
  getConfigMapIndexedDb, getContentContainer, getLogoutminutes, 
  getKeyValueList, getKeyValue, loadModule, 
  showHideDashboard, logout, toggleOnline, 
  setMenuGenerated, addContentDiv, addOnloadFunction, 
  addOnUnloadFunction, addOnloadFocusField, activateSaveConfirm, 
  activateLoadingAnimation, changeHash, changeHashSub, loadEmbeddedUri, 
  historyBack, showHideSection, showSections, 
  hideSections, loadKeyValues, loadSapKeyValueCallBack, 
  resetLanguage, setLanguage, getLanguageTextString, 
  showDialog, resetReqSourcePath, resizeCanvas, 
  updateSyncScreen, gotoMenu, showLoadingAnimLayer,
  hideLoadingAnimLayer, showHideBreadcrumb, checkStyleForHeaderAndFooter,
  showHideHeader, showHideFooter, confirmLogout;

  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/
  // Begin INTERNAL method /generateHTML/
  generateHTML = function () {
    try {
      return '<div class="hidden" id="dashbord"></div>' +
      '<div class="hidden" id="breadcrumb"></div>' +
      '<div class="errordiv" id="errordiv" onclick="ema.shell.hideError();" style="display:none"></div>' +
      '<div id="header" class="header">' + 
      '<div class="hidden" id="navmenu"><button class="button_nok" onclick="ema.shell.showHideHeader()"><i class="icon-angle-up" id="btnnavmenu"></i></button></i></div>' + 
      '<div class="w100p navdiv" id="navdiv">' + 
      '<div class="navbar" id="navbar"></div>' +
      '<div class="navstatus" id="statusdb">' + 
      '<div class="w50p"><i id="statusdb_online" class="icon-wifi darkgrey"></i></div>' + 
      '<div class="w50p"><a onclick="ema.shell.confirmLogout()"><i class="icon-off darkgrey"></i></a></div></div>' + 
      '<div class="dbswitch"><button class="button_nok" onclick="ema.shell.showHideDashboard()"><i class="icon-cog" id="btnDashboard"></i></button></div>' +
      '<div class="w5p h2">&nbsp;</div>' +
      '<div class="w90p darkgreybg h2">&nbsp;</div>' +
      '<div class="w5p h2">&nbsp;</div>' +
      '</div>' + 
      '</div>' +
      '<div class="w100p" id="contentContainer"></div>' +
      '<div class="w100p h20">&nbsp;</div>' +
      '<div class="w5p h2">&nbsp;</div>' +
      '<div class="w90p darkgreybg h2">&nbsp;</div>' +
      '<div class="w5p h2">&nbsp;</div>' +
      '<div class="w100p h20">&nbsp;</div>' +
      '<div class="footer" id="footer">' +
      '<div class="hidden" id="footermenu"><button class="button_nok" onclick="ema.shell.showHideFooter()"><i class="icon-angle-down" id="btnfootermenu"></i></button></i></div>' + 
      '<div class="w100p footerbar" id="footerbar">' +
      '<div class="footerimg"><img id="footerimgleft" src="about:blank" class="footerlogo1"></div>' +
      '<div class="footerbutton" id="footerbutton">&nbsp;</div>' + 
      '<div class="footerimg r"><img id="footerimgright" src="about:blank" class="footerlogo2"></div>' + 
      '</div>' +
      '</div>' +
      //SaveConfirm-Layer
      '<div id="ema_save_confirm" class="hidden">' +  
      '<div class="overlayinner">' +
      '<div class="hcontent overlaycontent w50p">' +
      '<div class="w80p overlayhead">&nbsp;</div>' +
      '<div class="w20p overlayhead r"><a onclick="ema.shell.showDialog(\'ema_save_confirm\')" class="tbg"><i class="icon-cancel"></i></a></div>' +
      '<div class="w100p lblconfirm c">&nbsp;</div>' +
      '<div class="w100p">' +
      '<div class="signaturebutton"><button class="button_nok w100p lblbuttoncancel" onclick="ema.shell.showDialog(\'ema_save_confirm\');"></button></div>' + 
      '<div class="signaturebutton"><button class="button_ok w100p lblbuttonproceed" onclick="ema.shell.showDialog(\'ema_save_confirm\');ema.shell.changeHashSub();"></button></div>' + 
      '</div>' +
      '</div>' +
      '</div>' + 
      '</div>' + 
      //LogoutConfirm-Layer
      '<div id="ema_logout_confirm" class="hidden">' +  
      '<div class="overlayinner">' +
      '<div class="hcontent overlaycontent w50p">' +
      '<div class="w80p overlayhead">&nbsp;</div>' +
      '<div class="w20p overlayhead r"><a onclick="ema.shell.showDialog(\'ema_logout_confirm\')" class="tbg"><i class="icon-cancel"></i></a></div>' +
      '<div class="w100p lbllogoutconfirm c">&nbsp;</div>' +
      '<div class="w100p">' +
      '<div class="signaturebutton"><button class="button_nok w100p lblbuttoncancel" onclick="ema.shell.showDialog(\'ema_logout_confirm\');"></button></div>' + 
      '<div class="signaturebutton"><button class="button_ok w100p lblbuttonproceed" onclick="ema.shell.showDialog(\'ema_logout_confirm\');ema.shell.logout();"></button></div>' + 
      '</div>' +
      '</div>' +
      '</div>' + 
      '</div>' + 
      //Loadinganimation-Layer
      '<div id="ema_loadinganim_layer" class="hidden">' +  
      '<div class="overlayinner">' +
      '<div class="hcontent overlaycontent w50p">' +
      '<div class="w80p ">&nbsp;</div>' +
      '<div class="w20p r"><a onclick="ema.shell.hideLoadingAnimLayer()"><i class="icon-cancel"></i></a></div>' +
      '<div class="w100p">' + ema.formgenerator.getLoadingAnimation('large', false) + '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
    } catch (e) {
      handleError('generateHTML', e, 'e');
    }
  };
  // End INTERNAL method /generateHTML/
  // Begin INTERNAL method /loadConfig/
  /*
   * loads the configfile and saves it in configMap.parameter_map
   */
  loadConfig = function () {
    try {
      $.ajax({
        url: 'config.properties',
        type: 'GET',
        contentType: 'utf-8',
        dataType: 'json',
        async: false,
        success: function (retString) {
          var 
          lang = '',
          firstlang = true,
          localLang = '',
          lang_Options = [],
          hostName,
          entry,
          i,
          languageFileStatus,
          languageFiles;
          
          languageFileStatus = {};
          languageFiles = {};
          stateMap.languageFileStatus = languageFileStatus;
          stateMap.languageFiles = languageFiles;
                    
          configMap.parameter_map = retString;
          configMap.logoutminutes = configMap.parameter_map.CONFIG.LOGOUTMINUTES;
          configMap.contentContainer = configMap.parameter_map.CONFIG.CONTENTCONTAINER;
          //replace override parameter for current host
          hostName = ema.model.getHostname(document.location.href).toLowerCase();
          if (configMap.parameter_map.OVERRIDE[hostName] !== undefined) {
            for (entry in configMap.parameter_map.OVERRIDE[hostName]) {
              if (configMap.parameter_map.OVERRIDE[hostName].hasOwnProperty(entry)) {
                configMap.parameter_map.CONFIG[entry] = configMap.parameter_map.OVERRIDE[hostName][entry];
              }
            }
          }
          if (window.navigator.language === undefined) {
            localLang = (window.navigator.userLanguage).split('-')[0];
          } else {
            localLang = (window.navigator.language).split('-')[0];
          }
          for (lang in configMap.parameter_map.LANGUAGES) {
            if (configMap.parameter_map.LANGUAGES.hasOwnProperty(lang)) {
              if (firstlang === true) {
                stateMap.selected_language = lang;
                firstlang = false;
              }
              lang_Options[lang] = configMap.parameter_map.LANGUAGES[lang];
              if (lang === localLang) {
                stateMap.selected_language = localLang;
              }
              stateMap.languageFiles[lang] = {};
              for (i = 0; i < configMap.parameter_map.MODULES.LANGUAGES.length; i += 1) {
                loadModuleLanguage(configMap.parameter_map.MODULES.LANGUAGES[i], lang);
              }
            }
          }
          if (ema.model.loadFromLocalStorage('sel_language') !== '') {
            stateMap.selected_language = ema.model.loadFromLocalStorage('sel_language');
          }
          ema.model.saveToLocalStorage('sel_language', stateMap.selected_language);
          stateMap.languages_options = lang_Options;
          
          //Load Module Configs and Scripts
          for (i = 0; i < configMap.parameter_map.MODULES.CONFIGS.length; i += 1) {
            loadModuleConfig(configMap.parameter_map.MODULES.CONFIGS[i]);
          }
          for (i = 0; i < configMap.parameter_map.MODULES.SCRIPTS.length; i += 1) {
            loadModuleScript(configMap.parameter_map.MODULES.SCRIPTS[i]);
          }
        },
        error: function (xhr, status, errorThrown) {
          handleWSError('loadConfig', xhr, status, errorThrown, 'e');
        }
      });
    } catch (e) {
      handleError('loadConfig', e, 'e');
    }
  };
  // End INTERNAL method /loadConfig/
  // Begin INTERNAL method /loadKeyValueFile/
  loadKeyValueFile = function (keyValueConfig) {
    try {
      $.ajax({
        url: keyValueConfig.LOCATION,
        type: 'GET',
        contentType: 'utf-8',
        dataType: 'json',
        success: function (retString) {
          var i;

          for (i = 0; i < keyValueConfig.ENTRIES.length; i += 1) {
            if (retString[keyValueConfig.ENTRIES[i]] !== undefined) {
              configMap.keyValues[keyValueConfig.ENTRIES[i]] = retString[keyValueConfig.ENTRIES[i]]; 
            }
          } 

        },
        error: function (xhr, status, errorThrown) {
          handleWSError('loadKeyValueFile', xhr, status, errorThrown, 'e');
        }
      });
    } catch (e) {
      handleError('loadKeyValueFile', e, 'e');
    }
  };
  // End INTERNAL method /loadKeyValueFile/
  // Begin INTERNAL method /loadSapKeyValue/
  loadSapKeyValue = function (keyValueConfig) {
    try {
      var request, i, dd07v_tab;

      request = {};
      request.IMPORT = {};
      request.IMPORT.NAME = '';
      request.IMPORT.STATE = '';
      request.IMPORT.LANGU = stateMap.selected_language.substr(0, 1).toUpperCase();
      request.TABLES = {};
      request.TABLES.DD07V_TAB = [];
      dd07v_tab = {}; 
      dd07v_tab.DOMNAME = '';
      dd07v_tab.VALPOS = 0;
      dd07v_tab.DDLANGUAGE = '';
      dd07v_tab.DOMVALUE_L = '';
      dd07v_tab.DOMVALUE_H = '';
      dd07v_tab.DDTEXT = '';
      dd07v_tab.DOMVAL_LD = '';
      dd07v_tab.DOMVAL_HD = '';
      dd07v_tab.APPVAL = '';
      request.TABLES.DD07V_TAB[0] = dd07v_tab;


      for (i = 0; i < keyValueConfig.ENTRIES.length; i += 1) {
        request.IMPORT.NAME = keyValueConfig.ENTRIES[i];
        ema.datamanager.doRequest(keyValueConfig.LOCATION, request, ema.shell.loadSapKeyValueCallBack, null);
      } 
    } catch (e) {
      handleError('loadSapKeyValue', e, 'e');
    }
  };
  // End INTERNAL method /loadSapKeyValue/
  // Begin INTERNAL method /checkLoginState/
  /*
   * checks if the user needs to logon
   */
  checkLoginState = function () {
    try {
      var 
      logoutTime = ema.model.loadFromLocalStorage('LogoutTime'),
      aktTime = new Date();
      
      if (configMap.parameter_map.CONFIG.ISLOGINREQUIRED === 'true') {
        if (stateMap.isUserLoggedOn === true) {
          return true;  //no login required
        } else {
          //check if there is a valid login in local storage for the current user
          if (logoutTime - aktTime.getTime() > 0 && ema.model.loadFromLocalStorage('curr_username') !== '') {
            //start logouttimer
            ema.model.startTimerTask();
            stateMap.isUserLoggedOn = true;
            //load language
            stateMap.selected_language = ema.model.loadFromLocalStorage('sel_language');
            ema.model.loadLanguagePattern(stateMap.selected_language);
            return true;    //no login required
          } else {
            ema.model.saveToLocalStorage('curr_username', '');
            ema.model.saveToLocalStorage('curr_password', '');
            return false; //login required
          }
        }
      } else {
        return true;    //no login required
      }
    } catch (e) {
      handleError('checkLoginState', e, 'e');
    }
  };
  // End INTERNAL method /checkLoginState/
  // Begin INTERNAL method /loadFooter/
  /*
   * load customer logos into footer
   */
  loadFooter = function () {
    try {
      $('#footerimgleft').attr('src', configMap.parameter_map.CONFIG.FOOTERLOGOLEFT);
      $('#footerimgright').attr('src', configMap.parameter_map.CONFIG.FOOTERLOGORIGHT);
    } catch (e) {
      handleError('loadFooter', e, 'e');
    }
  };
  // End INTERNAL method /loadFooter/
  // Begin INTERNAL method /showModule/
  /*
   * hide all content-divs and shows the contentdiv in sourcePath
   */
  showModule = function (sourcePath, navText) {
    try {
      if (checkLoginState() === false && sourcePath !== ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.login') {
        //login required -> load loginpage
        changeHash(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.login', '');
      } else {
        //generate navigation
        if (navText !== undefined && navText !== 'undefined') {
          if (navText !== '') {
            generateNavigation(sourcePath, navText);
          } else {
            deleteNavigation();
          }
        }
        $('#' + configMap.contentContainer).find('.contentDiv:visible').toggle();
        $('#' + stateMap.contentIdList[sourcePath]).show();
        
        //delete saved listdata
        ema.listgenerator.deleteListData();
        
        //start loadinganimation
        if (stateMap.loadingAnimationList[sourcePath] !== undefined) {
          $('#' + stateMap.contentIdList[sourcePath]).html(ema.formgenerator.getLoadingAnimation('large', false));
        }
        //execute modules onLoad function
        if (stateMap.onloadFunctionList[sourcePath] !== undefined) {
          stateMap.onloadFunctionList[sourcePath](stateMap.contentIdList[sourcePath]);
        }
        //set cursor to focus field
        if (stateMap.onloadFocusField[sourcePath] !== undefined) {
          $('#' + stateMap.onloadFocusField[sourcePath]).focus();
        }
  
        ema.model.loadLanguagePattern(stateMap.selected_language);
        getOnlineStatus();
      }
    } catch (e) {
      handleError('showModule', e, 'e');
    }
  };
  // End INTERNAL method /showModule/
  // Begin INTERNAL method /importModuleJSFile/
  /*
   * imports a js file for a module
   */
  importModuleJSFile = function (path, navText) {
    try {
      if (getConfigMapConfigValue('DEVELOPMENTMODE') === 'false') {
        $.getScript(path + '.js#')
        .done(function (script, textStatus) {
          var neuesDiv, pathSplit;
          //generate a contentdiv for the module
          stateMap.contentIdMax += 1;
          stateMap.contentIdList[path] = 'contentDiv' + stateMap.contentIdMax;
          neuesDiv = $('<div class="w100p contentDiv" id="contentDiv' + stateMap.contentIdMax + '\"></div>');
          neuesDiv.appendTo('#' + configMap.contentContainer);
          //execute modules init function
          pathSplit = path.split('/');
          callModuleInitFunction(pathSplit[pathSplit.length - 1], path, 'contentDiv' + stateMap.contentIdMax, navText);
        })
        .fail(function (jqxhr, settings, exception) {
          handleCustomError('importModuleJSFile', exception, 'e');
        });
      } else {
        sjl.load([path + '.js#'], function () {
          $('document').ready(function () {
            var neuesDiv, pathSplit;
            
            //generate contentdiv for the module
            stateMap.contentIdMax += 1;
            stateMap.contentIdList[path] = 'contentDiv' + stateMap.contentIdMax;
            neuesDiv = $('<div class="w100p contentDiv" id="contentDiv' + stateMap.contentIdMax + '\"></div>');
            neuesDiv.appendTo('#' + configMap.contentContainer);
            //execute modules init function
            pathSplit = path.split('/');
            callModuleInitFunction(pathSplit[pathSplit.length - 1], path, 'contentDiv' + stateMap.contentIdMax, navText);
          });
        });
      }
    } catch (e) {
      handleError('importModuleJSFile', e, 'e');
    }
  };
  // End INTERNAL method /importModuleJSFile/
  // Begin INTERNAL method /generateNavigation/
  generateNavigation = function (sourcePath, navText) {
    try {
      var 
      found = false,
      i = 0,
      navEntry = {},
      homeEntry = {},
      entry = null,
      navHtml = '',
      bcHtml = '',
      localNavList;

      if (stateMap.navList.length === undefined || stateMap.navList === '') {
        localNavList = [];
        stateMap.navList = localNavList;
      }
      
      //check if there is a menu/home entry in navigation - if not create it
      if (stateMap.navList.length === 0) {
        homeEntry.sourcePath = ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu';
        homeEntry.link = '<button class=\"button_nok\" onclick=\'ema.shell.changeHash("' + ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu", "Home")\'>Home</button>';
        homeEntry.bclink = '<button class=\"button_nok w100p l\" onclick=\'ema.shell.showHideBreadcrumb()\'><i class="icon-menu" id="btnBreadcrumb"></i></button><button class=\"button_nok w100p l\" onclick=\'ema.shell.changeHash("' + ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu", "Home")\'>&nbsp;&gt;&nbsp;Home</button>';
        stateMap.navList[stateMap.navList.length] = homeEntry; 
      }

      //check if current sourcePath is in navlist already
      for (i = 0; i < stateMap.navList.length; i += 1) {
        if (stateMap.navList[i].sourcePath === sourcePath) {
          found = true;
          break;
        }
      }
      if (found === false) {
        //entry is not in list -> create it
        navEntry.sourcePath = sourcePath;
        navEntry.link = '<button class=\"button_nok\" onclick=\'ema.shell.changeHash("' + sourcePath + '", "' + navText + '")\'>' + navText + '</button>';
        navEntry.bclink = '<button class=\"button_nok w100p l\" onclick=\'ema.shell.changeHash("' + sourcePath + '", "' + navText + '")\'>&nbsp;&gt;&nbsp;' + navText + '</button>';
        stateMap.navList[stateMap.navList.length] = navEntry; 
      } else {
        while ((i + 1) < stateMap.navList.length) {
          stateMap.navList.pop();
        }
      }
      //generate new navbar
      navHtml = '<button class=\"button_nok\" onclick=\'ema.shell.showHideBreadcrumb()\'><i class="icon-menu" id="btnBreadcrumb"></i></button>';
      i = 0;
      for (entry  in stateMap.navList) {
        if (stateMap.navList.hasOwnProperty(entry)) {
          if (i === 0 || i === (stateMap.navList.length - 1) || i === (stateMap.navList.length - 2)) {
            navHtml += ' > ';
            navHtml += stateMap.navList[entry].link;
          }
          bcHtml += stateMap.navList[entry].bclink;
          i += 1;
        }
      }
      $('#navbar').html(navHtml);
      $('#breadcrumb').html(bcHtml);
    } catch (e) {
      handleError('generateNavigation', e, 'e');
    }
  };
  // End INTERNAL method /generateNavigation/
  // Begin INTERNAL method /deleteNavigation/
  deleteNavigation = function () {
    try {
      stateMap.navList = {};
      $('#navbar').html('');

    } catch (e) {
      handleError('deleteNavigation', e, 'e');
    }
  };
  // End INTERNAL method /deleteNavigation/
  // Begin INTERNAL method /loadDashboard/
  /*
   * generates the dashboard
   */
  loadDashboard = function (reloadLanguagePattern) {
    try {
      var
      htmldb = '',
      htmlSystem = '',
      htmlUser = '',
      htmlOnline = '',
      htmlSync = '',
      htmlShowHide = '',
      htmlSetup = '';

      //1. Section Online/Offline
      if (stateMap.isUserOnline === true && stateMap.isAppOnline === true) {
        htmlOnline = '<div class="dbentry dbr">';
        htmlOnline += '<div class="w100p green"><span class="lblonline"></span></div>';
        htmlOnline += '<div class="w100p green"><a onclick="ema.shell.toggleOnline()" class="lblgooffline"></a></div>';
        htmlOnline += '</div>';
      } else {
        htmlOnline = '<div class="dbentry dbr">';
        htmlOnline += '<div class="w100p red"><span class="lbloffline"></span></div>';
        htmlOnline += '<div class="w100p red"><a onclick="ema.shell.toggleOnline()" class="lblgoonline"></a></div>';
        htmlOnline += '</div>';
      }
      if (stateMap.isUserLoggedOn === true) {
        //2. Section User
        htmlUser = '<div class="dbentry dbr">';
        htmlUser += '<div class="w100p"><i class="icon-user"></i>' + ema.model.loadFromLocalStorage('curr_username_abbr') + '</div>';
        htmlUser += '<div class="w100p"><a onclick="ema.shell.logout()" class="lbllogout"></a></div>';
        htmlUser += '</div>';
        //3. Section System
        htmlSystem = '<div class="dbentry dbr">';
        htmlSystem += '<div class="w100p"><span class="lblsystem"></span>: ' + ema.model.loadFromLocalStorage('system') + '</div>';
        htmlSystem += '<div class="w100p"><span class="lblclient"></span>: ' + configMap.parameter_map.CONFIG.CLIENT + '</div>';
        htmlSystem += '</div>';
        //4. Section Sync
        htmlSync = '<div class="dbentry dbr">';
        htmlSync += '<div id="syncgreen" class="w100p lblsyncgreen green"></div>';
        htmlSync += '<div id="syncyellow" class="w100p lblsyncyellow yellow" style="display:none"></div>';
        htmlSync += '<div id="syncred" class="w100p lblsyncred red" style="display:none"></div>';
        htmlSync += '<div id="synctime" class="w100p ">&nbsp;</div>';
        htmlSync += '<div class="w100p"><a onclick="ema.shell.changeHash(ema.shell.getConfigMapConfigValue(\'COREPATH\') + \'modules/ema.sync\', undefined)" class="lblsyncinfo"></a></div>';
        if (stateMap.isUserOnline === true && stateMap.isAppOnline === true) {
          htmlSync += '<div class="w100p"><a onclick="ema.shell.showHideDashboard();ema.datamanager.startSynchronisation(\'both\')" class="lbldosync"></a></div>';
        } else {
          htmlSync += '<div class="w100p"><span class="lbldosync"></span></div>';
        }
        htmlSync += '</div>';
      } else {
        //3. Section System
        htmlSystem = '<div class="dbentry dbr">';
        htmlSystem += '<div class="w100p"><span class="lblsystem"></span>: ---</div>';
        htmlSystem += '<div class="w100p"><span class="lblclient"></span>: ---</div>';
        htmlSystem += '</div>';
      }
      
      //5. Section Setup
      htmlSetup = '<div class="dbentry dbr">';
      htmlSetup += '<div class="w100p"><a onclick="ema.shell.changeHash(ema.shell.getConfigMapConfigValue(\'COREPATH\') + \'modules/ema.setup\', undefined)" class="lblsetup"></a></div>';
      htmlSetup += '</div>';
      
      $('#dashbord').html(htmldb + htmlOnline + htmlUser + htmlSystem + htmlSync + htmlSetup + '</div>' + htmlShowHide);
      if (reloadLanguagePattern === true) {
        ema.model.loadLanguagePattern(stateMap.selected_language);
      }
      if (stateMap.isUserLoggedOn === true) {
        //to avoid a loop
        if (stateMap.syncScreenReload === false) {
          //refresh sync status
          ema.datamanager.updateSyncStatus();
        } else {
          stateMap.syncScreenReload = false;
        }
      }
      getOnlineStatus();
    } catch (e) {
      handleError('loadDashboard', e, 'e');
    }
  };
  // End INTERNAL method /loadDashboard/
  // Begin INTERNAL method /callModuleInitFunction/
  callModuleInitFunction = function (objPath, path, contentDiv, navText) {
    try {
      var moduleObj, pathSplit, i;
      
      pathSplit = objPath.split('.');
      moduleObj = ema;
      for (i = 1; i < pathSplit.length; i += 1) {
        moduleObj = moduleObj[pathSplit[i]];
      }
      if (moduleObj !== undefined) {
        moduleObj.initModule(path, contentDiv);
        showModule(path, navText);
      }
    } catch (e) {
      handleError('callModuleInitFunction', e, 'e');
    }
  };
  // End INTERNAL method /callModuleInitFunction/
  // Begin INTERNAL method /loadModuleConfig/
  loadModuleConfig = function (fileName) {
    try {
      $.ajax({
        url: fileName,
        type: 'GET',
        contentType: 'utf-8',
        dataType: 'json',
        async: false,
        success: function (retObj) {
          evaluteModuleConfig(retObj, configMap.parameter_map);
        },
        error: function (xhr, status, errorThrown) {
          handleWSError('loadConfig', xhr, status, errorThrown, 'e');
        }
      });
    } catch (e) {
      handleError('loadModuleConfig', e, 'e');
    }
  };
  // End INTERNAL method /loadModuleConfig/
  // Begin INTERNAL method /evaluteModuleConfig/
  evaluteModuleConfig = function (retObj, configElement) {
    try {
      var 
      i,
      entry;
      
      if (Array.isArray(retObj)) {
        for (i = 0; i < retObj.length; i += 1) {
          configElement[configElement.length] = retObj[i];
        }
      } else if (typeof retObj === 'object') {
        for (entry in retObj) {
          if (retObj.hasOwnProperty(entry)) {
            if (configElement.hasOwnProperty(entry)) {
              evaluteModuleConfig(retObj[entry], configElement[entry]);
            } else {
              configElement[entry] = retObj[entry];
            }
          }
        }
      } else if (typeof retObj === 'number') {
        configElement = retObj;
      } else if (typeof retObj === 'string') {
        configElement = retObj;
      }
    } catch (e) {
      handleError('evaluteModuleConfig', e, 'e');
    }
  };
  // End INTERNAL method /evaluteModuleConfig/
  // Begin INTERNAL method /loadModuleScript/
  loadModuleScript = function (fileName) {
    try {
      if (ema.shell.getConfigMapConfigValue('DEVELOPMENTMODE') === 'false') {
        $.getScript(fileName)
        .done(function (script, textStatus) {})
        .fail(function (jqxhr, settings, exception) {
          ema.shell.handleCustomError('loadModuleScript', exception, 'e');
        });
      } else {
        sjl.load([fileName], function () {});
      }
    } catch (e) {
      handleError('loadModuleScript', e, 'e');
    }
  };
  // End INTERNAL method /loadModuleScript/
  // Begin INTERNAL method /loadModuleLanguage/
  loadModuleLanguage = function (fileName, language) {
    try {
      stateMap.languageFileStatus[fileName + '_' + language] = 'pending';
      $.ajax({
        url: fileName + '/' + language + '.json',
        type: 'GET',
        contentType: 'utf-8',
        dataType: 'json',
        async: false,
        success: function (retObj) {
          stateMap.languageFileStatus[fileName + '_' + language] = 'ok';
          evaluteModuleConfig(retObj, stateMap.languageFiles[language]);
          checkModuleLanguageStatus();
        },
        error: function (xhr, status, errorThrown) {
          stateMap.languageFileStatus[fileName + '_' + language] = 'nok';
          checkModuleLanguageStatus();
          handleWSError('loadConfig', xhr, status, errorThrown, 'e');
        }
      });
    } catch (e) {
      handleError('loadModuleLanguage', e, 'e');
    }
  };
  // End INTERNAL method /loadModuleLanguage/
  // Begin INTERNAL method /checkModuleLanguageStatus/
  checkModuleLanguageStatus = function () {
    try {
      var 
      entry,
      importFinished;
      
      importFinished = true;
      for (entry in stateMap.languageFileStatus) {
        if (stateMap.languageFileStatus.hasOwnProperty(entry)) {
          if (stateMap.languageFileStatus[entry] === 'pending') {
            importFinished = false;
          }
        }
      }
      if (importFinished === true) {
        for (entry in stateMap.languageFiles) {
          if (stateMap.languageFiles.hasOwnProperty(entry)) {
            ema.model.saveToLocalStorage('languageString_' + entry, JSON.stringify(stateMap.languageFiles[entry]));
          }
        }
      }
    } catch (e) {
      handleError('checkModuleLanguageStatus', e, 'e');
    }
  };
  // End INTERNAL method /checkModuleLanguageStatus/
  // Begin Event handler /onHashchange/
  onHashchange = function (event) {
    try {
      var
      sourcePath,
      navText;

      sourcePath = ema.model.getUriParameter(document.location.href, 'sourcePath');
      navText = ema.model.getUriParameter(document.location.href, 'navText');

      if (sourcePath === ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.login' && checkLoginState() === true) {
        changeHash(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu', 'Home');
      } else  if (sourcePath !== null || navText !== null) {
        loadModule(sourcePath, navText);
      }

    } catch (e) {
      handleError('onHashchange', e, 'e');
    }
  };
  // End Event handler /onHashchange/
  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
  // Begin PUBLIC method /handleCustomError/
  handleCustomError = function (functionName, errorLabel, errorLevel) {   //for custum errors with multilingual error text
    var errorString = '';
    errorString += '<div class="error_' + errorLevel.toLowerCase() + '">';
    errorString += '<div class="w100p c">' + getLanguageTextString('errors', errorLabel) + '</div>';
    errorString += '</div>';
    if (getConfigMapConfigValue('DEVELOPMENTMODE') === 'true') {
      errorString += '<div class="w100p c">Meldung aus Funktion ' + functionName + '</div>';
    }
    //check if an error is already displayed
    if ($('#errordiv').html() !== '') {
      errorString += '<div class="h20">&nbsp;</div>';
      errorString += $('#errordiv').html();
    } else {
      errorString += '<div class="w100p c">Meldung ausblenden.</div>';
    }
    $('#errordiv').html(errorString);
    $('#errordiv').show();
    window.scrollTo(0, 0);
  };
  // End PUBLIC method /handleCustomError/
  // Begin PUBLIC method /handleError/
  handleError = function (functionName, error, errorLevel) {    //for errors with error object - used in try catch blocks
    var errorString = '';
    errorString += '<div class="error_' + errorLevel.toLowerCase() + '">';
    errorString += '<div class="w100p c">' + error.message + '</div>';
    errorString += '</div>';
    if (getConfigMapConfigValue('DEVELOPMENTMODE') === 'true') {
      errorString += '<div class="w100p c">Meldung aus Funktion ' + functionName + '</div>';
    }
    //check if an error is already displayed
    if ($('#errordiv').html() !== '') {
      errorString += '<div class="h20">&nbsp;</div>';
      errorString += $('#errordiv').html();
    } else {
      errorString += '<div class="w100p c">Meldung ausblenden.</div>';
    }
    $('#errordiv').html(errorString);
    $('#errordiv').show();
    window.scrollTo(0, 0);
  };
  // End PUBLIC method /handleError/
  // Begin PUBLIC method /handleWSError/
  handleWSError = function (functionName, xhr, status, errorThrown, errorLevel) {   //for errors in jquery .ajax calls
    var errorString = '';
    if (xhr.responseText !== undefined && errorThrown.message.toLowerCase() !== 'bad request' && xhr.responseText.indexOf("400") > -1) {
      errorString += '<div class="error_' + errorLevel.toLowerCase() + '">';
      errorString += '<div class="w100p c">' + errorThrown + '</div>';
      errorString += '<div>Rückmeldung vom Server: ' + xhr.responseText + '</div>';
      errorString += '</div>';
      if (getConfigMapConfigValue('DEVELOPMENTMODE') === 'true') {
        errorString += '<div class="w100p c">Meldung aus Funktion ' + functionName + '</div>';
      }
      //check if an error is already displayed
      if ($('#errordiv').html() !== '') {
        errorString += '<div class="h20">&nbsp;</div>';
        errorString += $('#errordiv').html();
      } else {
        errorString += '<div class="w100p c">Meldung ausblenden.</div>';
      }
      $('#errordiv').html(errorString);
      $('#errordiv').show();
      window.scrollTo(0, 0);
    }
  };
  // End PUBLIC method /handleWSError/
  // Begin PUBLIC method /hideError/
  hideError = function () {
    $('#errordiv').hide();
    $('#errordiv').html('');
  };
  // End PUBLIC method /hideError/
  // Begin PUBLIC method /configModule/
  configModule = function () {
    try {
      var i;
      loadConfig();
      return true;
    } catch (e) {
      handleError('configModule', e, 'e');
    }
  };
  // End PUBLIC method /configModule/
  // Begin PUBLIC method /initModule/
  initModule = function ($container) {
    try {
      var 
      sourcePath,
      navText,
      navEntry,
      cssfileSplit,
      i,
      j;
      
      // load HTML
      stateMap.$container = $container;
      $container.html(generateHTML);
      
      $.ajaxSetup({
        cache: true
      });
      
      checkStyleForHeaderAndFooter();
      
      //get URI Parameters:
      if (ema.model.getUriParameter(document.location.href, 'devmode') !== null) {
        configMap.parameter_map.CONFIG.DEVELOPMENTMODE = ema.model.getUriParameter(document.location.href, 'devmode');
      }
      if (ema.model.getUriParameter(document.location.href, 'username') !== null && ema.model.getUriParameter(document.location.href, 'password') !== null) {
        ema.model.saveToLocalStorage('uriUsername', ema.model.getUriParameter(document.location.href, 'username'));
        ema.model.saveToLocalStorage('uriPassword', ema.model.getUriParameter(document.location.href, 'password'));
      }
      
      sourcePath = ema.model.getUriParameter(document.location.href, 'sourcePath');
      navText = ema.model.getUriParameter(document.location.href, 'navText');
      
      if (checkLoginState() === false) {
        //save the original target
        if (sourcePath !== null && sourcePath !== ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.login') {
          stateMap.reqSourcePath = sourcePath;
          stateMap.reqNavText = navText;
        }
        //login is required -> load loginpage
        changeHash(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.login', '');
      } else {
        //login is not required
        if (sourcePath !== null && sourcePath !== ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.login') {
          stateMap.reqSourcePath = sourcePath;
          stateMap.reqNavText = navText;
          changeHash(sourcePath, navText);
        } else {
          changeHash(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu', 'Home');
        }
        //set up database
        ema.datamanager.initDatabase();
      }
      loadFooter();
    } catch (e) {
      handleError('initModule', e, 'e');
    }
  };
  // End PUBLIC method /initModule/
  // Begin PUBLIC method /getLogoutminutes/
  getLogoutminutes = function () {
    try {
      return configMap.logoutminutes * 1;
    } catch (e) {
      handleError('getLogoutminutes', e, 'e');
    }
  };
  // End PUBLIC method /getLogoutminutes/
  // Begin PUBLIC method /getKeyValueList/
  getKeyValueList = function (keyvaluetype) {
    try {
      if (configMap.keyValues[keyvaluetype] !== undefined) {
        return configMap.keyValues[keyvaluetype];
      } else {
        return {'---' : getLanguageTextString('errors', 'errnooptions')};
      }
    } catch (e) {
      handleError('getKeyValueList', e, 'e');
    }
  };
  // End PUBLIC method /getKeyValueList/
  // Begin PUBLIC method /getKeyValue/
  getKeyValue = function (keyvaluetype, keyvalue) {
    try {
      if (configMap.keyValues[keyvaluetype] !== undefined) {
        if (configMap.keyValues[keyvaluetype][keyvalue] !== undefined) {
          return configMap.keyValues[keyvaluetype][keyvalue];
        } else {
          return keyvalue;
        }
      } else {
        return keyvalue;
      }
    } catch (e) {
      handleError('getKeyValue', e, 'e');
    }
  };
  // End PUBLIC method /getKeyValue/
  // Begin PUBLIC method /getLanguageTextString/
  getLanguageTextString = function (labelCategory, labelName) {
    try {
      if (stateMap.languageJson[labelCategory] !== undefined) {
        if (stateMap.languageJson[labelCategory][labelName] !== undefined) {
          return stateMap.languageJson[labelCategory][labelName];
        } else {
          return labelName;
        }
      } else {
        return labelName;
      }
    } catch (e) {
      handleError('getLanguageTextString', e, 'e');
    }
  };
  // End PUBLIC method /getLanguageTextString/
  // Begin PUBLIC method /getLanguagesOptions/
  getLanguagesOptions = function () {
    try {
      return stateMap.languages_options;
    } catch (e) {
      handleError('getLanguagesOptions', e, 'e');
    }
  };
  // End PUBLIC method /getLanguagesOptions/
  // Begin PUBLIC method /setSelectedLanguage/
  setSelectedLanguage = function (newLanguage) {
    try {
      stateMap.selected_language = newLanguage;
    } catch (e) {
      handleError('setSelectedLanguage', e, 'e');
    }
  };
  // End PUBLIC method /setSelectedLanguage/
  // Begin PUBLIC method /setUserLoggedOn/
  setUserLoggedOn = function (isUserLoggedOn) {
    try {
      stateMap.isUserLoggedOn = isUserLoggedOn;
    } catch (e) {
      handleError('setUserLoggedOn', e, 'e');
    }
  };
  // End PUBLIC method /setUserLoggedOn/
  // Begin PUBLIC method /getStateMapValue/
  getStateMapValue = function (stateMapValue) {
    try {
      return stateMap[stateMapValue];
    } catch (e) {
      handleError('getStateMapValue', e, 'e');
    }
  };
  // End PUBLIC method /getStateMapValue/
  // Begin PUBLIC method /getOnlineStatus/
  getOnlineStatus = function () {
    try {
      if (stateMap.isAppOnline === true && stateMap.isUserOnline === true) {
        $('#statusdb_online').addClass('green');
        $('#statusdb_online').removeClass('red');
        $('#statusdb_online').removeClass('darkgrey');
        return true;
      } else {
        $('#statusdb_online').removeClass('green');
        $('#statusdb_online').addClass('red');
        $('#statusdb_online').removeClass('darkgrey');
        return false;
      }
    } catch (e) {
      handleError('getOnlineStatus', e, 'e');
    }
  };
  // End PUBLIC method /getOnlineStatus/
  // Begin PUBLIC method /getConfigMapConfigValue/
  getConfigMapConfigValue = function (paramName) {
    try {
      return configMap.parameter_map.CONFIG[paramName];
    } catch (e) {
      handleError('getConfigMapConfigValue', e, 'e');
    }
  };
  // End PUBLIC method /getConfigMapConfigValue/
  // Begin PUBLIC method /getConfigMapIndexedDb/
  getConfigMapIndexedDb = function (paramName) {
    try {
      return configMap.parameter_map.INDEXEDDB;
    } catch (e) {
      handleError('getConfigMapIndexedDb', e, 'e');
    }
  };
  // End PUBLIC method /getConfigMapIndexedDb/
  // Begin PUBLIC method /getContentContainer/
  getContentContainer = function () {
    try {
      return configMap.contentContainer;
    } catch (e) {
      handleError('getContentContainer', e, 'e');
    }
  };
  // End PUBLIC method /getContentContainer/
  // Begin PUBLIC method /addContenDiv/
  addContentDiv = function (divName, divId) {
    try {
      stateMap.contentIdList[divName] = divId;
    } catch (e) {
      handleError('addContentDiv', e, 'e');
    }
  };
  // End PUBLIC method /addContentDiv/
  // Begin PUBLIC method /addOnloadFunction/
  addOnloadFunction = function (path, onloadFunction) {
    try {
      stateMap.onloadFunctionList[path] = onloadFunction;
    } catch (e) {
      handleError('addOnloadFunction', e, 'e');
    }
  };
  // End PUBLIC method /addOnloadFunction/
  // Begin PUBLIC method /addOnUnloadFunction/
  addOnUnloadFunction = function (containerName, onUnloadFunction) {
    try {
      stateMap.onUnloadFunctionList[containerName] = onUnloadFunction;
    } catch (e) {
      handleError('addOnUnloadFunction', e, 'e');
    }
  };
  // End PUBLIC method /addOnUnloadFunction/
  // Begin PUBLIC method /addOnloadFocusField/
  addOnloadFocusField = function (divName, fieldName) {
    try {
      stateMap.onloadFocusField[divName] = fieldName;
    } catch (e) {
      handleError('addOnloadFocusField', e, 'e');
    }
  };
  // End PUBLIC method /addOnloadFocusField/
  // Begin PUBLIC method /activateSaveConfirm/
  activateSaveConfirm = function (containerName) {
    try {
      stateMap.saveConfirmList[containerName] = containerName;
    } catch (e) {
      handleError('activateSaveConfirm', e, 'e');
    }
  };
  // End PUBLIC method /activateSaveConfirm/
  // Begin PUBLIC method /activateLoadingAnimation/
  activateLoadingAnimation = function (path, container) {
    try {
      stateMap.loadingAnimationList[path] = container;
    } catch (e) {
      handleError('activateLoadingAnimation', e, 'e');
    }
  };
  // End PUBLIC method /activateLoadingAnimation/
  // Begin PUBLIC method /setMenuGenerated/
  setMenuGenerated = function (isMenuGenerated) {
    try {
      stateMap.isMenuGenerated = isMenuGenerated;
    } catch (e) {
      handleError('setMenuGenerated', e, 'e');
    }
  };
  // End PUBLIC method /setMenuGenerated/
  // Begin PUBLIC method /loadModule/
  /*
   * Diese Funktion lädt ein bestimmtes Modul in den Contentbereich
   * sourcePath   String - wo findet sich der htmlcode für das Module 
   */
  loadModule = function (sourcePath, navText) {
    try {
      ema.model.setLogoutTime();
      //reset Footer
      $('#footerbutton').html('&nbsp;');
      if (stateMap.contentIdList[sourcePath] === undefined) {
        //JS File nachladen
        importModuleJSFile(sourcePath, navText);
      } else {
        showModule(sourcePath, navText);
      }
    } catch (e) {
      handleError('loadModule', e, 'e');
    }
  };
  // End PUBLIC method /loadModule/
  // Begin PUBLIC method /changeHash/
  /*
   * prepares a hash change
   * optional the user has to comfirm the change bevor it is triggered
   */
  changeHash = function (sourcePath, navText, saveConfirm) {
    try {
      var callConfirmLayer, divChange, aktDiv;
      
      callConfirmLayer = false;
      
      //check if the user has to comfirm the change
      if ($('#' + configMap.contentContainer).find('.contentDiv:visible').length > 0) {
        aktDiv = $('#' + configMap.contentContainer).find('.contentDiv:visible')[0].id;
        if (stateMap.saveConfirmList[aktDiv] !== undefined) {
          if (saveConfirm !== false) {
            callConfirmLayer = true;
          }
        }
      }
      //save parameters
      divChange = {};
      divChange.sourcePath = sourcePath;
      divChange.navText = navText;
      divChange.aktDiv = aktDiv;
      stateMap.divChange = divChange;
      
      if (callConfirmLayer === true) {
        showDialog('ema_save_confirm');
      } else {
        changeHashSub();
      }
      
    } catch (e) {
      handleError('changeHash', e, 'e');
    }
  };
  // End PUBLIC method /changeHash/
  // Begin PUBLIC method /changeHashSub/
  /*
   * changes the uri and triggeres an onhashchange event
   */
  changeHashSub = function () {
    try {
      var
      currSourcePath,
      currNavText,
      newUri,
      neuesDiv;

      if (stateMap.divChange.sourcePath !== undefined) {
        //hide errors
        if (stateMap.divChange.sourcePath.indexOf('menuDiv') === -1 && stateMap.divChange.sourcePath !== ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu') {
          hideError();
        }
        showHideBreadcrumb(true);
        showHideDashboard(true);
        
        hideLoadingAnimLayer();
        
        currSourcePath = ema.model.getUriParameter(document.location.href, 'sourcePath');
        currNavText = ema.model.getUriParameter(document.location.href, 'navText');
        //check if new uri equals the current uri - if it does no hashchange event can be triggered
        if (stateMap.divChange.sourcePath === currSourcePath) {
          if (stateMap.divChange.sourcePath === ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu' || stateMap.divChange.sourcePath === ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.login' || stateMap.divChange.sourcePath === ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.sync') {
            //of the sourcepath is menu most likly f5 was pressed -> load home uri (.../ema.html)
            loadModule(stateMap.divChange.sourcePath, stateMap.divChange.navText);
          } else if (stateMap.divChange.sourcePath === ema.shell.getStateMapValue('reqSourcePath')) {
            loadModule(stateMap.divChange.sourcePath, stateMap.divChange.navText);
            ema.shell.resetReqSourcePath();
          }
        } else {
          //append sourcepath and navtext to uri
          newUri = ema.model.getUri(document.location.href) + '#' + window.btoa('sourcePath=' + stateMap.divChange.sourcePath + '&navText=' + stateMap.divChange.navText);
          
          //execute modules onload function
          if (stateMap.divChange.aktDiv !== undefined) {
            if (stateMap.onUnloadFunctionList[stateMap.divChange.aktDiv] !== undefined) {
              stateMap.onUnloadFunctionList[stateMap.divChange.aktDiv]();
            }
          }
          document.location.href = newUri;
        }
      }
    } catch (e) {
      handleError('changeHashSub', e, 'e');
    }
  };
  // End PUBLIC method /changeHashSub/
  // Begin PUBLIC method /loadEmbeddedUri/
  /*
   * creates a new contentdiv with an iframe and trigges an hashchange for the div
   */
  loadEmbeddedUri = function (sourcePath, navText) {
    try {
      var
      currSourcePath,
      currNavText,
      newUri,
      neuesDiv;

      currSourcePath = ema.model.getUriParameter(document.location.href, 'sourcePath');
      currNavText = ema.model.getUriParameter(document.location.href, 'navText');
      
      //Div für das neue Modul erstellen
      stateMap.contentIdMax += 1;
      stateMap.contentIdList[sourcePath] = 'contentDiv' + stateMap.contentIdMax;
      neuesDiv = $('<div class="w100p contentDiv" id="contentDiv' + stateMap.contentIdMax + '\"><iframe src="' + sourcePath + '"></iframe></div>');
      neuesDiv.appendTo('#' + configMap.contentContainer);

      //check if new uri equals the current uri
      if (sourcePath === currSourcePath) {
        newUri = ema.model.getUri(document.location.href);
      } else {
        //append sourcepath and navtext to uri
        newUri = ema.model.getUri(document.location.href) + '#' + window.btoa('sourcePath=' + sourcePath + '&navText=' + navText);
      }

      document.location.href = newUri;
    } catch (e) {
      handleError('loadEmbeddedUri', e, 'e');
    }
  };
  // End PUBLIC method /loadEmbeddedUri/
  // Begin PUBLIC method /historyBack/
  /*
   * loads the previous screen - triggered in the breadcrumb nav
   */
  historyBack = function () {
    try {
      stateMap.navList.pop();
      changeHash(stateMap.navList[stateMap.navList.length - 1].sourcePath, 'nichts');
    } catch (e) {
      handleError('historyBack', e, 'e');
    }
  };
  // End PUBLIC method /historyBack/
  // Begin PUBLIC method /showHideDashboard/
  /*
   * shows/hides the dashboard
   */
  showHideDashboard = function (hide) {
    try {
      if (hide === true) {
        //$('#btnDashboard').addClass('icon-angle-up');
        //$('#btnDashboard').removeClass('icon-angle-down');
        $('#dashbord').addClass('hidden');
        $('#dashbord').removeClass('dbe');
      } else {
        //$('#btnDashboard').toggleClass('icon-angle-down icon-angle-up');
        $('#dashbord').toggleClass('hidden dbe');
        if ($('#dashbord').hasClass('dbe') === true) {
          loadDashboard(true);
        }
      }
    } catch (e) {
      handleError('showHideDashboard', e, 'e');
    }
  };
  // End PUBLIC method /showHideDashboard/
  // Begin PUBLIC method /logout/
  logout = function () {
    try {
      ema.model.terminateTimerTask();
      ema.model.saveToLocalStorage('curr_username', '');
      ema.model.saveToLocalStorage('curr_password', '');
      ema.model.saveToLocalStorage('curr_username_abbr', '');
      ema.model.saveToLocalStorage('LogoutTime', '0');
      stateMap.isUserLoggedOn = false;
      ema.datamanager.startSynchronisation('up');
      $('#password').val('');
      document.location.href = ema.model.getUri(document.location.href);
    } catch (e) {
      handleError('logout', e, 'e');
    }
  };
  // End PUBLIC method /logout/
  // Begin PUBLIC method /toggleOnline/
  /*
   * toggles online/offline
   */
  toggleOnline = function () {
    try {
      if (stateMap.isUserOnline === true) {
        stateMap.isUserOnline = false;
      } else {
        stateMap.isUserOnline = true;
        //user want to switch to online - if there is no connection the apps stays offline
        if (stateMap.isAppOnline === false) {
          handleCustomError('toggleOnline', 'errtoggleonline', 'i');
        }
      }
      loadDashboard();
      ema.model.loadLanguagePattern(stateMap.selected_language);
    } catch (e) {
      handleError('toggleOnline', e, 'e');
    }
  };
  // End PUBLIC method /toggleOnline/
  // Begin PUBLIC method /showHideSection/
  showHideSection = function (sectionId) {
    try {
      $('#button' + sectionId).toggleClass('icon-angle-down icon-angle-up');
      if ($('#section' + sectionId + '_hidden').is(':visible') === true) {
        $('#section' + sectionId + '_hidden').hide();
        $('#section' + sectionId).toggleClass('greybg');
      } else {
        $('#section' + sectionId + '_hidden').show();
        $('#section' + sectionId).toggleClass('greybg');
      }
    } catch (e) {
      handleError('showHideSection', e, 'e');
    }
  };
  // End PUBLIC method /showHideSection/
  // Begin PUBLIC method /showSections/
  showSections = function (sectionIds) {
    try {
      var i;
      for (i = 0; i < sectionIds.length; i += 1) {
        $('#button' + sectionIds[i]).addClass('icon-angle-down');
        $('#button' + sectionIds[i]).removeClass('icon-angle-up');
        $('#section' + sectionIds[i] + '_hidden').show();
        $('#section' + sectionIds[i]).addClass('greybg');
        
      }
    } catch (e) {
      handleError('showSections', e, 'e');
    }
  };
  // End PUBLIC method /showSections/
  // Begin PUBLIC method /hideSections/
  hideSections = function (sectionIds) {
    try {
      var i;
      for (i = 0; i < sectionIds.length; i += 1) {
        $('#button' + sectionIds[i]).removeClass('icon-angle-down');
        $('#button' + sectionIds[i]).addClass('icon-angle-up');
        $('#section' + sectionIds[i] + '_hidden').hide();
        $('#section' + sectionIds[i]).removeClass('greybg');
        
      }
    } catch (e) {
      handleError('hideSections', e, 'e');
    }
  };
  // End PUBLIC method /hideSections/
  // Begin PUBLIC method /loadKeyValues/
  loadKeyValues = function () {
    try {
      var i;
      for (i = 0; i < configMap.parameter_map.KEYVALUES.length; i += 1) {
        if (configMap.parameter_map.KEYVALUES[i].TYPE === 'SAP') {
          loadSapKeyValue(configMap.parameter_map.KEYVALUES[i]);
        } else if (configMap.parameter_map.KEYVALUES[i].TYPE === 'FILE') {
          loadKeyValueFile(configMap.parameter_map.KEYVALUES[i]);
        }
      }
    } catch (e) {
      handleError('Begin', e, 'e');
    }
  };
  // End PUBLIC method /loadKeyValues/
  // Begin PUBLIC method /loadSapKeyValueCallBack/
  loadSapKeyValueCallBack = function (json) {
    try {
      var i;

      if (json !== undefined) {
        for (i = 0; i < json.TABLES.DD07V_TAB.length; i += 1) {
          if (configMap.keyValues[json.TABLES.DD07V_TAB[i].DOMNAME] === undefined) {
            configMap.keyValues[json.TABLES.DD07V_TAB[i].DOMNAME] = {};
          }
          configMap.keyValues[json.TABLES.DD07V_TAB[i].DOMNAME][json.TABLES.DD07V_TAB[i].DOMVALUE_L] = json.TABLES.DD07V_TAB[i].DDTEXT;
        }
      }
    } catch (e) {
      handleError('loadSapKeyValueCallBack', e, 'e');
    }
  };
  // End PUBLIC method /loadSapKeyValueCallBack/
  // Begin PUBLIC method /resetLanguage/
  resetLanguage = function () {
    try {
      stateMap.languageJson = undefined;
    } catch (e) {
      handleError('resetLanguage', e, 'e');
    }
  };
  // End PUBLIC method /resetLanguage/
  // Begin PUBLIC method /setLanguage/
  setLanguage = function (languageObj) {
    try {
      stateMap.languageJson = languageObj;
    } catch (e) {
      handleError('setLanguage', e, 'e');
    }
  };
  // End PUBLIC method /setLanguage/
  // Begin PUBLIC method /showDialog/
  showDialog = function (elName, scroll) {
    try {
      $('#' + elName).toggleClass('hidden overlay');
      if (scroll !== false && $('#' + elName).hasClass('hidden') === false) {
        window.scrollTo(0, 0);
      }
    } catch (e) {
      handleError('showDialog', e, 'e');
    }
  };
  // End PUBLIC method /showDialog/
  // Begin PUBLIC method /resetReqSourcePath/
  resetReqSourcePath = function () {
    try {
      stateMap.reqSourcePath = '';
      stateMap.reqNavText = '';
    } catch (e) {
      handleError('resetReqSourcePath', e, 'e');
    }
  };
  // End PUBLIC method /resetReqSourcePath/
  // Begin PUBLIC method /resizeCanvas/
  resizeCanvas = function (elemId) {
    var 
    ratio, 
    wrapper,
    clearButton,
    saveButton,
    canvas;
    
    ratio =  window.devicePixelRatio || 1;
    wrapper = document.getElementById(elemId);
    clearButton = wrapper.querySelector('[data-action=clear]');
    saveButton = wrapper.querySelector('[data-action=save]');
    canvas = wrapper.querySelector('canvas');
    
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
  };
  // End PUBLIC method /resizeCanvas/
  // Begin PUBLIC method /updateSyncScreen/
  updateSyncScreen = function () {
    try {
      if (stateMap.contentIdList[ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.sync'] !== undefined) {
        if ($('#' + stateMap.contentIdList[ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.sync']).is(":visible") === true) {
          stateMap.syncScreenReload = true;
          loadModule(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.sync', undefined);
        }
      }
    } catch (e) {
      handleError('updateSyncScreen', e, 'e');
    }
  };
  // End PUBLIC method /updateSyncScreen/
  // Begin PUBLIC method /gotoMenu/
  gotoMenu = function () {
    try {
      var 
      i,
      firstMenuEntry;
      
      firstMenuEntry = '';
      for (i = stateMap.navList.length - 1; i >= 0; i -= 1) {
        if (stateMap.navList[i].sourcePath.indexOf('menuDiv') > -1 || stateMap.navList[i].sourcePath === ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu') {
          firstMenuEntry = stateMap.navList[i].sourcePath;
          i = -1;
        }
      }
      if (firstMenuEntry !== '') {
        changeHash(firstMenuEntry, 'menu', false);
      }
    } catch (e) {
      handleError('gotoMenu', e, 'e');
    }
  };
  // End PUBLIC method /gotoMenu/
  // Begin PUBLIC method /showLoadingAnimLayer/
  showLoadingAnimLayer = function () {
    try {
      $('#ema_loadinganim_layer').addClass('overlay');
      $('#ema_loadinganim_layer').removeClass('hidden');
      window.scrollTo(0, 0);
    } catch (e) {
      handleError('showLoadingAnimLayer', e, 'e');
    }
  };
  // End PUBLIC method /showLoadingAnimLayer/
  // Begin PUBLIC method /hideLoadingAnimLayer/  hideLoadingAnimLayer = function () {
  hideLoadingAnimLayer = function () {
    try {
      $('#ema_loadinganim_layer').addClass('hidden');
      $('#ema_loadinganim_layer').removeClass('overlay');
    } catch (e) {
      handleError('hideLoadingAnimLayer', e, 'e');
    }
  };
  // End PUBLIC method /hideLoadingAnimLayer/
  // Begin PUBLIC method /showHideBreadcrumb/
  showHideBreadcrumb = function (hide) {
    try {
      if (hide === true) {
        $('#breadcrumb').addClass('hidden');
        $('#breadcrumb').removeClass('bc');
      } else {
        $('#breadcrumb').toggleClass('hidden bc');
      }
    } catch (e) {
      handleError('showHideBreadcrumb', e, 'e');
    }
  };
  // End PUBLIC method /showHideBreadcrumb/
  // Begin PUBLIC method /checkStyleForHeaderAndFooter/
  checkStyleForHeaderAndFooter = function () {
    try {
      if (ema.model.loadFromLocalStorage('setupValueShowHeader') === 'false') {
        $('#navdiv').addClass('wnav navdivt');
        $('#navdiv').removeClass('w100p navdiv');
        $('#navmenu').addClass('dbswitch navdiv');
        $('#navmenu').removeClass('hidden');
        $('#ema_content').addClass('contentt');
        $('#ema_content').removeClass('contentt3');
      } else {
        $('#navdiv').addClass('w100p navdiv');
        $('#navdiv').removeClass('wnav navdivt');
        $('#navmenu').addClass('hidden');
        $('#navmenu').removeClass('dbswitch navdiv');
        $('#ema_content').addClass('contentt3');
        $('#ema_content').removeClass('contentt');
      }
      if (ema.model.loadFromLocalStorage('setupValueShowFooter') === 'false') {
        $('#footerbar').addClass('w95p footerbart');
        $('#footerbar').removeClass('w100p footerbar');
        $('#footermenu').addClass('dbswitch');
        $('#footermenu').removeClass('hidden');
        $('#ema_content').addClass('contentb');
        $('#ema_content').removeClass('contentb3');
      } else {
        $('#footerbar').addClass('w100p footerbar');
        $('#footerbar').removeClass('w95 footerbart');
        $('#footermenu').addClass('hidden');
        $('#footermenu').removeClass('dbswitch');
        $('#ema_content').addClass('contentb3');
        $('#ema_content').removeClass('contentb');
      }
    } catch (e) {
      handleError('checkStyleForHeaderAndFooter', e, 'e');
    }
  };
  // End PUBLIC method /checkStyleForHeaderAndFooter/
  // Begin PUBLIC method /showHideHeader/
  showHideHeader = function () {
    try {
      if ($('#btnnavmenu').hasClass('icon-angle-up') === true) {
        $('#btnnavmenu').addClass('icon-angle-down');
        $('#btnnavmenu').removeClass('icon-angle-up');
        $('#navdiv').addClass('navdiv');
        $('#navdiv').removeClass('navdivt');
      } else {
        $('#btnnavmenu').addClass('icon-angle-up');
        $('#btnnavmenu').removeClass('icon-angle-down');
        $('#navdiv').addClass('navdivt');
        $('#navdiv').removeClass('navdiv');
      }
    } catch (e) {
      handleError('showHideHeader', e, 'e');
    }
  };
  // End PUBLIC method /showHideHeader/
  // Begin PUBLIC method /showHideFooter/
  showHideFooter = function () {
    try {
      if ($('#btnfootermenu').hasClass('icon-angle-down') === true) {
        $('#btnfootermenu').addClass('icon-angle-up');
        $('#btnfootermenu').removeClass('icon-angle-down');
        $('#footerbar').addClass('footerbar');
        $('#footerbar').removeClass('footerbart');
      } else {
        $('#btnfootermenu').addClass('icon-angle-down');
        $('#btnfootermenu').removeClass('icon-angle-up');
        $('#footerbar').addClass('footerbart');
        $('#footerbar').removeClass('footerbar');
      }
    } catch (e) {
      handleError('showHideFooter', e, 'e');
    }
  };
  // End PUBLIC method /showHideFooter/
  // Begin PUBLIC method /confirmLogout/
  confirmLogout = function () {
    try {
      if (stateMap.isUserLoggedOn === true) {
        showDialog('ema_logout_confirm');
      }
    } catch (e) {
      handleError('confirmLogout', e, 'e');
    }
  };
  // End PUBLIC method /confirmLogout/

  $(window)
  .bind('hashchange', onHashchange);
  
  
    
  return { 
    configModule : configModule,
    initModule : initModule,
    handleCustomError : handleCustomError, 
    handleError : handleError, 
    handleWSError : handleWSError, 
    hideError : hideError,
    getLanguagesOptions : getLanguagesOptions,
    setSelectedLanguage : setSelectedLanguage,
    setUserLoggedOn : setUserLoggedOn,
    getStateMapValue : getStateMapValue,
    getOnlineStatus : getOnlineStatus,
    getConfigMapConfigValue : getConfigMapConfigValue,
    getConfigMapIndexedDb : getConfigMapIndexedDb,
    getContentContainer : getContentContainer,
    getLogoutminutes : getLogoutminutes,
    getKeyValueList : getKeyValueList,
    getKeyValue : getKeyValue,
    loadModule : loadModule,
    showHideDashboard : showHideDashboard,
    logout : logout,
    toggleOnline : toggleOnline,
    setMenuGenerated: setMenuGenerated,
    addContentDiv : addContentDiv,
    addOnloadFunction : addOnloadFunction,
    addOnUnloadFunction : addOnUnloadFunction,
    addOnloadFocusField : addOnloadFocusField,
    activateSaveConfirm : activateSaveConfirm,
    activateLoadingAnimation : activateLoadingAnimation,
    changeHash : changeHash,
    changeHashSub : changeHashSub,
    loadEmbeddedUri : loadEmbeddedUri,
    historyBack : historyBack,
    showHideSection : showHideSection,
    showSections : showSections,
    hideSections : hideSections,
    loadKeyValues : loadKeyValues,
    loadSapKeyValueCallBack : loadSapKeyValueCallBack,
    resetLanguage : resetLanguage,
    setLanguage : setLanguage,
    getLanguageTextString : getLanguageTextString,
    showDialog : showDialog,
    resetReqSourcePath : resetReqSourcePath,
    resizeCanvas : resizeCanvas,
    updateSyncScreen : updateSyncScreen,
    gotoMenu : gotoMenu,
    showLoadingAnimLayer : showLoadingAnimLayer,
    hideLoadingAnimLayer : hideLoadingAnimLayer,
    showHideBreadcrumb : showHideBreadcrumb,
    checkStyleForHeaderAndFooter : checkStyleForHeaderAndFooter,
    showHideHeader : showHideHeader,
    showHideFooter : showHideFooter,
    confirmLogout : confirmLogout
  };
  //------------------- END PUBLIC METHODS ---------------------
}());

/*
 * ema.shell.js
 * Shell module for EMA
 */
ema.shell = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  configMap = {
      parameter_map : {},
      versions : {},
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
      loadedJSFiles : {},
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
      syncScreenReload : false,
      mobileBrowser : false,
      autosave_navtext : undefined,
      autosave_path : undefined,
      autosave_html : undefined,
      autosave_canvas : undefined,
      autosave_input : undefined,
      autosave_checkbox : undefined,
      autosave_statemap : undefined,
      autosaveContainer : undefined,
      autosaveLoadSave : false,
      autosaveLastSave : undefined
    },

  //internal functions
  generateHTML, loadConfig, loadVersions, 
  loadVersionsSub, checkLoginState, loadFooter, 
  importModuleJSFile, generateNavigation, deleteNavigation, 
  loadDashboard, showModule, onHashchange, 
  loadKeyValueFile, loadSapKeyValue, callModuleInitFunction, 
  loadModuleConfig, evaluteModuleConfig, loadModuleScript, 
  loadModuleLanguage, checkModuleLanguageStatus, checkBrowser, 
  generateContentDiv, readAutosaveCanvas, writeAutosaveCanvas, 
  writeAutosaveCanvasSub, readAutosaveInput, writeAutosaveInput, 
  readAutosaveCheckbox, writeAutosaveCheckbox,

  //public functions
  configModule, initModule, 
  handleCustomError, handleError, handleWSError, 
  hideError, getLanguagesOptions, setSelectedLanguage, 
  setUserLoggedOn, getStateMapValue, getOnlineStatus, 
  getConfigMapConfigValue, getConfigMapIndexedDb, getContentContainer, 
  getLogoutminutes, getKeyValueList, getKeyValue, 
  loadModule, showHideDashboard, logout, 
  toggleOnline, setMenuGenerated, addContentDiv, 
  addOnloadFunction, addOnUnloadFunction, addOnloadFocusField, 
  activateSaveConfirm, activateLoadingAnimation, changeHash, 
  changeHashSub, loadEmbeddedUri, historyBack, 
  showHideSection, showSections, hideSections, 
  loadKeyValues, loadSapKeyValueCallBack, resetLanguage, 
  setLanguage, getLanguageTextString, showDialog, 
  resetReqSourcePath, resizeCanvas, updateSyncScreen, 
  gotoMenu, showLoadingAnimLayer, hideLoadingAnimLayer, 
  showHideBreadcrumb, checkStyleForHeaderAndFooter, showHideHeader, 
  showHideFooter, confirmLogout, getConfigMapExternalHelpValue, 
  resetContentDivs, processAutosave, registerAutosave, 
  removeAutosave, checkAutosave, checkAutosaveSub,
  getVersionForFile;

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
      '<div class="signaturebutton"><button class="button_exit w100p lblbuttonexit" onclick="ema.shell.showDialog(\'ema_save_confirm\');ema.shell.changeHashSub();"></button></div>' + 
      '</div>' +
      '</div>' +
      '</div>' + 
      '</div>' + 
      //LoadAutosaveConfirm-Layer
      '<div id="ema_load_autosave_confirm" class="hidden">' +  
      '<div class="overlayinner">' +
      '<div class="hcontent overlaycontent w50p">' +
      '<div class="w80p overlayhead">&nbsp;</div>' +
      '<div class="w20p overlayhead r"><a onclick="ema.shell.removeAutosave(true);" class="tbg"><i class="icon-cancel"></i></a></div>' +
      '<div class="w100p lblautosave c">&nbsp;</div>' +
      '<div class="w100p">' +
      '<div class="signaturebutton"><button class="button_nok w100p lblbuttoncancel" onclick="ema.shell.removeAutosave(true);"></button></div>' +
      '<div class="signaturebutton"><button class="button_ok w100p lblbuttonproceed" onclick="ema.shell.showDialog(\'ema_load_autosave_confirm\');ema.shell.changeHashSub();"></button></div>' + 
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
      '<div class="signaturebutton"><button class="button_exit w100p lblbuttonexit" onclick="ema.shell.showDialog(\'ema_logout_confirm\');ema.shell.logout();"></button></div>' + 
      '</div>' +
      '</div>' +
      '</div>' + 
      '</div>' + 
      //ExternalHelp-Layer
      '<div id="ema_external_help" class="hidden">' +  
      '<div class="overlayinner">' +
      '<div class="hcontent overlaycontent w50p">' +
      '<div class="w80p overlayhead">&nbsp;</div>' +
      '<div class="w20p overlayhead r"><a onclick="ema.formgenerator.openHelpInNewWindow()" class="tbg"><i class="icon-level-up"></i></a>&nbsp;<a onclick="ema.shell.showDialog(\'ema_external_help\')" class="tbg"><i class="icon-cancel"></i></a></div>' +
      '<div class="w100p c"><iframe src="about:blank" id="ema_external_help_frame"></iframe></div>' +
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
        url: getVersionForFile('config', 'properties'),
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
                stateMap.languageFileStatus[configMap.parameter_map.MODULES.LANGUAGES[i] + '_' + lang] = 'pending';
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
  // Begin INTERNAL method /loadVersions/
  /*
   * loads the versions file and saves it to configMap.versions
   */
  loadVersions = function () {
    try {
      loadVersionsSub('versions.json');
      if (configMap.versions.versionpath !== undefined && configMap.versions.versionpath !== '') {
        loadVersionsSub(configMap.versions.versionpath);
      }
    } catch (e) {
      handleError('loadVersions', e, 'e');
    }
  };
  // End INTERNAL method /loadVersions/
  // Begin INTERNAL method /loadVersionsSub/
  /*
   * loads the versions file and saves it to configMap.versions
   */
  loadVersionsSub = function (versionPath) {
    try {
      $.ajax({
        url: versionPath,
        type: 'GET',
        cache: false,
        contentType: 'utf-8',
        dataType: 'json',
        async: false,
        success: function (retString) {
          configMap.versions = retString;
        },
        error: function (xhr, status, errorThrown) {
          handleWSError('loadVersionsSub', xhr, status, errorThrown, 'e');
        }
      });
    } catch (e) {
      handleError('loadVersionsSub', e, 'e');
    }
  };
  // End INTERNAL method /loadVersionsSub/
  // Begin INTERNAL method /loadKeyValueFile/
  loadKeyValueFile = function (keyValueConfig) {
    try {
      $.ajax({
        url: getVersionForFile(keyValueConfig.LOCATION + stateMap.selected_language, 'json'),
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
          //if (logoutTime - aktTime.getTime() > 0 && ema.model.loadFromLocalStorage('curr_username') !== '') {
          if (logoutTime - aktTime.getTime() > 0 && ema.model.loadFromLocalStorage('curr_username') !== '--logged-out--') {
            //start logouttimer
            ema.model.startTimerTask();
            stateMap.isUserLoggedOn = true;
            //load language
            stateMap.selected_language = ema.model.loadFromLocalStorage('sel_language');
            ema.model.loadLanguagePattern(stateMap.selected_language, false);
            return true;    //no login required
          } else {
            ema.model.saveToLocalStorage('curr_username', '--logged-out--');
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
        
        //reset AutosaveData
        if (stateMap.isUserLoggedOn === true) {
          removeAutosave(false);
        }
        
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
  
        ema.model.loadLanguagePattern(stateMap.selected_language, false);
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
        $.getScript(getVersionForFile(path, 'js') + '#')
        .done(function (script, textStatus) {
          generateContentDiv(path, navText);
        })
        .fail(function (jqxhr, settings, exception) {
          handleCustomError('importModuleJSFile', exception, 'e');
        });
      } else {
        sjl.load([getVersionForFile(path, 'js') + '#'], function () {
          $('document').ready(function () {
            generateContentDiv(path, navText);
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
      htmlAutosave = '',
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
        //5. Section Autosave
        htmlAutosave = '<div class="dbentry dbr">';
        if (stateMap.autosave_path !== undefined && stateMap.autosave_path !== '') {
          htmlAutosave += '<div class="w100p lblautosaveactive green"></div>';
        } else {
          htmlAutosave += '<div class="w100p lblautosaveinactive red"></div>';
        }
        if (stateMap.autosaveLastSave > 0) {
          htmlAutosave += '<div id="autosaveLastSave" class="w100p ">' + ema.shell.getLanguageTextString('allgemein', 'lbllastautosave') + ': ' + ema.model.formatDateTimeForDisplay(stateMap.autosaveLastSave) + '</div>';
        } else {
          htmlAutosave += '<div id="autosaveLastSave" class="w100p ">' + ema.shell.getLanguageTextString('allgemein', 'lbllastautosave') + ': ---</div>';
        }
        htmlAutosave += '</div>';
      } else {
        //3. Section System
        htmlSystem = '<div class="dbentry dbr">';
        htmlSystem += '<div class="w100p"><span class="lblsystem"></span>: ---</div>';
        htmlSystem += '<div class="w100p"><span class="lblclient"></span>: ---</div>';
        htmlSystem += '</div>';
      }
      
      //6. Section Setup
      htmlSetup = '<div class="dbentry dbr">';
      htmlSetup += '<div class="w100p"><a onclick="ema.shell.changeHash(ema.shell.getConfigMapConfigValue(\'COREPATH\') + \'modules/ema.setup\', undefined)" class="lblsetup"></a></div>';
      htmlSetup += '</div>';
      
      $('#dashbord').html(htmldb + htmlOnline + htmlUser + htmlSystem + htmlSync + htmlAutosave + htmlSetup + '</div>' + htmlShowHide);
      if (reloadLanguagePattern === true) {
        ema.model.loadLanguagePattern(stateMap.selected_language, false);
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
        //Load Autosave ...
        if (stateMap.autosaveLoadSave === true && stateMap.isUserLoggedOn === true) {
          $('#' + contentDiv).html(stateMap.autosave_html);
          writeAutosaveCanvas(contentDiv);
          writeAutosaveInput(contentDiv);
          writeAutosaveCheckbox(contentDiv);
          stateMap.autosaveLoadSave = false;
          moduleObj.initModule(path, contentDiv, stateMap.autosave_statemap);
          showModule(path, navText);
        } else {
          moduleObj.initModule(path, contentDiv);
          showModule(path, navText);
        }
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
        url: getVersionForFile(fileName, 'properties'),
        type: 'GET',
        contentType: 'utf-8',
        dataType: 'json',
        async: false,
        success: function (retObj) {
          evaluteModuleConfig(retObj, configMap.parameter_map);
        },
        error: function (xhr, status, errorThrown) {
          handleWSError('loadModuleConfig', xhr, status, errorThrown, 'e');
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
        $.getScript(getVersionForFile(fileName, 'js') + '#')
        .done(function (script, textStatus) {})
        .fail(function (jqxhr, settings, exception) {
          ema.shell.handleCustomError('loadModuleScript', exception, 'e');
        });
      } else {
        sjl.load([getVersionForFile(fileName, 'js') + '#'], function () {});
      }
    } catch (e) {
      handleError('loadModuleScript', e, 'e');
    }
  };
  // End INTERNAL method /loadModuleScript/
  // Begin INTERNAL method /loadModuleLanguage/
  loadModuleLanguage = function (fileName, language) {
    try {
      $.ajax({
        url: getVersionForFile(fileName + '/' + language, 'json'),
        type: 'GET',
        contentType: 'utf-8',
        dataType: 'json',
        async: true,
        success: function (retObj) {
          stateMap.languageFileStatus[fileName + '_' + language] = 'ok';
          evaluteModuleConfig(retObj, stateMap.languageFiles[language]);
          checkModuleLanguageStatus();
        },
        error: function (xhr, status, errorThrown) {
          stateMap.languageFileStatus[fileName + '_' + language] = 'nok';
          checkModuleLanguageStatus();
          handleWSError('loadModuleLanguage', xhr, status, errorThrown, 'e');
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
            if (entry === stateMap.selected_language) {
              stateMap.languageJson = stateMap.languageFiles[entry];
            }
          }
        }
      }
    } catch (e) {
      handleError('checkModuleLanguageStatus', e, 'e');
    }
  };
  // End INTERNAL method /checkModuleLanguageStatus/
  // Begin INTERNAL method /checkBrowser/
  checkBrowser = function () {
    try {
      var 
      navStr,
      regExp1,
      regExp2;
      
      navStr = navigator.userAgent || navigator.vendor || window.opera;
      regExp1 = new RegExp(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i);
      regExp2 = new RegExp(/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i);
      
      if (regExp1.test(navStr) || regExp2.test(navStr.substr(0, 4))) {
        stateMap.mobileBrowser = true;
      }
    } catch (e) {
      handleError('checkBrowser', e, 'e');
    }
  };
  // End INTERNAL method /checkBrowser/
  // Begin INTERNAL method /generateContentDiv/
  generateContentDiv = function (path, navText) {
    try {
      var neuesDiv, pathSplit;
      //generate a contentdiv for the module
      stateMap.contentIdMax += 1;
      stateMap.contentIdList[path] = 'contentDiv' + stateMap.contentIdMax;
      stateMap.loadedJSFiles[path] = path;
      neuesDiv = $('<div class="w100p contentDiv" id="contentDiv' + stateMap.contentIdMax + '\"></div>');
      neuesDiv.appendTo('#' + configMap.contentContainer);
      //execute modules init function
      pathSplit = path.split('/');
      callModuleInitFunction(pathSplit[pathSplit.length - 1], path, 'contentDiv' + stateMap.contentIdMax, navText);
    } catch (e) {
      handleError('generateContentDiv', e, 'e');
    }
  };
  // End INTERNAL method /generateContentDiv/
  // Begin INTERNAL method /readAutosaveCanvas/
  readAutosaveCanvas = function (container) {
    try {
      var
      jCanvasList,
      canvasList,
      canvasItem,
      i;
      
      canvasList = [];
      jCanvasList = $('#' + container).find('canvas');
      
      for (i = 0; i < jCanvasList.length; i += 1) {
        canvasItem = {};
        canvasItem.id = jCanvasList[i].id;
        canvasItem.data = jCanvasList[i].toDataURL("image/png");
        
        canvasList.push(canvasItem);
      }
      
      return JSON.stringify(canvasList);
    } catch (e) {
      handleError('readAutosaveCanvas', e, 'e');
    }
  };
  // End INTERNAL method /readAutosaveCanvas/
  // Begin INTERNAL method /writeAutosaveCanvas/
  writeAutosaveCanvas = function (container) {
    try {
      var
      canvasList,
      i;
      
      canvasList = JSON.parse(stateMap.autosave_canvas);
      
      for (i = 0; i < canvasList.length; i += 1) {
        writeAutosaveCanvasSub(canvasList[i].id, canvasList[i].data);
      }
      
    } catch (e) {
      handleError('writeAutosaveCanvas', e, 'e');
    }
  };
  // End INTERNAL method /writeAutosaveCanvas/
  // Begin INTERNAL method /writeAutosaveCanvasSub/
  writeAutosaveCanvasSub = function (canvasId, canvasSource) {
    try {
      var tmpImage;
      
      tmpImage = new Image();
      tmpImage.src = canvasSource;
      tmpImage.onload = function () {
        $('#' + canvasId)[0].drawImage(tmpImage, 0, 0, 640, 480);
      };
    } catch (e) {
      handleError('writeAutosaveCanvasSub', e, 'e');
    }
  };
  // End INTERNAL method /writeAutosaveCanvasSub/
  // Begin INTERNAL method /readAutosaveInput/
  readAutosaveInput = function (container) {
    try {
      var
      jInputList,
      inputList,
      inputItem,
      i;
      
      inputList = [];
      jInputList = $('#' + container).find('input, textarea');
      
      for (i = 0; i < jInputList.length; i += 1) {
        inputItem = {};
        inputItem.id = jInputList[i].id;
        inputItem.data = $('#' + jInputList[i].id).val();
        
        inputList.push(inputItem);
      }
      
      return JSON.stringify(inputList);
    } catch (e) {
      handleError('readAutosaveInput', e, 'e');
    }
  };
  // End INTERNAL method /readAutosaveInput/
  // Begin INTERNAL method /writeAutosaveInput/
  writeAutosaveInput = function (container) {
    try {
      var
      inputList,
      i;
      
      inputList = JSON.parse(stateMap.autosave_input);
      
      for (i = 0; i < inputList.length; i += 1) {
        $('#' + inputList[i].id).val(inputList[i].data);
      }
      
    } catch (e) {
      handleError('writeAutosaveInput', e, 'e');
    }
  };
  // End INTERNAL method /writeAutosaveInput/
  // Begin INTERNAL method /readAutosaveCheckbox/
  readAutosaveCheckbox = function (container) {
    try {
      var
      jInputList,
      inputList,
      inputItem,
      i;
      
      inputList = [];
      jInputList = $('#' + container).find('input:checkbox');
      
      for (i = 0; i < jInputList.length; i += 1) {
        inputItem = {};
        inputItem.id = jInputList[i].id;
        inputItem.data = $('#' + jInputList[i].id)[0].checked;
        
        inputList.push(inputItem);
      }
      
      return JSON.stringify(inputList);
    } catch (e) {
      handleError('readAutosaveCheckbox', e, 'e');
    }
  };
  // End INTERNAL method /readAutosaveCheckbox/
  // Begin INTERNAL method /writeAutosaveCheckbox/
  writeAutosaveCheckbox = function (container) {
    try {
      var
      inputList,
      i;
      
      inputList = JSON.parse(stateMap.autosave_checkbox);
      
      for (i = 0; i < inputList.length; i += 1) {
        $('#' + inputList[i].id)[0].checked = inputList[i].data;
      }
      
    } catch (e) {
      handleError('writeAutosaveCheckbox', e, 'e');
    }
  };
  // End INTERNAL method /writeAutosaveCheckbox/
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
      loadVersions();
      loadConfig();
      if (configMap.versions.version !== configMap.parameter_map.CONFIG.VERSION) {
        document.location.reload(true);
      }
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
      
      checkBrowser();
      stateMap.isUserOnline = ema.model.loadFromLocalStorage('isUserOnline');
      if (stateMap.isUserOnline === '' || stateMap.isUserOnline === '1') {
        stateMap.isUserOnline = true;
      } else {
        stateMap.isUserOnline = false;
      }
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
      
      stateMap.autosaveLoadSave = true;
      
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
          //changeHash(sourcePath, navText);
          //set up database
          ema.datamanager.initDatabase(sourcePath, navText);
        } else {
          //changeHash(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu', 'Home');
          //set up database
          ema.datamanager.initDatabase(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu', 'Home');
        }
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
      ema.model.setAutosaveNextSave();
      //reset Footer
      $('#footerbutton').html('&nbsp;');
      if (stateMap.contentIdList[sourcePath] === undefined) {
        if (stateMap.loadedJSFiles[sourcePath] !== undefined) {
          generateContentDiv(sourcePath, navText);
        } else {
          //JS File nachladen
          importModuleJSFile(sourcePath, navText);
        }
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
      if (stateMap.autosaveLoadSave === true && stateMap.isUserLoggedOn === true) {
        showDialog('ema_load_autosave_confirm');
      } else if (callConfirmLayer === true) {
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
      var 
      i,
      cookies,
      cookie,
      eqPos,
      name;
      
      ema.model.terminateTimerTask();
      ema.model.saveToLocalStorage('curr_username', '--logged-out--');
      ema.model.saveToLocalStorage('curr_password', '');
      ema.model.saveToLocalStorage('curr_username_abbr', '');
      ema.model.saveToLocalStorage('LogoutTime', '0');
      ema.model.saveToLocalStorage('AutosaveNextSave', '0');
      stateMap.isUserLoggedOn = false;
      ema.datamanager.startSynchronisation('up');
      $('#password').val('');
      document.location.href = ema.model.getUri(document.location.href);

      cookies = document.cookie.split(";");

      for (i = 0; i < cookies.length; i += 1) {
        cookie = cookies[i];
        eqPos = cookie.indexOf("=");
        name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
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
        ema.model.saveToLocalStorage('isUserOnline', 0);
      } else {
        stateMap.isUserOnline = true;
        ema.model.saveToLocalStorage('isUserOnline', 1);
        //user want to switch to online - if there is no connection the apps stays offline
        if (stateMap.isAppOnline === false) {
          handleCustomError('toggleOnline', 'errtoggleonline', 'i');
        }
      }
      loadDashboard();
      ema.model.loadLanguagePattern(stateMap.selected_language, false);
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
  // Begin PUBLIC method /getConfigMapExternalHelpValue/
  getConfigMapExternalHelpValue = function (paramName) {
    try {
      return configMap.parameter_map.EXTERNALHELP[paramName];
    } catch (e) {
      handleError('getConfigMapExternalHelpValue', e, 'e');
    }
  };
  // End PUBLIC method /getConfigMapExternalHelpValue/
  // Begin PUBLIC method /resetContentDivs/
  resetContentDivs = function () {
    try {
      var entry;
      
      for (entry in stateMap.contentIdList) {
        if (stateMap.contentIdList.hasOwnProperty(entry)) {
          if (entry.indexOf("ema.login") === -1 && entry.indexOf("ema.sync") === -1 && entry.indexOf("ema.menu") === -1 && entry.indexOf("ema.setup") === -1) {
            $('#' + stateMap.contentIdList[entry]).remove();
            delete stateMap.contentIdList[entry];
          }
        }
      }
    } catch (e) {
      handleError('resetContentDivs', e, 'e');
    }
  };
  // End PUBLIC method /resetContentDivs/
  // Begin PUBLIC method /processAutosave/
  processAutosave = function (forceSave) {
    try {
      var 
      dataList,
      autosaveNextSave,
      aktTime;
      
      autosaveNextSave = ema.model.loadFromLocalStorage("AutosaveNextSave");
      aktTime = new Date();

      if ((autosaveNextSave - aktTime.getTime() <= 0) || forceSave === true) {
        dataList = [];
        if (stateMap.autosave_path !== undefined && stateMap.autosave_path !== '' && stateMap.autosaveLoadSave !== true) {
          dataList.push({ key: 'autosave_navtext', data: stateMap.autosave_navtext });
          dataList.push({ key: 'autosave_path', data: stateMap.autosave_path });
          dataList.push({ key: 'autosave_html', data: $('#' + stateMap.autosaveContainer).html() });
          dataList.push({ key: 'autosave_canvas', data: readAutosaveCanvas(stateMap.autosaveContainer) });
          dataList.push({ key: 'autosave_input', data: readAutosaveInput(stateMap.autosaveContainer) });
          dataList.push({ key: 'autosave_checkbox', data: readAutosaveCheckbox(stateMap.autosaveContainer) });
          dataList.push({ key: 'autosave_statemap', data: JSON.stringify(stateMap.autosave_statemap) });
  
          ema.datamanager.writeAutosaveDataToDatabase(dataList);
          stateMap.autosaveLastSave = new Date();
          ema.model.setAutosaveNextSave();
        }
      }
    } catch (e) {
      handleError('processAutosave', e, 'e');
    }
  };
  // End PUBLIC method /processAutosave/
  // Begin PUBLIC method /registerAutosave/
  registerAutosave = function (navText, path, container, formStateMap) {
    try {
      stateMap.autosave_navtext = navText;
      stateMap.autosave_path = path;
      stateMap.autosaveContainer = container;
      stateMap.autosave_statemap = formStateMap;
    } catch (e) {
      handleError('registerAutosave', e, 'e');
    }
  };
  // End PUBLIC method /registerAutosave/
  // Begin PUBLIC method /removeAutosave/
  removeAutosave = function (callNextPage) {
    try {
      stateMap.autosave_navtext = undefined;
      stateMap.autosave_path = undefined;
      stateMap.autosave_html = undefined;
      stateMap.autosave_canvas = undefined;
      stateMap.autosave_input = undefined;
      stateMap.autosave_checkbox = undefined;
      stateMap.autosave_statemap = undefined;
      stateMap.autosaveLoadSave = false;
      
      ema.datamanager.deleteEntryFromObjectStore('AUTOSAVESTORE', 'autosave_navtext');
      ema.datamanager.deleteEntryFromObjectStore('AUTOSAVESTORE', 'autosave_path');
      ema.datamanager.deleteEntryFromObjectStore('AUTOSAVESTORE', 'autosave_html');
      ema.datamanager.deleteEntryFromObjectStore('AUTOSAVESTORE', 'autosave_canvas');
      ema.datamanager.deleteEntryFromObjectStore('AUTOSAVESTORE', 'autosave_input');
      ema.datamanager.deleteEntryFromObjectStore('AUTOSAVESTORE', 'autosave_checkbox');
      ema.datamanager.deleteEntryFromObjectStore('AUTOSAVESTORE', 'autosave_statemap');
      
      if (callNextPage) {
        //hide confirm layer
        showDialog('ema_load_autosave_confirm');
        window.setTimeout(ema.shell.changeHash(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu', 'Home'), 0);
      }
    } catch (e) {
      handleError('removeAutosave', e, 'e');
    }
  };
  // End PUBLIC method /removeAutosave/
  // Begin PUBLIC method /checkAutosave/
  checkAutosave = function (sourcePath, navText) {
    try {
      var autosaveKeys;
      
      if (stateMap.autosaveLoadSave === true) {
        autosaveKeys = {};
        autosaveKeys.autosave_navtext = 'autosave_navtext';
        autosaveKeys.autosave_path = 'autosave_path';
        autosaveKeys.autosave_html = 'autosave_html';
        autosaveKeys.autosave_canvas = 'autosave_canvas';
        autosaveKeys.autosave_input = 'autosave_input';
        autosaveKeys.autosave_checkbox = 'autosave_checkbox';
        autosaveKeys.autosave_statemap = 'autosave_statemap';
        ema.datamanager.readOfflineData('AUTOSAVESTORE', autosaveKeys, ema.shell.checkAutosaveSub, true);
      } else {
        ema.shell.changeHash(sourcePath, navText);
      }
    } catch (e) {
      handleError('checkAutosave', e, 'e');
    }
  };
  // End PUBLIC method /checkAutosave/
  // Begin PUBLIC method /checkAutosaveSub/
  checkAutosaveSub = function (reqData) {
    try {
      var i;
      
      if (reqData.length === 0) {
        //load menu
        stateMap.autosaveLoadSave = false;
        changeHash(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu', 'Home');
      } else {
        for (i = 0; i < reqData.length; i += 1) {
          if (reqData[i].key !== undefined) {
            if (reqData[i].key === 'autosave_statemap') {
              stateMap[reqData[i].key] = JSON.parse(reqData[i].data);
            } else {
              stateMap[reqData[i].key] = reqData[i].data;
            }
          }
        }
        stateMap.autosaveLoadSave = true;
        changeHash(stateMap.autosave_path, stateMap.autosave_navtext);
      }
    } catch (e) {
      handleError('checkAutosaveSub', e, 'e');
    }
  };
  // End PUBLIC method /checkAutosaveSub/
  // Begin PUBLIC method /getVersionForFile/
  getVersionForFile = function (fileName, fileType) {
    try {
      var 
      retFileName,
      entry;
      
      retFileName = '';
      //1. check if there is a versionnumber for this specific file
      if (configMap.versions.hasOwnProperty(fileType) && configMap.versions[fileType].hasOwnProperty(fileName)) {
        if (configMap.versions[fileType][fileName] !== '') {
          retFileName = fileName + '_' + configMap.versions[fileType][fileName] + '.' + fileType;
        }
      } else {
        //2. check if there is a verionsnumber for the module
        for (entry in configMap.versions.modules) {
          if (configMap.versions.modules.hasOwnProperty(entry)) {
            if (fileName.indexOf('/' + entry + '/') > -1) {
              retFileName = fileName + '_' + configMap.versions.modules[entry] + '.' + fileType;
            }
          }
        }
      }
      
      if (retFileName === '') {
        retFileName = fileName + '.' + fileType;
      }
      
      return retFileName;
    } catch (e) {
      handleError('getVersionForFile', e, 'e');
    }
  };
  // End PUBLIC method /getVersionForFile/
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
    confirmLogout : confirmLogout,
    getConfigMapExternalHelpValue : getConfigMapExternalHelpValue,
    resetContentDivs : resetContentDivs,
    processAutosave : processAutosave,
    registerAutosave : registerAutosave,
    removeAutosave : removeAutosave,
    checkAutosave : checkAutosave,
    checkAutosaveSub : checkAutosaveSub,
    getVersionForFile : getVersionForFile
  };
  //------------------- END PUBLIC METHODS ---------------------
}());

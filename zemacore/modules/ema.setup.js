/*
 * ema.setup.js
 * setup module for EMA
 */
ema.setup = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  stateMap = {
      container  : undefined
    },

  //internal functions
  generateHtml,
  
  //public functions
  initModule, onModuleLoad, saveSetup,
  switchLanguage;
  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/
  // Begin INTERNAL method /generateHtml/
  generateHtml = function () {
    try {
      var
      htmlStr = '',
      headerLabel,
      footerLabel;
        
      headerLabel = {};
      headerLabel.X = '';

      footerLabel = {};
      footerLabel.X = '';
      
      htmlStr += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
      //Start Formcontainer
      htmlStr += '<div class="mhcontent">';
      
      htmlStr += ema.formgenerator.generateHeader('', 'lblsetup', '', '', '', '');
      if (ema.model.loadFromLocalStorage('setupValueShowHeader') === 'false') {
        htmlStr += ema.formgenerator.generateCheckboxRow('ema_setup_showHeader', '', headerLabel, '', false, '', 'lblshowHeader', '', '', false);
      } else {
        htmlStr += ema.formgenerator.generateCheckboxRow('ema_setup_showHeader', 'X', headerLabel, '', false, '', 'lblshowHeader', '', '', false);
      }
      if (ema.model.loadFromLocalStorage('setupValueShowFooter') === 'false') {
        htmlStr += ema.formgenerator.generateCheckboxRow('ema_setup_showFooter', '', footerLabel, '', false, '', 'lblshowFooter', '', '', false);
      } else {
        htmlStr += ema.formgenerator.generateCheckboxRow('ema_setup_showFooter', 'X', footerLabel, '', false, '', 'lblshowFooter', '', '', false);
      }
      
      htmlStr += ema.formgenerator.generateSelectRow('ema_setup_language', ema.shell.getStateMapValue('selected_language'), ema.shell.getLanguagesOptions(), 'onchange="ema.setup.switchLanguage(this);"', false, '', 'lbllanguage', '', '', false);
      
      $('#' + stateMap.container).html(htmlStr);
      
    } catch (e) {
      ema.shell.handleError('ema.setup.generateHtml', e, 'e');
    }
  };
  // End INTERNAL method /generateHtml/
  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
  // Begin Public method /initModule/
  initModule = function (path, container) {
    try {
      // load HTML and map jQuery collections
      stateMap.container = container;
      ema.shell.addOnloadFunction(path, ema.setup.onModuleLoad);
      ema.shell.activateLoadingAnimation(path, container);
    } catch (e) {
      ema.shell.handleError('ema.setup.initModule', e, 'e');
    }
  };
  // End PUBLIC method /initModule/
  // Begin Public method /onModuleLoad/
  onModuleLoad = function (container) {
    try {
      generateHtml();
      ema.formgenerator.generateFooter(false, false, '', true, 'lblsave', 'ema.setup.saveSetup();');
      ema.model.loadLanguagePattern(ema.shell.getStateMapValue('selected_language'), false);
    } catch (e) {
      ema.shell.handleError('ema.setup.onModuleLoad', e, 'e');
    }
  };
  // End PUBLIC method /onModuleLoad/
  // Begin Public method /saveSetup/
  saveSetup = function (container) {
    try {
      ema.model.saveToLocalStorage('setupValueShowHeader', document.getElementsByName('ema_setup_showHeader')[0].checked);
      ema.model.saveToLocalStorage('setupValueShowFooter', document.getElementsByName('ema_setup_showFooter')[0].checked);
      ema.shell.checkStyleForHeaderAndFooter();
      ema.shell.changeHash(ema.shell.getConfigMapConfigValue('COREPATH') + 'modules/ema.menu', 'Home');
    } catch (e) {
      ema.shell.handleError('ema.setup.saveSetup', e, 'e');
    }
  };
  // End PUBLIC method /saveSetup/
  // Begin Public method /switchLanguage/
  switchLanguage = function (elem) {
    try {
      var language = (elem[elem.selectedIndex].value).toLowerCase();
      
      ema.shell.resetContentDivs();
      ema.shell.setSelectedLanguage(language);
      ema.model.saveToLocalStorage('sel_language', language);
      ema.shell.resetLanguage();
      ema.model.loadLanguagePattern(language, true);
      ema.shell.loadKeyValues();
    } catch (e) {
      ema.shell.handleError('switchLanguage', e, 'e');
    } 
  };
  // End Public method /switchLanguage/
  
  return { 
    initModule : initModule,
    onModuleLoad : onModuleLoad,
    saveSetup : saveSetup,
    switchLanguage : switchLanguage
  };
  //------------------- END PUBLIC METHODS ---------------------
}());

/*
 * ema.menu.js
 * menu module for EMA
 */
/*global unescape*/
ema.menu = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  stateMap = {
      container  : undefined
    },

  //internal functions
  buildMenu, buildMenuEntry,

  //public functions
  initModule, generateMenu;

  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/
  // Begin INTERNAL method /buildMenu/
  /*
   * generates the menu and all submenus for the app
   * one div for the main menu is required, the divs for the submenus are created by the function
   */
  buildMenu = function (json) {
    try {
      var
      i, 
      buttonNoPerDiv,
      seq, 
      seqParent, 
      title, 
      transaction, 
      uri, 
      linkType, 
      icon;

      buttonNoPerDiv = [];                 //actual number of buttons per menupage - by default there are 3 buttons per row (or less on smaller screens)
      i = 0;

      $('#' + stateMap.container).html('<meta http-equiv="Content-Type" content="text/html; charset=utf-8">');

      for (i = 0; i < json[1][3].length; i += 1) {
        seq = json[1][3][i][0];
        seqParent = json[1][3][i][1]; 
        title = json[1][3][i][2];
        transaction = json[1][3][i][3];
        uri = json[1][3][i][4];
        linkType = json[1][3][i][5];
        icon = json[1][3][i][6];

        buildMenuEntry(seq, seqParent, title, transaction, uri, linkType, icon, buttonNoPerDiv);
      }

      ema.shell.setMenuGenerated(true);
    } catch (e) {
      ema.shell.handleError('buildMenu', e, 'e');
    }
  };
  //End INTERNAL method /buildMenu/
  //Begin INTERNAL method /buildMenuEntry/
  /*
   * created one buttons for the menu
   */
  buildMenuEntry = function (seq, seqParent, title, transaction, uri, linkType, icon, buttonNoPerDiv) {
    try {
      var 
      divName = '',
      htmlString = '',
      newDiv;

      if (seq === undefined || seqParent === undefined || title === undefined || transaction === undefined || uri === undefined) {
        ema.shell.handleCustomError('buildMenuEntry', 'errbuildmenuentry', 'e');
      } else {
        //button is only generated if there is a parent sequence number > 0
        if (seqParent > 0) {
          //every button is appended to a div 'menuDiv' + seqParent  - this div will be created here if needed
          if (seqParent === 1) {  //the main menu always uses the div of modules/menu
            divName = stateMap.container;
          } else if (document.getElementById('menuDiv' + seqParent) === null) {
            newDiv = $('<div class="w100p contentDiv" id="menuDiv' + seqParent + '"></div>');
            newDiv.appendTo('#' + ema.shell.getContentContainer());
            divName = 'menuDiv' + seqParent;
            ema.shell.addContentDiv(divName, 'menuDiv' + seqParent);
            $('#' + divName).hide();
          }
          if (divName === '') {
            divName = 'menuDiv' + seqParent;
          }
          if (buttonNoPerDiv[divName] === undefined) {
            buttonNoPerDiv[divName] = 1;
          }
          //div was created - button can be appended now
          if (linkType === 'url') {
            htmlString += '<div class="mbcontainer"><button class="button_menu" onclick="window.open(\'' + uri + '\', \'_new\')"><span class="span_menu">' + title;
          } else if (linkType === 'replaceurl') {
            htmlString += '<div class="mbcontainer"><button class="button_menu" onclick="window.open(\'' + uri + '\', \'_self\')"><span class="span_menu">' + title;
          } else if (linkType === 'embeddedurl') {
            htmlString += '<div class="mbcontainer"><button class="button_menu" onclick="ema.shell.loadEmbeddedUri(\'' + uri + '\', \'' + title + '\');"><span class="span_menu">' + title;
          } else {
            if (uri === '') {
              //if there is no uri the button loads a submenu
              htmlString += '<div class="mbcontainer"><button class="button_menu" onclick="ema.shell.changeHash(\'menuDiv' + seq + '\', \'' + title + '\')"><span class="span_menu">' + title;
            } else {
              htmlString += '<div class="mbcontainer"><button class="button_menu" onclick="ema.shell.changeHash(\'' + uri + '\', \'' + title + '\')"><span class="span_menu">' + title;
            }
          }
          //insert icon
          if (icon === undefined || icon === '') {
            htmlString += '<br/><i class=\"icon-paste menuiconstyle\"></i>';
          } else if (icon !== '') {
            htmlString += '<br/><i class=\"' + icon + ' menuiconstyle\"></i>';
          }
          htmlString += '</span>';
          htmlString += '<span class="info_menu" id="info_' + title + '">&nbsp;</span>';
          htmlString += '</button>';
          htmlString += '</div>';
          if (buttonNoPerDiv[divName] < 6) {
            htmlString += '<div class="mbspacer' + buttonNoPerDiv[divName] + '">&nbsp;</div>';
            buttonNoPerDiv[divName] = buttonNoPerDiv[divName] + 1;
          } else {
            htmlString += '<div class="mbspacer' + buttonNoPerDiv[divName] + '">&nbsp;</div>';
            buttonNoPerDiv[divName] = 1;
          }
          $('#' + divName).html($('#' + divName).html() + htmlString);
        }
      }
    } catch (e) {
      ema.shell.handleError('buildMenuEntry', e, 'e');
    }
  };
  //End INTERNAL method /buildMenuEntry/
  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
  // Begin Public method /initModule/
  initModule = function (path, container) {
    try {
      // load HTML and map jQuery collections
      stateMap.container = container;
      //menu is generated only once
      if (ema.shell.getStateMapValue('isMenuGenerated') === false) {
        //request menu-json from server
        if (ema.shell.getStateMapValue('isUserOnline') === true && ema.shell.getStateMapValue('isAppOnline') === true) {
          generateMenu();
        } else {
          //load menu-json from local storage
          buildMenu(eval('(' + decodeURI(ema.model.loadFromLocalStorage('menustring')) + ')'));
        }
      }
    } catch (e) {
      ema.shell.handleError('initModule', e, 'e');
    }
  };
  // End PUBLIC method /initModule/
  // Begin Public method /generateMenu/
  generateMenu = function () {
    try {
      var 
      requestUrl,
      request;
      
      request = {};
      request.IMPORT = {};
      request.IMPORT.I_MENU = ema.shell.getConfigMapConfigValue('I_MENU');
      request.IMPORT.I_FORCE_UPDATE = 'X';
      request.IMPORT.I_AUTH_CHECK = 'X';
      request.IMPORT.I_URLS = 'X';
      
      if (ema.shell.getConfigMapConfigValue('MENUISLOCAL') === 'true') {
        requestUrl = ema.shell.getVersionForFile('menues/' + ema.shell.getStateMapValue('selected_language'), 'json');
        $.ajax({
          url: requestUrl,
          contentType: 'application/json; charset=UTF-8',
          dataType: 'html',
          type: 'GET',
          data: request,
          success: function (retString) {
            //save menu json to local storage
            retString = eval('(' + decodeURI(retString) + ')');
            ema.model.saveToLocalStorage('menustring', JSON.stringify(retString));
            buildMenu(retString);
          },
          error: function (xhr, status, errorThrown) {
            ema.shell.handleWSError('generateMenu', xhr, status, errorThrown, 'e');
          }
        });
      } else {
        requestUrl = ema.model.generateRequestURL('MENU');
        $.ajax({
          url: requestUrl,
          contentType: 'application/json; charset=UTF-8',
          dataType: ema.shell.getConfigMapConfigValue('AJAX_DATATYPE'),
          type: ema.shell.getConfigMapConfigValue('AJAX_TYPE'),
          data: ema.model.generateRequestObj(request),
          beforeSend: function (xhr) {
            ema.model.generateAuthHeader(xhr);
          },
          success: function (retString) {
            //save menu json to local storage
            ema.model.saveToLocalStorage('menustring', JSON.stringify(retString));
            buildMenu(retString);
          },
          error: function (xhr, status, errorThrown) {
            ema.shell.handleWSError('generateMenu', xhr, status, errorThrown, 'e');
          }
        });
      }
    } catch (e) {
      ema.shell.handleError('generateMenu', e, 'e');
    }
  };
  // End PUBLIC method /generateMenu/

  return { 
    initModule : initModule,
    generateMenu : generateMenu
  };
  //------------------- END PUBLIC METHODS ---------------------
}());

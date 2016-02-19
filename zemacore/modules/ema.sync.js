/*
 * ema.sync.js
 * sync module for EMA
 */
ema.sync = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  stateMap = {
      container  : undefined
    },

  //internal functions
  generateHtml, generateInboundRow, generateOutboundRow,
  generateOutboundSubRow,
  
  //public functions
  initModule, onModuleLoad;
  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/
  // Begin INTERNAL method /generateHtml/
  generateHtml = function (data) {
    try {
      var
      i,
      task = null,
      inboundSyncTasks = '',
      outBoundSubRows = {},
      outBoundRowEntry,
      outboundOperations = '',
      htmlStr = '';
        
      htmlStr += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
      //Start Formcontainer
      htmlStr += '<div class="mhcontent">';
      //Outbound Synchronisation
      outboundOperations = ema.datamanager.getOutboundSyncOperations();
      for (i = 0; i < data.length; i += 1) {
        if (outBoundSubRows[data[i].operation] === undefined) {
          outBoundRowEntry = {};
          outBoundRowEntry.amount = 1;
          outBoundRowEntry.status = data[i].status;
          outBoundRowEntry.syncTime = data[i].syncTime;
          outBoundRowEntry.keylist = '\'' + data[i].key + '\'';
          outBoundRowEntry.html = generateOutboundSubRow(data[i].reqKey, data[i].status, data[i].statustext, data[i].syncTime, data[i].request, data[i].key);
          outBoundSubRows[data[i].operation] = outBoundRowEntry;
        } else {
          outBoundSubRows[data[i].operation].amount += 1;
          outBoundSubRows[data[i].operation].keylist += ', \'' + data[i].key + '\'';
          if (outBoundSubRows[data[i].operation].status < data[i].status) {
            outBoundSubRows[data[i].operation].status = data[i].status;
            outBoundSubRows[data[i].operation].syncTime = data[i].syncTime;
          }
          outBoundSubRows[data[i].operation].html += generateOutboundSubRow(data[i].reqKey, data[i].status, data[i].statustext, data[i].syncTime, data[i].request, data[i].key);
        }
      }
      
      htmlStr += '<div class="w100p"><div class="hlabel">&nbsp;</div><div class="hcontent b lblsend"></div><div class="herror">&nbsp;</div></div>';
      if (ema.shell.getOnlineStatus() === true) {
        htmlStr += '<div class="w100p"><div class="hlabel">&nbsp;</div><div class="hcontent link"><a onclick="ema.datamanager.startSynchronisation(\'up\');ema.shell.changeHash(ema.shell.getConfigMapConfigValue(\'COREPATH\') + \'modules/ema.sync\', undefined);"><span class="lblsyncoutbox"></span></a></div><div class="herror">&nbsp;</div></div>';
      } else {
        htmlStr += '<div class="w100p"><div class="hlabel">&nbsp;</div><div class="hcontent link"><span class="lblsyncoutbox"></span></div><div class="herror">&nbsp;</div></div>';
      }
      for (task in outboundOperations) {
        if (outboundOperations.hasOwnProperty(task)) {
          if (outBoundSubRows[task] !== undefined) {
            htmlStr += generateOutboundRow(task, outboundOperations[task], outBoundSubRows[task].status, outBoundSubRows[task].amount, outBoundSubRows[task].syncTime, outBoundSubRows[task].html, outBoundSubRows[task].keylist);
          } else {
            htmlStr += generateOutboundRow(task, outboundOperations[task], 1, 0, new Date(), '<div class="w15p"><div class="cell" >&nbsp;</div></div><div class="w85p dbl dbt"><div class="cell greybg green" >' + ema.shell.getLanguageTextString('errors', 'errnodataavailable') + '</div></div>', '');
          }
        }
      }
      
      //InboundSynchronisation
      htmlStr += '<div class="w100p h20"></div>';
      htmlStr += '<div  class="w100p"><div class="hlabel">&nbsp;</div><div class="hcontent b lblreceive"></div><div class="herror">&nbsp;</div></div>';
      if (ema.shell.getOnlineStatus() === true) {
        htmlStr += '<div  class="w100p"><div class="hlabel">&nbsp;</div><div class="hcontent link"><a onclick="ema.datamanager.startSynchronisation(\'down\');ema.shell.changeHash(ema.shell.getConfigMapConfigValue(\'COREPATH\') + \'modules/ema.sync\', undefined);"><span class="lblsyncinbox"></span></a></div><div class="herror">&nbsp;</div></div>';
      } else {
        htmlStr += '<div  class="w100p"><div class="hlabel">&nbsp;</div><div class="hcontent link"><span class="lblsyncinbox"></span></div><div class="herror">&nbsp;</div></div>';
      }
      htmlStr += '<div class="w100p h20"></div>';
      inboundSyncTasks = ema.datamanager.getInboundSyncTasks();
      for (task in inboundSyncTasks) {
        if (inboundSyncTasks.hasOwnProperty(task)) {
          htmlStr += generateInboundRow(task, inboundSyncTasks[task]);
        }
      }
      
      $('#' + stateMap.container).html(htmlStr);
      
      ema.formgenerator.generateFooter(false, false, '', false, '', '');
      ema.model.loadLanguagePattern(ema.shell.getStateMapValue('selected_language'), false);
    } catch (e) {
      ema.shell.handleError('ema.sync.generateHtml', e, 'e');
    }
  };
  // End INTERNAL method /generateHtml/
  // Begin INTERNAL method /generateInboundRow/
  generateInboundRow = function (taskName, task) {
    try {
      var htmlStr = '';
      
      htmlStr += '<div class="w100p sbb"><div class="w100p">';
      if (ema.shell.getOnlineStatus() === true) {
        htmlStr += '<div class="w15p dbr"><div class="cellheader" >&nbsp;</div><div class="cell link_small" ><a onclick="ema.datamanager.startSingleDownloadSync(\'' + taskName + '\');ema.shell.changeHash(ema.shell.getConfigMapConfigValue(\'COREPATH\') + \'modules/ema.sync\', undefined);"><span class="lblrefresh"></span></a></div></div>';
      } else {
        htmlStr += '<div class="w15p dbr"><div class="cellheader" >&nbsp;</div><div class="cell link_small" ><span class="lblrefresh"></span></div></div>';
      }
      htmlStr += '<div class="w30p dbr"><div class="cellheader lbltype" >&nbsp;</div><div class="cell" >' + task.description + '&nbsp;</div></div>';
      htmlStr += '<div class="w10p dbr"><div class="cellheader lblamount" >&nbsp;</div><div class="cell" >' + task.amount + '&nbsp;</div></div>';
      if (task.status === 1) {
        htmlStr += '<div class="w40p dbr"><div class="cellheader lbllastsync" >&nbsp;</div><div class="cell green" >' + ema.model.formatDateTimeForDisplay(task.syncTime) + '&nbsp;</div></div>';
      } else if (task.status === 2) {
        htmlStr += '<div class="w40p dbr"><div class="cellheader lbllastsync" >&nbsp;</div><div class="cell yellow" >' + ema.model.formatDateTimeForDisplay(task.syncTime) + '&nbsp;</div></div>';
      } else {
        htmlStr += '<div class="w40p dbr"><div class="cellheader lbllastsync" >&nbsp;</div><div class="cell red" >' + ema.model.formatDateTimeForDisplay(task.syncTime) + '&nbsp;</div></div>';
      }
      htmlStr += '<div class="w5p"><div class="cellheader">&nbsp;</div><div class="cell" ><button onclick="ema.shell.showHideSection(\'' + taskName + '\')" class="tbg"><i class="icon-angle-up" id="button' + taskName + '"></i></button></div></div>';
      
      htmlStr += '<div class="w100p" id="section' + taskName + '_hidden" style="display:none">';
      htmlStr += '<div class="w15p"><div class="cell" >&nbsp;</div></div>';
      if (task.status === 1) {
        htmlStr += '<div class="w85p dbl dbt"><div class="cell greybg green" >' + task.statustext + '&nbsp;</div></div>';
      } else if (task.status === 2) {
        htmlStr += '<div class="w85p dbl dbt"><div class="cell greybg yellow" >' + task.statustext + '&nbsp;</div></div>';
      } else {
        htmlStr += '<div class="w85p dbl dbt"><div class="cell greybg red" >' + task.statustext + '&nbsp;</div></div>';
      }
      htmlStr += '</div>';
      
      htmlStr += '</div></div>';
      
      
      return htmlStr;
    } catch (e) {
      ema.shell.handleError('ema.sync.generateInboundRow', e, 'e');
    }
  };
  // End INTERNAL method /generateInboundRow/
  // Begin INTERNAL method /generateOutboundRow/
  generateOutboundRow = function (taskName, description, status, amount, syncTime, subRows, keyList) {
    try {
      var
      htmlStr = '';
      

      htmlStr += '<div class="w100p sbb"><div class="w100p">';
      if (ema.shell.getOnlineStatus() === true) {
        htmlStr += '<div class="w15p dbr"><div class="cellheader" >&nbsp;</div><div class="cell link_small" ><a onclick="ema.datamanager.startUploadByKey([' + keyList + ']);ema.shell.changeHash(ema.shell.getConfigMapConfigValue(\'COREPATH\') + \'modules/ema.sync\', undefined);"><span class="lblsyncgroup"></span></a></div></div>';
      } else {
        htmlStr += '<div class="w15p dbr"><div class="cellheader" >&nbsp;</div><div class="cell link_small" ><span class="lblsyncgroup"></span></div></div>';
      }
      htmlStr += '<div class="w30p dbr"><div class="cellheader lbltype" >&nbsp;</div><div class="cell" >' + description + '&nbsp;</div></div>';
      htmlStr += '<div class="w10p dbr"><div class="cellheader lblamount" >&nbsp;</div><div class="cell" >' + amount + '&nbsp;</div></div>';
      if (status === 1) {
        htmlStr += '<div class="w40p dbr"><div class="cellheader lbllastsync" >&nbsp;</div><div class="cell green" >' + ema.model.formatDateTimeForDisplay(syncTime) + '&nbsp;</div></div>';
      } else if (status === 2) {
        htmlStr += '<div class="w40p dbr"><div class="cellheader lbllastsync" >&nbsp;</div><div class="cell yellow" >' + ema.model.formatDateTimeForDisplay(syncTime) + '&nbsp;</div></div>';
      } else {
        htmlStr += '<div class="w40p dbr"><div class="cellheader lbllastsync" >&nbsp;</div><div class="cell red" >' + ema.model.formatDateTimeForDisplay(syncTime) + '&nbsp;</div></div>';
      }
      htmlStr += '<div class="w5p"><div class="cellheader">&nbsp;</div><div class="cell" ><button onclick="ema.shell.showHideSection(\'' + taskName + '\')" class="tbg"><i class="icon-angle-up" id="button' + taskName + '"></i></button></div></div>';
      
      htmlStr += '<div class="w100p" id="section' + taskName + '_hidden" style="display:none">';
      //Hidden Rows html here
      htmlStr += subRows;
      
      htmlStr += '</div>';
      
      htmlStr += '</div></div>';
      
      return htmlStr;
    } catch (e) {
      ema.shell.handleError('ema.sync.generateOutboundRow', e, 'e');
    }
  };
  // End INTERNAL method /generateOutboundRow/
  // Begin INTERNAL method /generateOutboundSubRow/
  generateOutboundSubRow = function (description, status, statusText, syncTime, request, key) {
    try {
      var htmlStr = '';
      
      htmlStr += '<div class="w100p">';
      htmlStr += '<div class="w15p"><div class="cell" >&nbsp;</div></div>';
      htmlStr += '<div class="w30p dbr"><div class="cell greybg" >' + description + '&nbsp;</div></div>';
      if (status === 1) {
        htmlStr += '<div class="w20p dbr"><div class="cell green greybg" >' + ema.model.formatDateTimeForDisplay(syncTime) + '&nbsp;</div></div>';
      } else if (status === 2) {
        htmlStr += '<div class="w20p dbr"><div class="cell yellow greybg" >' + ema.model.formatDateTimeForDisplay(syncTime) + '&nbsp;</div></div>';
      } else {
        htmlStr += '<div class="w20p dbr"><div class="cell red greybg" >' + ema.model.formatDateTimeForDisplay(syncTime) + '&nbsp;</div></div>';
      }
      htmlStr += '<div class="w15p"><div class="cell greybg"><a onclick="ema.shell.showDialog(\'outboundsync' + key + '\')"><span class="lbldisplay"></span></a></div></div>';
      htmlStr += '<div class="w15p"><div class="cell greybg"><a onclick="ema.datamanager.deleteOutboundSyncTask([\'' + key + '\'])"><span class="lbldelete"></span></a></div></div>';
      htmlStr += '<div class="w30p"><div class="cell" >&nbsp;</div></div>';
      htmlStr += '<div class="w65p"><div class="cell greybg" >' + statusText + '&nbsp;</div></div>';
      htmlStr += ema.formgenerator.generateActionDialog('outboundsync' + key, JSON.stringify(request), 'JSON');
      htmlStr += '</div>';
      
      return htmlStr;
    } catch (e) {
      ema.shell.handleError('ema.sync.generateOutboundSubRow', e, 'e');
    }
  };
  // End INTERNAL method /generateOutboundSubRow/
  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
  // Begin Public method /initModule/
  initModule = function (path, container) {
    try {
      // load HTML and map jQuery collections
      stateMap.container = container;
      ema.shell.addOnloadFunction(path, ema.sync.onModuleLoad);
      ema.shell.activateLoadingAnimation(path, container);
    } catch (e) {
      ema.shell.handleError('ema.sync.initModule', e, 'e');
    }
  };
  // End PUBLIC method /initModule/
  // Begin Public method /onModuleLoad/
  onModuleLoad = function (container) {
    try {
      var 
      transaction, 
      objStore,
      cursor,
      reqData = [],
      deleteList = [];
      
      transaction = ema.datamanager.getEMADatabase().transaction([ema.datamanager.getStoreName('UPLOADSYNC')], "readonly");
      objStore = transaction.objectStore(ema.datamanager.getStoreName('UPLOADSYNC'));
      
      cursor = objStore.openCursor();
      cursor.onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {
          reqData[reqData.length] = cursor.value;
          if (cursor.value.entrystatus === 1) {
            deleteList[deleteList.length] = cursor.value.key;
          }
          cursor['continue']();
        } else {
          generateHtml(reqData);
          if (deleteList.length > 0) {
            ema.datamanager.deleteOutboundSyncTask(deleteList);
          }
        }
      };
    } catch (e) {
      ema.shell.handleError('ema.sync.onModuleLoad', e, 'e');
    }
  };
  // End PUBLIC method /onModuleLoad/
  
  return { 
    initModule : initModule,
    onModuleLoad : onModuleLoad
  };
  //------------------- END PUBLIC METHODS ---------------------
}());

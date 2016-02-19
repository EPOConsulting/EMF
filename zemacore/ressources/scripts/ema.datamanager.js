/*
 * ema.datamanager.js
 * datamanager module
 */
/*global unescape*/
ema.datamanager = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/  
  var
  stateMap = {
      requests: {},
      inboundSyncTasks : {},
      outboundSyncOperations : {},
      requiredObjectStores : [],
      requiredIndices : {},
      requestListMultiple : undefined
    },

  emaDatabase = null,

  //internal functions
  doRequestSuccess, extractKeyValue, extractDataLayer, 
  writeEntryToDatabase, writeMultipleEntriesToDatabase, 
  putNext, writeUploadData, openIndexedDb, 
  updateUploadEntry, updateSyncStatusSub, extractCallbackFunction, 
  errorMultipleRequests, checkRequestList, doMultipleRequestsSuccess,
  generateCallbackKey, deleteIndexedDb,
  
  //public functions
  doRequest, doMultipleRequests, requestRecordsByKey, 
  initDatabase, startSynchronisation, startSingleDownloadSync, 
  startUploadByKey, updateSyncStatus, getInboundSyncTasks, 
  getOutboundSyncOperations, getEMADatabase, readOfflineData, 
  deleteOutboundSyncTask, getStoreName, deleteEntryFromObjectStore,
  writeAutosaveDataToDatabase;

  /*
   * this library manages the data requests to server and to indexed db 
   */
  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/
  //Begin INTERNAL method /doRequestSuccess/
  doRequestSuccess = function (data, status, xhr) {
    try {
      var
      errText,
      errLvl,
      indexedDbConfig,         
      transaction,
      objStore,
      i, 
      j, 
      k,
      m,
      saveObj,
      saveObjList,
      requestObj, 
      requestData, 
      requestDate,
      errObj,
      dataObj,
      messageObj;

      requestDate = ema.model.generateCurrentDateTime(true);
      j = 0;

      //analyze data and check if it needs wo be saved to indexed db
      if ((data[1] !== undefined && data[1][1] === 'E') || (data.CALLSTATUS !== undefined && data.CALLSTATUS.TYPE === 'E')) {
        if (data[1] !== undefined) {
          errText = data[1][2] + ' - ' + data[1][3];
        } else {
          errText = data.CALLSTATUS.TYPE + ' - ' + data.CALLSTATUS.DESCRIPTION;
        }
        ema.shell.handleCustomError('doRequest', errText, 'e');
        ema.shell.hideLoadingAnimLayer();
        if (stateMap.requests[this.jsonpCallback].callbackFunction === 'ema.synchronisation') {
          stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].status = 3;
          stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].statustext = errText;
          stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].syncTime = new Date();
          updateSyncStatus();
        } else if (stateMap.requests[this.jsonpCallback].callbackFunction === 'ema.synchronisation.upload') {
          updateUploadEntry(this.jsonpCallback, 3, errText);
        } else if (stateMap.requests[this.jsonpCallback].callbackFunction !== undefined) {
          stateMap.requests[this.jsonpCallback].callbackFunction();
        }
      } else if (data.EXPORT === undefined && data[0] === undefined) {
        ema.shell.handleCustomError('doRequest', 'errdorequest', 'i');
        if (stateMap.requests[this.jsonpCallback].callbackFunction === 'ema.synchronisation') {
          stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].status = 3;
          stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].statustext = ema.shell.getLanguageTextString('errors', 'errdorequest');
          stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].syncTime = new Date();
          updateSyncStatus();
        } else if (stateMap.requests[this.jsonpCallback].callbackFunction === 'ema.synchronisation.upload') {
          updateUploadEntry(this.jsonpCallback, 3, ema.shell.getLanguageTextString('errors', 'errdorequest'));
        } else if (stateMap.requests[this.jsonpCallback].callbackFunction !== undefined) {
          stateMap.requests[this.jsonpCallback].callbackFunction();   
        } 
      } else {
        indexedDbConfig = ema.shell.getConfigMapIndexedDb();
        for (i = 0; i < indexedDbConfig.OBJECTSTTORES.length; i += 1) {
          if (indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME === stateMap.requests[this.jsonpCallback].operation) {
            if (indexedDbConfig.OBJECTSTTORES[i].OBJECTHIERARCHY !== undefined) {
              //extract data layer
              dataObj = extractDataLayer(indexedDbConfig.OBJECTSTTORES[i].OBJECTHIERARCHY, data);
              if (indexedDbConfig.OBJECTSTTORES[i].STORENAME !== '') {
                if (stateMap.requests[this.jsonpCallback].callbackFunction === 'ema.synchronisation' && stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].synctype === 'complete') {
                  transaction = emaDatabase.transaction([getStoreName(indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME)], 'readwrite');
                  objStore = transaction.objectStore(getStoreName(indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME));
                  objStore.clear();
                }
                
                requestData = [];
                saveObjList = [];
                m = 0;
                for (j = 0; j < dataObj.length; j += 1) {
                  if (dataObj[j] !== null) {
                    //extract key
                    saveObj = {};
                    saveObj.data = dataObj[j];
                    saveObj.key = extractKeyValue(indexedDbConfig.OBJECTSTTORES[i].KEYHIERARCHY, dataObj[j]);
                    saveObj.requestDate = requestDate;
                    if (indexedDbConfig.OBJECTSTTORES[i].INDICES !== undefined) {
                      for (k = 0; k < indexedDbConfig.OBJECTSTTORES[i].INDICES.length; k += 1) {
                        saveObj['index' + k] = extractKeyValue(indexedDbConfig.OBJECTSTTORES[i].INDICES[k], dataObj[j]);
                      }
                    }
                    m += 1;
                    if (m > 10000) {
                      //there is only one save for every 10000 entries
                      m = 0;
                      writeMultipleEntriesToDatabase(indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME, saveObjList);
                      saveObjList = [];
                    }
                    saveObjList[saveObjList.length] = saveObj;
                    requestData[requestData.length] = saveObj.key;
                  }
                }
                writeMultipleEntriesToDatabase(indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME, saveObjList, stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation]);
                requestObj = {};
                requestObj.key = stateMap.requests[this.jsonpCallback].requestString;
                requestObj.dataStore = indexedDbConfig.OBJECTSTTORES[i].STORENAME;
                requestObj.requestDate = requestDate;
                requestObj.data = requestData;
                writeEntryToDatabase('REQUESTSTORE', requestObj);
              }
            }
            //extract messages
            messageObj = extractDataLayer(indexedDbConfig.OBJECTSTTORES[i].MESSAGEHIERARCHY, data);
          }
        }
        if (dataObj === undefined) {
          dataObj = data;
        }
        if (stateMap.requests[this.jsonpCallback].callbackFunction === 'ema.synchronisation') {
          stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].status = 1;
          stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].statustext = ema.shell.getLanguageTextString('messages', 'syncok');
          stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].amount = j;
          stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].syncTime = new Date();
          if (stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].callback !== undefined) {
            stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].callback(dataObj, messageObj);
          }
        } else if (stateMap.requests[this.jsonpCallback].callbackFunction === 'ema.synchronisation.upload') {
          deleteOutboundSyncTask([this.jsonpCallback]);
          updateSyncStatus();
        } else if (stateMap.requests[this.jsonpCallback].callbackFunction !== undefined) {
          if (dataObj === undefined || dataObj[0] === null) {
            stateMap.requests[this.jsonpCallback].callbackFunction(undefined, messageObj);
          } else {
            stateMap.requests[this.jsonpCallback].callbackFunction(dataObj, messageObj);
          }
        }
      }
      delete stateMap.requests[this.jsonpCallback];
    } catch (e) {
      ema.shell.handleError('doRequestSuccess', e, 'e');
    }
  };
  //End INTERNAL method /doRequestSuccess/
  //Begin INTERNAL method /extractKeyValue/
  extractKeyValue = function (hierarchy, data) {
    try {
      var i, j, keyPairs, tmpData;
      for (i = 0; i < hierarchy.length; i += 1) {
        if ((hierarchy[i] + '').indexOf('+') !== -1) {
          keyPairs = hierarchy[i].split('+');
          tmpData = '';
          for (j = 0; j < keyPairs.length; j += 1) {
            tmpData += data[keyPairs[j]];
          }
          data = tmpData;
        } else {
          data = data[hierarchy[i]];
        }
      }
      if (typeof data === 'string') {
        return data.toLowerCase();
      } else {
        return data;
      }
    } catch (e) {
      ema.shell.handleError('extractKeyValue', e, 'e');
    }
  };
  //End INTERNAL method /extractKeyValue/
  //Begin INTERNAL method /extractDataLayer/
  extractDataLayer = function (hierarchy, data) {
    try {
      var i;
      if (hierarchy === undefined) {
        return undefined;
      } else {
        for (i = 0; i < hierarchy.length; i += 1) {
          data = data[hierarchy[i]];
        }
        return data;
      }
    } catch (e) {
      ema.shell.handleError('extractDataLayer', e, 'e');
    }
  };
  //End INTERNAL method /extractDataLayer/
  //Begin INTERNAL method /writeEntryToDatabase/
  writeEntryToDatabase = function (objStore, dataObj) {
    try {
      var
      transaction,
      store,
      request;
      if (emaDatabase !== null) {
        transaction = emaDatabase.transaction([getStoreName(objStore)], 'readwrite');
        store = transaction.objectStore(getStoreName(objStore));
        request = store.put(dataObj, dataObj.key);
        request.onerror = function (e) {
          ema.shell.handleCustomError('writeEntryToDatabase', 'errwriteentrytodatabase', 'w');
        };
      }
    } catch (e) {
      ema.shell.handleError('writeEntryToDatabase', e, 'e');
    }
  };
  //End INTERNAL method /writeEntryToDatabase/
  //Begin INTERNAL method /writeMultipleEntriesToDatabase/
  writeMultipleEntriesToDatabase = function (objStore, dataObjs, syncTask) {
    try {
      var
      transaction,
      store,
      i;
      
      if (emaDatabase !== null) {
        transaction = emaDatabase.transaction([getStoreName(objStore)], 'readwrite');
        store = transaction.objectStore(getStoreName(objStore));
        i = 0;
        putNext(store, dataObjs, i, syncTask);
      }
    } catch (e) {
      ema.shell.handleError('writeMultipleEntriesToDatabase', e + ' - ' + objStore, 'e');
    }
  };
  //End INTERNAL method /writeMultipleEntriesToDatabase/
  //Begin INTERNAL method /putNext/
  putNext = function (store, dataObjs, i, syncTask) {
    if (i < dataObjs.length) {
      store.put(dataObjs[i], dataObjs[i].key).onsuccess = putNext(store, dataObjs, i + 1, syncTask);
    } else {   // complete
      //console.log('populate complete');
      if (syncTask !== undefined) {
        syncTask.syncTime = new Date();
        updateSyncStatus();
      }
    }
  };
  //End INTERNAL method /putNext/
  //Begin INTERNAL method /writeUploadData/
  writeUploadData = function (uploadTasks) {
    try {
      var
      i;
      
      //read pending requests an try to send them
      for (i = 0; i < uploadTasks.length; i += 1) {
        doRequest(uploadTasks[i].operation, uploadTasks[i].request, 'ema.synchronisation.upload', uploadTasks[i].reqKey);
      }
    } catch (e) {
      ema.shell.handleError('writeUploadData', e, 'e');
    }
  };
  //End INTERNAL method /writeUploadData/
  //Begin INTERNAL method /openIndexedDb/
  openIndexedDb = function (dbName, dbVersion, sourcePath, navText) {
    try {
      var
      databaseRequest,
      indexedDB;

      window.shimIndexedDB.__useShim();
      indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
      if (dbVersion !== undefined) {
        databaseRequest = indexedDB.open(dbName, dbVersion);
      } else  {
        databaseRequest = indexedDB.open(dbName);
      }
      databaseRequest.onupgradeneeded = function (e) {
        var
        i,
        j,
        objStore;

        //emaDatabase = e.target.result;
        emaDatabase = databaseRequest.result;
        for (i = 0; i < stateMap.requiredObjectStores.length; i += 1) {
          if (!emaDatabase.objectStoreNames.contains(stateMap.requiredObjectStores[i]) && stateMap.requiredObjectStores[i] !== '') {
            objStore = emaDatabase.createObjectStore(stateMap.requiredObjectStores[i]);
            if (stateMap.requiredIndices[stateMap.requiredObjectStores[i]] !== undefined) {
              for (j = 0; j < stateMap.requiredIndices[stateMap.requiredObjectStores[i]].length; j += 1) {
                objStore.createIndex(stateMap.requiredIndices[stateMap.requiredObjectStores[i]][j], stateMap.requiredIndices[stateMap.requiredObjectStores[i]][j]);
              }
            }
          }
        }
      };        
      databaseRequest.onsuccess = function (e) {
        var
        i,
        changeVersion,
        newVersion,
        objStore;
        
        //emaDatabase = e.target.result;
        emaDatabase = databaseRequest.result;
        changeVersion = false;
        for (i = 0; i < stateMap.requiredObjectStores.length; i += 1) {
          if (!emaDatabase.objectStoreNames.contains(stateMap.requiredObjectStores[i]) && stateMap.requiredObjectStores[i] !== '') {
            changeVersion = true;
          }
        }
        if (changeVersion === true) {
          newVersion = emaDatabase.version + 1;
          emaDatabase.close();
          setTimeout(function () {
            openIndexedDb(dbName, newVersion, sourcePath, navText);
          }, 1000);
        } else {
          startSynchronisation('both');
          ema.shell.loadKeyValues();
          //ema.shell.changeHash(sourcePath, navText);
          ema.shell.checkAutosave(sourcePath, navText);
        }
      };        
      databaseRequest.onerror = function (e) {
        /*
        var entry;
        emaDatabase = null;

        ema.shell.handleCustomError('openIndexedDb', 'errinitdatabase', 'e');
        */
        deleteIndexedDb(indexedDB, dbName, sourcePath, navText);
      };
      databaseRequest.onabort = function (e) {
        e.preventDefault();
      };
    } catch (e) {
      ema.shell.handleError('openIndexedDb', e, 'e');
    }
  };
  //End INTERNAL method /openIndexedDb/
  //Begin INTERNAL method /updateUploadEntry/
  updateUploadEntry = function (key, status, statustext) {
    try {
      var 
      transaction,
      objStore,
      obj;
      
      transaction = emaDatabase.transaction([getStoreName('UPLOADSYNC')], "readonly");
      objStore = transaction.objectStore(getStoreName('UPLOADSYNC'));
      obj = objStore.get(key);
      
      obj.onsuccess = function (e) {
        var entry;
        
        entry = e.target.result;
        entry.status = status;
        entry.statustext = statustext;
        writeEntryToDatabase('UPLOADSYNC', entry);
        updateSyncStatus();
      };
    } catch (e) {
      ema.shell.handleError('updateUploadEntry', e, 'e');
    }
  };
  //End INTERNAL method /updateUploadEntry/
  //Begin INTERNAL method /updateSyncStatusSub/
  updateSyncStatusSub = function (reqData) {
    try {
      var
      syncTask,
      currStatus,
      syncTime,
      i;
      
      currStatus = 1;
      syncTask = null;
      syncTime = 0;
      
      for (i = 0; i < reqData.length; i += 1) {
        if (reqData[i].status > currStatus) {
          currStatus = reqData[i].status;
        }
        if (reqData[i].syncTime !== undefined && reqData[i].syncTime !== '---') {
          if (syncTime < reqData[i].syncTime) {
            syncTime = reqData[i].syncTime;
          }
        }
      }
            
      for (syncTask in stateMap.inboundSyncTasks) {
        if (stateMap.inboundSyncTasks.hasOwnProperty(syncTask)) {
          if (stateMap.inboundSyncTasks[syncTask].status > currStatus) {
            currStatus = stateMap.inboundSyncTasks[syncTask].status;
          }
          if (stateMap.inboundSyncTasks[syncTask].syncTime !== undefined && stateMap.inboundSyncTasks[syncTask].syncTime !== '---') {
            if (syncTime < stateMap.inboundSyncTasks[syncTask].syncTime) {
              syncTime = stateMap.inboundSyncTasks[syncTask].syncTime;
            }
          }
        }
      }
      if (currStatus === 1) {
        $('#syncgreen').show();
        $('#syncyellow').hide();
        $('#syncred').hide();
      } else if (currStatus === 2) {
        $('#syncgreen').hide();
        $('#syncyellow').show();
        $('#syncred').hide();
      } else if (currStatus === 3) {
        $('#syncgreen').hide();
        $('#syncyellow').hide();
        $('#syncred').show();
      }
      if (syncTime > 0) {
        $('#synctime').html(ema.shell.getLanguageTextString('allgemein', 'lbllastsync') + ': ' + ema.model.formatDateTimeForDisplay(syncTime));
      } else {
        $('#synctime').html(ema.shell.getLanguageTextString('allgemein', 'lbllastsync') + ': ---');
      }
      //update sync screen (only if it is currently displayed)
      ema.shell.updateSyncScreen();
    } catch (e) {
      ema.shell.handleError('updateSyncStatusSub', e, 'e');
    }
  };
  //End INTERNAL method /updateSyncStatusSub/
  //Begin INTERNAL method /extractCallbackFunction/
  extractCallbackFunction = function (callbackString) {
    try {
      var
      i,
      callbackSplit,
      ret;
      
      if (callbackString === undefined) {
        return undefined;
      } else {
        callbackSplit = callbackString.split('.');
        ret = window;
        for (i = 0; i < callbackSplit.length; i += 1) {
          ret = ret[callbackSplit[i]];
          if (typeof ret === 'function') {
            return ret;
          }
        }
      }
    } catch (e) {
      ema.shell.handleError('extractCallbackFunction', e, 'e');
    }
  };
  //End INTERNAL method /extractCallbackFunction/
  //Begin INTERNAL method /errorMultipleRequests/
  errorMultipleRequests = function (xhr, status, errorThrown) {
    try {
      var 
      keySplit,
      reqKey;
      
      keySplit = this.jsonpCallback.split('_');
      reqKey = keySplit[keySplit.length - 1];
      
      if (xhr.status === 404) {
        ema.shell.handleCustomError('doRequest', 'errdorequest', 'i');
        stateMap.requestListMultiple.requests[reqKey].status = 'error';
      } else {
        ema.shell.handleWSError('doRequest', xhr, status, errorThrown, 'e');
        stateMap.requestListMultiple.requests[reqKey].status = 'error';
      }
      checkRequestList();
    } catch (e) {
      ema.shell.handleError('errorMultipleRequests', e, 'e');
    }
  };
  //End INTERNAL method /errorMultipleRequests/
  //Begin INTERNAL method /checkRequestList/
  checkRequestList = function () {
    try {
      var 
      request,
      requestsFinished;

      requestsFinished = true;
      for (request in stateMap.requestListMultiple.requests) {
        if (stateMap.requestListMultiple.requests.hasOwnProperty(request)) {
          if (stateMap.requestListMultiple.requests[request].status !== 'finished' && stateMap.requestListMultiple.requests[request].status !== 'error') {
            requestsFinished = false;
          }
        }
      }
      if (requestsFinished === true) {
        stateMap.requestListMultiple.callbackFunction(stateMap.requestListMultiple);
        stateMap.requestListMultiple = undefined;
      }
    } catch (e) {
      ema.shell.handleError('checkRequestList', e, 'e');
    }
  };
  //End INTERNAL method /checkRequestList/
  //Begin INTERNAL method /doMultipleRequestsSuccess/
  doMultipleRequestsSuccess = function (data, status, xhr) {
    try {
      var
      errText,
      keySplit,
      reqKey;
      
      keySplit = this.jsonpCallback.split('_');
      reqKey = keySplit[keySplit.length - 1];

      if ((data[1] !== undefined && data[1][1] === 'E') || (data.CALLSTATUS !== undefined && data.CALLSTATUS.TYPE === 'E')) {
        if (data[1] !== undefined) {
          errText = data[1][2] + ' - ' + data[1][3];
        } else {
          errText = data.CALLSTATUS.TYPE + ' - ' + data.CALLSTATUS.DESCRIPTION;
        }
        ema.shell.handleCustomError('doRequest', errText, 'e');
        ema.shell.hideLoadingAnimLayer();
        stateMap.requestListMultiple.requests[reqKey].status = 'error';
      } else if (data.EXPORT === undefined && data[0] === undefined) {
        ema.shell.handleCustomError('doRequest', 'errdorequest', 'i');
        stateMap.requestListMultiple.requests[reqKey].status = 'error';
      } else {
        if (data === undefined || data[0] === null) {
          stateMap.requestListMultiple.requests[reqKey].status = 'error';
        } else {
          stateMap.requestListMultiple.requests[reqKey].status = 'finished';
          stateMap.requestListMultiple.requests[reqKey].retData = data;
        }
      }
      checkRequestList();
    } catch (e) {
      ema.shell.handleError('doMultipleRequestsSuccess', e, 'e');
    }
  };
  //End INTERNAL method /doMultipleRequestsSuccess/
  //Begin INTERNAL method /generateCallbackKey/
  generateCallbackKey = function (callbackKey) {
    try {
      var i;
      
      if (stateMap.requests[callbackKey] !== undefined) {
        for (i = 1; i < 1000; i += 1) {
          if (stateMap.requests[callbackKey + '_' + i] === undefined) {
            return callbackKey + '_' + i;
          }
        }
      } else {
        return callbackKey;
      }
    } catch (e) {
      ema.shell.handleError('generateCallbackKey', e, 'e');
    }
  };
  //End INTERNAL method /generateCallbackKey/
  //Begin INTERNAL method /deleteIndexedDb/
  deleteIndexedDb = function (indexedDB, dbName, sourcePath, navText) {
    try {
      var 
      DBDeleteRequest;
      
      DBDeleteRequest = indexedDB.deleteDatabase(dbName);

      DBDeleteRequest.onerror = function (event) {
        console.log("Error deleting database.");
      };
       
      DBDeleteRequest.onsuccess = function (event) {
        console.log("Database deleted successfully");
        initDatabase(sourcePath, navText);
      };
    } catch (e) {
      ema.shell.handleError('deleteIndexedDb', e, 'e');
    }
  };
  //End INTERNAL method /deleteIndexedDb/
  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
  //Begin PUBLIC method /doRequest/
  doRequest = function (operation, request, callbackFunction, reqKey) {
    try {
      //check if the data has to be requested from the server or can be read from indexed db
      var
      jsonpcallback,
      timeout,
      outboundObj,
      requestParameter,
      requestString,
      transaction,
      objStore,
      dbObj,
      offlineKey,
      outboundSyncTask = {},
      requestUrl = ema.model.generateRequestURL(operation),
      pingReturn;

      if (requestUrl !== undefined) {
        if (ema.shell.getOnlineStatus() === true) {
          //there is a active connection -> request data from server
          requestString = ema.model.generateRequestObj(request);
          
          if (reqKey !== null) {
            jsonpcallback = generateCallbackKey(operation + '_' + reqKey);
          } else {
            jsonpcallback = generateCallbackKey(operation + '_' + new Date().getTime());
          }
          requestParameter = {};
          requestParameter.callbackFunction = callbackFunction;
          requestParameter.requestString = requestString;
          requestParameter.operation = operation;
          
          stateMap.requests[jsonpcallback] = requestParameter;
          timeout = ema.shell.getConfigMapConfigValue('HOSTTIMEOUT');
          
          $.ajax({
            url: requestUrl,
            contentType: 'application/json; charset=UTF-8',
            dataType: ema.shell.getConfigMapConfigValue('AJAX_DATATYPE'),
            timeout: timeout,
            jsonpCallback: jsonpcallback,
            type: ema.shell.getConfigMapConfigValue('AJAX_TYPE'),
            data: ema.model.generateRequestObj(request),
            beforeSend: function (xhr) {
              ema.model.generateAuthHeader(xhr);
            },
            success: doRequestSuccess,
            error: function (xhr, status, errorThrown) {
              if (stateMap.requests[this.jsonpCallback].callbackFunction === 'ema.synchronisation') {
                stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].status = 3;
                stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].statustext = ema.shell.getLanguageTextString('errors', 'errdorequest');
                stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].syncTime = new Date();
                updateSyncStatus();
              } else if (stateMap.requests[this.jsonpCallback].callbackFunction === 'ema.synchronisation.upload') {
                updateUploadEntry(this.jsonpCallback, 3, ema.shell.getLanguageTextString('errors', 'errdorequest'));
              } else if (xhr.status === 404) {
                ema.shell.handleCustomError('doRequest', 'errdorequest', 'i');
                if (stateMap.requests[this.jsonpCallback].callbackFunction !== undefined) {
                  stateMap.requests[this.jsonpCallback].callbackFunction();
                }
              } else {
                ema.shell.handleWSError('doRequest', xhr, status, errorThrown, 'e');
                if (stateMap.requests[this.jsonpCallback].callbackFunction !== undefined) {
                  stateMap.requests[this.jsonpCallback].callbackFunction();
                }
              }
              delete stateMap.requests[this.jsonpCallback];
            }
          });
        } else {
          //there is no connection
          //check if there is a uploadsync-config -> if yes the request will be saved in indexed db
          if (stateMap.outboundSyncOperations[operation] !== undefined) {
            outboundObj = {};
            offlineKey = operation + '_' + reqKey;
            outboundObj.operation = operation;
            outboundObj.request = request;
            outboundObj.reqKey = reqKey;
            outboundObj.key = offlineKey;
            outboundObj.syncTime = new Date();
            outboundObj.status = 2;         //SyncStatus
            outboundObj.statustext = ema.shell.getLanguageTextString('messages', 'syncinprogress');
            
            writeEntryToDatabase('UPLOADSYNC', outboundObj);
            ema.shell.handleCustomError('doRequest', 'errlocalsave', 'i');
            callbackFunction();
          } else {
            //there is no uploadsync-config -> try to read the request from indexed db
            requestString = ema.model.generateRequestObj(request);
            transaction = emaDatabase.transaction([getStoreName('REQUESTSTORE')], "readonly");
            objStore = transaction.objectStore(getStoreName('REQUESTSTORE'));
            
            dbObj = objStore.get(requestString);
            dbObj.onsuccess = function (e) {
              var
              i,
              reqObj,
              keys = {};
              
              reqObj = e.target.result;
              
              if (reqObj !== undefined) {
                for (i = 0; i < reqObj.data.length; i += 1) {
                  keys[reqObj.data[i]] = reqObj.data[i];
                } 
                readOfflineData(operation, keys, callbackFunction);
              } else {
                ema.shell.handleCustomError('doRequest', 'errdorequest', 'i');
                callbackFunction(); 
              }
            };
          }
        }
      }
    } catch (e) {
      ema.shell.handleError('doRequest', e, 'e');
    }
  };
  //End PUBLIC method /doRequest/
  //Begin PUBLIC method /doMultipleRequests/
  doMultipleRequests = function (requestObj) {
    try {
      var
      request,
      jsonpcallback,
      timeout,
      outboundObj,
      requestString,
      transaction,
      offlineKey,
      requestUrl;
      
      if (stateMap.requestListMultiple !== undefined) {
        ema.shell.handleCustomError('doRequest', 'errmultirequestactive', 'i');
      } else {
        stateMap.requestListMultiple = requestObj;
        
        for (request in requestObj.requests) {
          if (requestObj.requests.hasOwnProperty(request)) {
            requestUrl = ema.model.generateRequestURL(requestObj.requests[request].operation);
            if (requestUrl !== undefined) {
              if (ema.shell.getOnlineStatus() === true) {
                //there is a active connection -> request data from server
                requestString = ema.model.generateRequestObj(requestObj.requests[request].request);
                
                jsonpcallback = requestObj.requests[request].operation + '_' + requestObj.requests[request].reqKey;
                
                timeout = ema.shell.getConfigMapConfigValue('HOSTTIMEOUT');
                
                $.ajax({
                  url: requestUrl,
                  contentType: 'application/json; charset=UTF-8',
                  dataType: ema.shell.getConfigMapConfigValue('AJAX_DATATYPE'),
                  timeout: timeout,
                  jsonpCallback: jsonpcallback,
                  type: ema.shell.getConfigMapConfigValue('AJAX_TYPE'),
                  data: ema.model.generateRequestObj(requestObj.requests[request].request),
                  beforeSend: ema.model.generateAuthHeader,
                  success: doMultipleRequestsSuccess,
                  error: errorMultipleRequests
                });
              } else {
                //there is no connection
                //check if there is a uploadsync-config -> if yes the request will be saved in indexed db
                if (stateMap.outboundSyncOperations[requestObj.requests[request].operation] !== undefined) {
                  outboundObj = {};
                  offlineKey = requestObj.requests[request].operation + '_' + requestObj.requests[request].reqKey;
                  outboundObj.operation = requestObj.requests[request].operation;
                  outboundObj.request = requestObj.requests[request].request;
                  outboundObj.reqKey = requestObj.requests[request].reqKey;
                  outboundObj.key = offlineKey;
                  outboundObj.syncTime = new Date();
                  outboundObj.status = 2;         //SyncStatus
                  outboundObj.statustext = ema.shell.getLanguageTextString('messages', 'syncinprogress');
                  
                  writeEntryToDatabase('UPLOADSYNC', outboundObj);
                  ema.shell.handleCustomError('doRequest', 'errlocalsave', 'i');
                  requestObj.requests[request].status = 'finished';
                }
              }
            }
          }
        }
        checkRequestList();
      }
    } catch (e) {
      ema.shell.handleError('doMultipleRequests', e, 'e');
    }
  };
  //End PUBLIC method /doMultipleRequests/
  //Begin PUBLIC method /requestRecordsByKey/
  //requests one single entry from a server or from the indexed db
  requestRecordsByKey = function (operation, keys, request, callbackFunction) {
    try {
      var
      i,
      indexedDbConfig,
      jsonpcallback,
      requestParameter,
      requestString,
      requestUrl = ema.model.generateRequestURL(operation);
      
      if (ema.shell.getOnlineStatus() === true) {
        //there is an active connection -> the request can be send to the server
        requestString = ema.model.generateRequestObj(request);
        
        jsonpcallback = generateCallbackKey(operation + '_' + new Date().getTime());
        requestParameter = {};
        requestParameter.callbackFunction = callbackFunction;
        requestParameter.requestString = requestString;
        requestParameter.operation = operation;
        
        stateMap.requests[jsonpcallback] = requestParameter;
        
        $.ajax({
          url: requestUrl,
          contentType: 'application/json; charset=UTF-8',
          dataType: ema.shell.getConfigMapConfigValue('AJAX_DATATYPE'),
          jsonpCallback: jsonpcallback,
          type: ema.shell.getConfigMapConfigValue('AJAX_TYPE'),
          data: ema.model.generateRequestObj(request),
          beforeSend: function (xhr) {
            ema.model.generateAuthHeader(xhr);
          },
          success: doRequestSuccess,
          error: function (xhr, status, errorThrown) {
            if (stateMap.requests[this.jsonpCallback].callbackFunction === 'ema.synchronisation') {
              stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].status = 3;
              stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].statustext = ema.shell.getLanguageTextString('errors', 'errdorequest');
              stateMap.inboundSyncTasks[stateMap.requests[this.jsonpCallback].operation].syncTime = new Date();
              updateSyncStatus();
            } else if (xhr.status === 404) {
              ema.shell.handleCustomError('doRequest', 'errdorequest', 'i');
              if (stateMap.requests[this.jsonpCallback].callbackFunction !== undefined) {
                stateMap.requests[this.jsonpCallback].callbackFunction();
              }
            } else {
              ema.shell.handleWSError('doRequest', xhr, status, errorThrown, 'e');
              if (stateMap.requests[this.jsonpCallback].callbackFunction !== undefined) {
                stateMap.requests[this.jsonpCallback].callbackFunction();
              }
            }
            delete stateMap.requests[this.jsonpCallback];
          }
        });
      } else {
        //there is no connection -> try to get the entry from indexed db
        indexedDbConfig = ema.shell.getConfigMapIndexedDb();
        readOfflineData(operation, keys, callbackFunction);
      }
    } catch (e) {
      ema.shell.handleError('requestRecordsByKey', e, 'e');
    }
  };
  //End PUBLIC method /requestRecordsByKey/
  //Begin PUBLIC method /initDatabase/
  /*
   * initialize the indexed db at startup
   * check if all tables are created and create missing ones
   */
  initDatabase = function (sourcePath, navText) {
    try {
      var
      i,
      j,
      indexedDbConfig,
      objStore,
      indices;
      
      indexedDbConfig = ema.shell.getConfigMapIndexedDb();
      
      for (i = 0; i < indexedDbConfig.OBJECTSTTORES.length; i += 1) {
        if (indexedDbConfig.OBJECTSTTORES[i].USERSPECIFIC === 'true') {
          stateMap.requiredObjectStores[stateMap.requiredObjectStores.length] = indexedDbConfig.OBJECTSTTORES[i].STORENAME + '_' + ema.model.loadFromLocalStorage('curr_username').toLowerCase();
        } else {
          stateMap.requiredObjectStores[stateMap.requiredObjectStores.length] = indexedDbConfig.OBJECTSTTORES[i].STORENAME;
        }
        if (indexedDbConfig.OBJECTSTTORES[i].INDICES !== undefined) {
          indices = [];
          for (j = 0; j < indexedDbConfig.OBJECTSTTORES[i].INDICES.length; j += 1) {
            indices[indices.length] = 'index' + j;
          }
          stateMap.requiredIndices[indexedDbConfig.OBJECTSTTORES[i].STORENAME] = indices;
        }
      }
      
      //try to open the database
      if (indexedDbConfig.DBNAME !== undefined && indexedDbConfig.DBNAME !== '') {
        openIndexedDb(indexedDbConfig.DBNAME, undefined, sourcePath, navText);
      }
    } catch (e) {
      ema.shell.handleError('initDatabase', e, 'e');
    }
  };
  //End PUBLIC method /initDatabase/
  //Begin PUBLIC method /startSynchronisation/
  startSynchronisation = function (synctype) {
    try {
      if (ema.shell.getStateMapValue('isUserLoggedOn') === false) {
        //no sync before user is logged on
        setTimeout(function () {
          startSynchronisation(synctype);
        }, 1000);
      } else {
        if (ema.shell.getOnlineStatus() === true) {
          setTimeout(function () {
            var i,      
            indexedDbConfig,
            request,
            syncTask,
            transaction,
            objStore,
            cursor,
            uploadTasks = [];       //tasks which need to be uploaded
            
            indexedDbConfig = ema.shell.getConfigMapIndexedDb();
            
            for (i = 0; i < indexedDbConfig.OBJECTSTTORES.length; i += 1) {
              //check if data needs to be requested at startup
              if (synctype === 'down' || synctype === 'both') {
                if (indexedDbConfig.OBJECTSTTORES[i].DOWNLOADCONFIG !== undefined) {
                  /*
                   * available Synctypes:
                   * - complete - delete existing entries and save newly requested data
                   * - delta - keep existing entries and overwrite with newly requested data
                   */
                  request = indexedDbConfig.OBJECTSTTORES[i].DOWNLOADCONFIG.REQUESTOBJECT;
                  syncTask = {};
                  syncTask.status = 2;
                  syncTask.statustext = '';
                  syncTask.syncTime = new Date();
                  syncTask.amount = '0';
                  syncTask.synctype = indexedDbConfig.OBJECTSTTORES[i].DOWNLOADCONFIG.SYNCTYPE;
                  syncTask.description = indexedDbConfig.OBJECTSTTORES[i].DOWNLOADCONFIG.SYNCDESC;
                  syncTask.callback = extractCallbackFunction(indexedDbConfig.OBJECTSTTORES[i].DOWNLOADCONFIG.SYNCCOMPLETEJS);
                  stateMap.inboundSyncTasks[indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME] = syncTask;
                  doRequest(indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME, request, 'ema.synchronisation', null);
                }
              }
              if (indexedDbConfig.OBJECTSTTORES[i].UPLOADCONFIG !== undefined) {
                stateMap.outboundSyncOperations[indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME] = indexedDbConfig.OBJECTSTTORES[i].UPLOADCONFIG.SYNCDESC;
              }
            }
            if (synctype === 'up' || synctype === 'both') {
              //check if there are pending request for uploadsync
              transaction = emaDatabase.transaction([getStoreName('UPLOADSYNC')], "readonly");
              objStore = transaction.objectStore(getStoreName('UPLOADSYNC'));
              
              cursor = objStore.openCursor();
              cursor.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                  uploadTasks[uploadTasks.length] = cursor.value;
                  cursor['continue']();
                } else {
                  writeUploadData(uploadTasks);
                }
              };
            }
          }, 500);
        }
      }
    } catch (e) {
      ema.shell.handleError('startSynchronisation', e, 'e');
    }
  };
  //End PUBLIC method /startSynchronisation/
  //Begin PUBLIC method /startSingleDownloadSync/
  startSingleDownloadSync = function (taskName) {
    try {
      if (ema.shell.getOnlineStatus() === true) {
        var i,      
        indexedDbConfig,
        request,
        transaction,
        objStore,
        cursor,
        reqData = [];
        
        indexedDbConfig = ema.shell.getConfigMapIndexedDb();
        
        for (i = 0; i < indexedDbConfig.OBJECTSTTORES.length; i += 1) {
          if (indexedDbConfig.OBJECTSTTORES[i].DOWNLOADCONFIG !== undefined && indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME === taskName) {
            request = indexedDbConfig.OBJECTSTTORES[i].DOWNLOADCONFIG.REQUESTOBJECT;
            stateMap.inboundSyncTasks[taskName].status = 2;
            stateMap.inboundSyncTasks[taskName].statustext = '';
            stateMap.inboundSyncTasks[taskName].syncTime = new Date();
            stateMap.inboundSyncTasks[taskName].amount = '0';
            doRequest(indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME, request, 'ema.synchronisation', null);
          }
        }
      } else {
        ema.shell.handleCustomError('startSingleDownloadSync', 'errsyncoffline', 'e');
      }
    } catch (e) {
      ema.shell.handleError('startSingleDownloadSync', e, 'e');
    }
  };
  //End PUBLIC method /startSingleDownloadSync/
  //Begin PUBLIC method /startUploadByKey/
  startUploadByKey = function (keys) {
    try {
      if (ema.shell.getOnlineStatus() === true) {
        var i,      
        transaction,
        objStore,
        cursor,
        uploadTasks = [];       //tasks which need to be uploaded
        
        transaction = emaDatabase.transaction([getStoreName('UPLOADSYNC')], "readonly");
        objStore = transaction.objectStore(getStoreName('UPLOADSYNC'));
        
        cursor = objStore.openCursor();
        cursor.onsuccess = function (e) {
          var
          i,
          cursor = e.target.result;
          if (cursor) {
            for (i = 0; i < keys.length; i += 1) {
              if (keys[i] === cursor.value.key) {
                uploadTasks[uploadTasks.length] = cursor.value;
              }
            }
            cursor['continue']();
          } else {
            writeUploadData(uploadTasks);
          }
        };
      }
    } catch (e) {
      ema.shell.handleError('startUploadByKey', e, 'e');
    }
  };
  //End PUBLIC method /startUploadByKey/
  //Begin PUBLIC method /updateSyncStatus/
  updateSyncStatus = function () {
    try {
      var      
      transaction,
      objStore,
      cursor,
      reqData = [];
      
      if (emaDatabase !== null) {
        transaction = emaDatabase.transaction([getStoreName('UPLOADSYNC')], "readonly");
        objStore = transaction.objectStore(getStoreName('UPLOADSYNC'));
        
        cursor = objStore.openCursor();
        cursor.onsuccess = function (e) {
          var cursor = e.target.result;
          if (cursor) {
            if (cursor.value.status > 1) {    //entries with status 1 have been sent already
              reqData[reqData.length] = cursor.value;
            }
            cursor['continue']();
          } else {
            updateSyncStatusSub(reqData);
          }
        };
      }
    } catch (e) {
      ema.shell.handleError('updateSyncStatus', e, 'e');
    }
  };
  //End PUBLIC method /updateSyncStatus/
  // Begin PUBLIC method /getInboundSyncTasks/
  getInboundSyncTasks = function () {
    try {
      return stateMap.inboundSyncTasks;
    } catch (e) {
      ema.shell.handleError('getInboundSyncTasks', e, 'e');
    }
  };
  // End PUBLIC method /getInboundSyncTasks/
  // Begin PUBLIC method /getOutboundSyncOperations/
  getOutboundSyncOperations = function () {
    try {
      return stateMap.outboundSyncOperations;
    } catch (e) {
      ema.shell.handleError('getOutboundSyncOperations', e, 'e');
    }
  };
  // End PUBLIC method /getOutboundSyncOperations/
  // Begin PUBLIC method /getEMADatabase/
  getEMADatabase = function () {
    try {
      return emaDatabase;
    } catch (e) {
      ema.shell.handleError('getEMADatabase', e, 'e');
    }
  };
  // End PUBLIC method /getEMADatabase/
  //Begin PUBLIC method /readOfflineData/
  readOfflineData = function (internalName, keys, callbackFunction, saveKeys) {
    try {
      var 
      transaction,
      objStore,
      cursor,
      reqData = [];
      
      transaction = emaDatabase.transaction([getStoreName(internalName)], "readonly");
      objStore = transaction.objectStore(getStoreName(internalName));
      
      cursor = objStore.openCursor();
      cursor.onsuccess = function (e) {
        var 
        cursor;
        
        cursor = e.target.result;
        if (cursor) {
          if (keys === null || keys[cursor.key] !== undefined) {
            if (saveKeys === true) {
              reqData[reqData.length] = cursor.value;
            } else {
              reqData[reqData.length] = cursor.value.data;
            }
          }
          cursor['continue']();
        } else {
          callbackFunction(reqData);
        }
      };
    } catch (e) {
      ema.shell.handleError('readOfflineData', e, 'e');
    }
  };
  //End PUBLIC method /readOfflineData/
  // Begin PUBLIC method /deleteOutboundSyncTask/
  deleteOutboundSyncTask = function (taskKeys) {
    try {
      var i;
      if (taskKeys.length > 0) {
        for (i = 0; i < taskKeys.length; i += 1) {
          deleteEntryFromObjectStore('UPLOADSYNC', taskKeys[i]);
        }
        updateSyncStatus();
      }
    } catch (e) {
      ema.shell.handleError('deleteOutboundSyncTask', e, 'e');
    }
  };
  // End PUBLIC method /deleteOutboundSyncTask/
  //Begin PUBLIC method /getStoreName/
  getStoreName = function (internalName) {
    try {
      var
      i,
      indexedDbConfig,
      storeName;
      
      indexedDbConfig = ema.shell.getConfigMapIndexedDb();
      storeName = '';
      for (i = 0; i < indexedDbConfig.OBJECTSTTORES.length; i += 1) {
        if (indexedDbConfig.OBJECTSTTORES[i].INTERNALNAME === internalName) {
          if (indexedDbConfig.OBJECTSTTORES[i].STORENAME !== '') {
            if (indexedDbConfig.OBJECTSTTORES[i].USERSPECIFIC === 'true') {
              storeName = indexedDbConfig.OBJECTSTTORES[i].STORENAME + '_' + ema.model.loadFromLocalStorage('curr_username').toLowerCase();
            } else {
              storeName = indexedDbConfig.OBJECTSTTORES[i].STORENAME;
            }
          }
        }
      }
      return storeName;
    } catch (e) {
      ema.shell.handleError('getStoreName', e, 'e');
    }
  };
  //End PUBLIC method /getStoreName/
  //Begin PUBLIC method /deleteEntryFromObjectStore/
  deleteEntryFromObjectStore = function (storeName, key) {
    try {
      var 
      transaction,
      objStore;
      //request;
      
      transaction = emaDatabase.transaction([getStoreName(storeName)], "readwrite");
      objStore = transaction.objectStore(getStoreName(storeName));
      objStore['delete'](key);
    } catch (e) {
      ema.shell.handleError('deleteEntryFromObjectStore', e, 'e');
    }
  };
  //End PUBLIC method /deleteEntryFromObjectStore/
  //Begin PUBLIC method /writeAutosaveDataToDatabase/
  writeAutosaveDataToDatabase = function (dataList) {
    try {
      writeMultipleEntriesToDatabase('AUTOSAVESTORE', dataList);
    } catch (e) {
      ema.shell.handleError('writeAutosaveDataToDatabase', e, 'e');
    }
  };
  //End PUBLIC method /writeAutosaveDataToDatabase/
  
  return {
    doRequest : doRequest,
    doMultipleRequests : doMultipleRequests,
    requestRecordsByKey : requestRecordsByKey,
    initDatabase : initDatabase,
    startSynchronisation : startSynchronisation,
    startSingleDownloadSync : startSingleDownloadSync,
    startUploadByKey : startUploadByKey,
    updateSyncStatus : updateSyncStatus,
    getInboundSyncTasks : getInboundSyncTasks, 
    getOutboundSyncOperations : getOutboundSyncOperations,
    getEMADatabase : getEMADatabase,
    readOfflineData : readOfflineData,
    deleteOutboundSyncTask : deleteOutboundSyncTask,
    getStoreName : getStoreName,
    deleteEntryFromObjectStore : deleteEntryFromObjectStore,
    writeAutosaveDataToDatabase : writeAutosaveDataToDatabase
  };
}());
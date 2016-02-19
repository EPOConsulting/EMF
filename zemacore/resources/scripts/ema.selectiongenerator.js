/*
 * ema.selectiongenerator.js
 * selectiongenerator module
 */
ema.selectiongenerator = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  
  searchData = {},
  
  stateMap = {
      tmpResultlistPath : String()
    },
  
  //internal functions
  generateSearchForm, generateSearchRow, generateSelectionSubRow,
  generateParameterSubRow, generateInputFields, generateParameterFields, 
  loadVariants, generateSelectionObject, generateSearchRequestObject,
  
  // public functions
  generateNewSearch, generateNewRow, deleteRow, 
  checkOptionChange, loadVariantsCallback, selectVariant,
  selectVariantCallback, getSearchRequestObject, resetFields, 
  loadList;

  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/
  //Begin INTERNAL method /generateSearchForm/
  generateSearchForm = function (resultlistPath, container) {
    try {
      var strHTML, i;

      //create headerrow
      strHTML = '';
      strHTML += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
      strHTML += '<div class="mhcontent">';
      strHTML += ema.formgenerator.generateHeader('', searchData[resultlistPath].labelHeader, '', '', '', '');
      strHTML += '<div id="sg_' + searchData[resultlistPath].container + '">';
      
      //generate variant selectionfield
      strHTML += ema.formgenerator.generateSelectRow('sg_' + searchData[resultlistPath].variantService, searchData[resultlistPath].variantName, null, 'onchange="ema.selectiongenerator.selectVariant(this.id, \'' + resultlistPath + '\');"', false, '', 'lblvariants', '', '', false);
      
      //generatesearchrows
      for (i = 0; i < searchData[resultlistPath].formDefinition.length; i += 1) {
        strHTML += generateSearchRow(searchData[resultlistPath].formDefinition[i], searchData[resultlistPath].variantInfo[searchData[resultlistPath].formDefinition[i].variantid], resultlistPath);
      }
      strHTML += '</div>';
      strHTML += '</div>';
      
      $('#' + searchData[resultlistPath].container).html(strHTML);
      
      ema.formgenerator.generateFooter(true, true, 'ema.selectiongenerator.resetFields(\'' + resultlistPath + '\')', true, searchData[resultlistPath].labelButton, 'ema.selectiongenerator.loadList(\'' + resultlistPath + '\')');
      ema.model.loadLanguagePattern(ema.shell.getStateMapValue('selected_language'), false);
      //load variants
      loadVariants(resultlistPath);
    } catch (e) {
      ema.shell.handleError('generateSearchForm', e, 'e');
    }
  };
  //End INTERNAL method /generateSearchForm/
  //Begin INTERNAL method /generateSearchRow/
  generateSearchRow = function (searchRowDefinition, variantValues, resultlistPath) {
    try {
      var retStr, i, fieldId; 
      
      fieldId = searchRowDefinition.fieldId;
      
      retStr = '<div class="w100p" id="' + fieldId + '">';
      if (searchRowDefinition.kind === 'S') {
        //Selection - multiple rows per field are possible
        if (variantValues !== undefined) {
          for (i = 0; i < variantValues.length; i += 1) {
            retStr += generateSelectionSubRow(i, fieldId, searchRowDefinition.fieldType, searchRowDefinition.label, searchRowDefinition.inputvalidation, variantValues[i][2], variantValues[i][3], variantValues[i][4], variantValues[i][5], resultlistPath);
          }
        } else {
          i = 0;
          retStr += generateSelectionSubRow(i, fieldId, searchRowDefinition.fieldType, searchRowDefinition.label, searchRowDefinition.inputvalidation, '', '', '', '', resultlistPath);
        }
      } else if (searchRowDefinition.kind === 'P') {
        //Parameter - only one value is allowed
        if (variantValues !== undefined) {
          //only the first value will be used here
          retStr += generateParameterSubRow(fieldId, searchRowDefinition.fieldType, searchRowDefinition.label, searchRowDefinition.fieldlabel, variantValues[0][4]);
        } else {
          retStr += generateParameterSubRow(fieldId, searchRowDefinition.fieldType, searchRowDefinition.label, searchRowDefinition.fieldlabel, '');
        }
      }
      retStr += '</div>';
      searchRowDefinition.rowCount = i;
      return retStr;
    } catch (e) {
      ema.shell.handleError('generateSearchRow', e, 'e');
    }
  };
  //End INTERNAL method /generateSearchRow/
  //Begin INTERNAL method /generateSelectionSubRow/
  generateSelectionSubRow = function (rowNo, fieldId, fieldType, label, inputValidation, sign, option, low, high, resultlistPath) {
    try {
      var strSubRow, signList, optionList, i, optionNameList, rowId; 
      
      signList = ['I', 'E'];
      optionList = ['EQ', 'BT', 'LT', 'GT', 'LE', 'GE'];
      optionNameList = ['=', '[]', '<', '>', '<=', '>='];
      strSubRow = '';
      rowId = fieldId + rowNo;
      
      strSubRow += '<div class="w100p" id="' + rowId + '_row">';
      //Label
      if (rowNo === 0) {
        strSubRow += '<div class="w20p label"><label class="' + label + '" for="' + rowId + '_low">&nbsp;</label></div>';
      } else {
        strSubRow += '<div class="w20p label">&nbsp;</div>';
      }
      //Select for Sign I(nclude) or E(xlude)
      strSubRow += '<div class="w10p">';
      strSubRow += '<select name="' + rowId + '_sign" id="' + rowId + '_sign" class="selects">';
      for (i = 0; i < signList.length; i += 1) {
        if (sign === signList[i]) {
          strSubRow += '<option value="' + signList[i] + '" selected>' + signList[i] + '</option>';
        } else {
          strSubRow += '<option value="' + signList[i] + '">' + signList[i] + '</option>';
        }
      }
      strSubRow += '</select>';
      strSubRow += '</div>';
      //Select for Option
      strSubRow += '<div class="w10p">';
      strSubRow += '<select name="' + rowId + '_opt" id="' + rowId + '_opt" onchange="ema.selectiongenerator.checkOptionChange(this, \'' + fieldType + '\')" class="selects">';
      for (i = 0; i < optionList.length; i += 1) {
        if (option === optionList[i]) {
          strSubRow += '<option value="' + optionList[i] + '" selected>' + optionNameList[i] + '</option>';
        } else {
          strSubRow += '<option value="' + optionList[i] + '">' + optionNameList[i] + '</option>';
        }
      }
      strSubRow += '</select>';
      strSubRow += '</div>';
      //Div for Inputfield
      strSubRow += '<div class="w40p" id="' + rowId + '_input">';
      strSubRow += generateInputFields(fieldType, inputValidation, option, rowId, low, high);
      strSubRow += '</div>';
      //Div for Buttons
      strSubRow += '<div class="w20p">';
      if (rowNo === 0) {
        strSubRow += '<button onclick="ema.selectiongenerator.generateNewRow(\'' + fieldId + '\', \'' + resultlistPath + '\')" class="tbg"><i class=" icon-doc-text"></i></button>';
        strSubRow += '<span id="' + fieldId + '_error" class="ferror" style="display:none"><i class="icon-attention-alt"></i></span>';
      } else {
        strSubRow += '<button onclick="ema.selectiongenerator.deleteRow(\'' + rowId + '_row\')" class="tbg"><i class=" icon-trash-empty"></i></button>';
      }
      strSubRow += '</div>';
      strSubRow += '</div>';
      
      
      return strSubRow;
    } catch (e) {
      ema.shell.handleError('generateSelectionSubRow', e, 'e');
    }
  };
  //End INTERNAL method /generateSelectionSubRow/
  //Begin INTERNAL method /generateParameterSubRow/
  generateParameterSubRow = function (fieldId, fieldType, label, fieldlabel, low) {
    try {
      var strSubRow; 
      
      strSubRow = '';
      
      strSubRow += '<div class="w100p" id="' + fieldId + '_row">';
      //Label
      strSubRow += '<div class="w20p label"><label class="' + label + '" for="' + fieldId + '_low">&nbsp;</label></div>';
      //Select for Sign - not available
      strSubRow += '<div class="w10p">&nbsp;</div>';
      //Select for Option - not available
      strSubRow += '<div class="w10p">&nbsp;</div>';
      //Div for Inputfield
      strSubRow += '<div class="w40p" id="' + fieldId + '_input">';
      strSubRow += generateParameterFields(fieldType, fieldId, fieldlabel, low);
      strSubRow += '</div>';
      //Div for Buttons - not available
      strSubRow += '<div class="w20p">';
      strSubRow += '<span id="' + fieldId + '_error" class="ferror" style="display:none"><i class="icon-attention-alt"></i></span>';
      strSubRow += '</div>';
      strSubRow += '</div>';
      
      
      return strSubRow;
    } catch (e) {
      ema.shell.handleError('generateParameterSubRow', e, 'e');
    }
  };
  //End INTERNAL method /generateParameterSubRow/
  //Begin INTERNAL method /generateInputFields/
  generateInputFields = function (fieldType, inputValidation, option, rowId, low, high) {
    try {
      var strInput = '';
      if (option === 'BT') {
        strInput += '<div class="w40p"><input id="' + rowId + '_low" class="tb" ';
        if (fieldType === 'date') {
          strInput += ' value="' + ema.model.formatSAPDateForInputField(low) + '" ';
          strInput += ' type="date" ';
        } else {
          strInput += ' value="' + low + '" ';
        }
        if (inputValidation !== undefined) {
          strInput += ' ' + inputValidation + ' ';
        }
        strInput += ' ></input></div>';
        strInput += ' <div class="w20p lblto">&nbsp;' + ema.shell.getLanguageTextString('allgemein', 'lblto') + '&nbsp;</div>';
        strInput += '<div class="w40p"><input id="' + rowId + '_high" class="tb" ';
        if (fieldType === 'date') {
          strInput += ' value="' + ema.model.formatSAPDateForInputField(high) + '" ';
          strInput += ' type="date" ';
        } else {
          strInput += ' value="' + high + '" ';
        }
        if (inputValidation !== undefined) {
          strInput += ' ' + inputValidation + ' ';
        }
        strInput += ' ></input></div>';
      } else {
        strInput += '<input id="' + rowId + '_low" class="tb" value="' + low + '" ';
        if (fieldType === 'date') {
          strInput += ' type="date" ';
        }
        if (inputValidation !== undefined) {
          strInput += ' ' + inputValidation + ' ';
        }
        strInput += ' ></input>';
      }
      return strInput;
    } catch (e) {
      ema.shell.handleError('generateInputFields', e, 'e');
    }
  };
  //End INTERNAL method /generateInputFields/
  //Begin INTERNAL method /generateParameterFields/
  generateParameterFields = function (fieldType, fieldId, fieldlabel, low) {
    try {
      var strInput = '';
      if (fieldType === 'text' || fieldType === 'date') {
        strInput += '<input id="' + fieldId + '_low" class="tb" value="' + low + '" ';
        if (fieldType === 'date') {
          strInput += ' type="date" ';
        }
        strInput += ' ></input>';
      } else if (fieldType === 'checkbox') {
        strInput += '<input name="' + fieldId + '_low" class="css-checkbox" id="' + fieldId + '_low" value="X" type="checkbox"';
        if (low === 'X') {
          strInput += ' checked';
        }
        strInput += '><label class="css-label" for="' + fieldId + '_low">' + fieldlabel + '</label>';
      }
      return strInput;
    } catch (e) {
      ema.shell.handleError('generateParameterFields', e, 'e');
    }
  };
  //End INTERNAL method /generateParameterFields/
  //Begin INTERNAL method /loadVariants/
  loadVariants = function (resultlistPath) {
    try {
      var request, table;
      stateMap.tmpResultlistPath = resultlistPath;
      if (searchData[resultlistPath].variantSelection === undefined) {
        request = {};
        request.IMPORT = {};
        request.IMPORT.BATCH_OR_ONLINE = 'A';
        request.IMPORT.CLIENT_SPECIFIED = '';
        
        table = {};
        table.SIGN = 'I';
        table.OPTION = 'EQ';
        table.LOW = searchData[resultlistPath].variantService;
        table.HIGH = '';
        
        request.TABLES = {};
        request.TABLES.PROG_RANGE = [];
        request.TABLES.PROG_RANGE[0] = table;
        
        ema.datamanager.doRequest('LOAD_VARIANT_INFO', request, ema.selectiongenerator.loadVariantsCallback, null);
      } else {
        loadVariantsCallback(searchData[resultlistPath].variantSelection);
      }
    } catch (e) {
      ema.shell.handleError('loadVariants', e, 'e');
    }
  };
  //End INTERNAL method /loadVariants/
  // Begin INTERNAL method /generateSelectionObject/
  generateSelectionObject = function (sign, option, low, high) {
    try {
      var
      selObj = {};
      if (high === undefined) {
        high = '';
      }
      
      if (low !== '') {
        selObj.SIGN = sign;
        selObj.OPTION = option;
        selObj.LOW = low;
        selObj.HIGH = high;
      } else {
        selObj.SIGN = '';
        selObj.OPTION = '';
        selObj.LOW = '';
        selObj.HIGH = '';
      }
      
      return selObj;
    } catch (e) {
      ema.shell.handleError('ih_sr_generateSelectionObject', e, 'e');
    }
  };
  // End INTERNAL method /generateSelectionObject/
  //Begin INTERNAL method /generateSearchRequestObject/
  generateSearchRequestObject = function (resultlistPath) {
    try {
      var i, j, fieldId, rowId, request, tmpArray, tmpObj, sign, option, low, high, generateRequestObject;
      
      request = {};
      request.IMPORT = {};
      generateRequestObject = true;
      
      //check which fields are displayed in the variant - not every field available in SAP is displayed here too:
      for (i = 0; i < searchData[resultlistPath].formDefinition.length; i += 1) {
        if (searchData[resultlistPath].formDefinition[i].kind === 'S') {
          request.IMPORT[searchData[resultlistPath].formDefinition[i].sapid] = [];
          tmpArray = [];
          fieldId = searchData[resultlistPath].formDefinition[i].fieldId;
          for (j = 0; j <= searchData[resultlistPath].formDefinition[i].rowCount; j += 1) {
            rowId = fieldId + j;
            //check if there is a row for this selection
            if ($('#' + rowId + '_row').length > 0) {
              sign = $('#' + rowId + '_sign').val();
              option = $('#' + rowId + '_opt').val();
              low = $('#' + rowId + '_low').val();
              high = $('#' + rowId + '_high').val();
              if (option === 'BT' && low !== '' && high !== '') {
                //1. Option BT: both fields(low and high) must be filled
                tmpObj = generateSelectionObject(sign, option, low, high);
                tmpArray[tmpArray.length] = tmpObj;
              } else if (low !== '') {
                //2. other Option: only low must be filled
                tmpObj = generateSelectionObject(sign, option, low, high);
                tmpArray[tmpArray.length] = tmpObj;
              }
            }
          }
          request.IMPORT[searchData[resultlistPath].formDefinition[i].sapid] = tmpArray;
        } else if (searchData[resultlistPath].formDefinition[i].kind === 'P') {
          if (searchData[resultlistPath].formDefinition[i].fieldType === 'date') {
            request.IMPORT[searchData[resultlistPath].formDefinition[i].sapid] = ema.model.formatDateForSap($('#' + searchData[resultlistPath].formDefinition[i].fieldId + '_low').val());
          } else {
            request.IMPORT[searchData[resultlistPath].formDefinition[i].sapid] = $('#' + searchData[resultlistPath].formDefinition[i].fieldId + '_low').val();
          }
        }
      }
      
      if (generateRequestObject === true) {
        request.IMPORT.I_MAXROWS = ema.shell.getConfigMapConfigValue('MAXLISTROWS');
        return request;
      } else {
        return undefined;
      }
    } catch (e) {
      ema.shell.handleError('generateSearchRequestObject', e, 'e');
    }
  };
  //End INTERNAL method /generateSearchRequestObject/
  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
  //Begin PUBLIC method /generateNewSearch/
  generateNewSearch = function (formDefinition, container, variantService, resultlistPath, labelHeader, labelButton) {
    try {
      var searchFormConfig = {};
      
      searchFormConfig.formDefinition = formDefinition;
      searchFormConfig.variantInfo = {};
      searchFormConfig.container = container;
      searchFormConfig.variantService = variantService;
      searchFormConfig.variantName = '';
      searchFormConfig.resultlistPath = resultlistPath;
      searchFormConfig.labelHeader = labelHeader;
      searchFormConfig.labelButton = labelButton;
      
      searchData[resultlistPath] = searchFormConfig;
      
      generateSearchForm(resultlistPath);
      
    } catch (e) {
      ema.shell.handleError('generateNewSearch', e, 'e');
    }
  };
  //End PUBLIC method /generateNewSearch/
  //Begin PUBLIC method /generateNewRow/
  generateNewRow = function (fieldId, resultlistPath) {
    try {
      var strHtml, i;
      for (i = 0; i < searchData[resultlistPath].formDefinition.length; i += 1) {
        if (searchData[resultlistPath].formDefinition[i].fieldId === fieldId) {
          searchData[resultlistPath].formDefinition[i].rowCount += 1;
          strHtml = generateSelectionSubRow(searchData[resultlistPath].formDefinition[i].rowCount, fieldId, searchData[resultlistPath].formDefinition[i].fieldType, searchData[resultlistPath].formDefinition[i].label, searchData[resultlistPath].formDefinition[i].inputvalidation, searchData[resultlistPath].formDefinition[i].kind, '', '', '', '', resultlistPath);
          $('#' + fieldId).append(strHtml);
        }
      }
    } catch (e) {
      ema.shell.handleError('generateNewRow', e, 'e');
    }
  };
  //End PUBLIC method /generateNewRow/
  //Begin PUBLIC method /deleteRow/
  deleteRow = function (rowId) {
    try {
      $('#' + rowId).remove();
    } catch (e) {
      ema.shell.handleError('deleteRow', e, 'e');
    }
  };
  //End PUBLIC method /deleteRow/
  //Begin PUBLIC method /checkOptionChange/
  checkOptionChange = function (sourceField, fieldType) {
    try {
      var rowId, strHtml = '';
      rowId = sourceField.id.split('_opt')[0];
      
      strHtml = generateInputFields(fieldType, $('#' + rowId + '_opt').val(), rowId, $('#' + rowId + '_low').val(), '');
      $('#' + rowId + '_input').html(strHtml);
      
    } catch (e) {
      ema.shell.handleError('checkOptionChange', e, 'e');
    }
  };
  //End PUBLIC method /checkOptionChange/
  //Begin PUBLIC method /loadVariantsCallback/
  loadVariantsCallback = function (json) {
    try {
      var resultlistPath, i;
      
      resultlistPath = stateMap.tmpResultlistPath;
      if (resultlistPath !== undefined) {
        stateMap.tmpResultlistPath = undefined;
        if (searchData[resultlistPath].variantSelection === undefined) {
          searchData[resultlistPath].variantSelection = json;      
        }
        if (json !== undefined) {
          if (json[7] !== undefined && json[7][0] !== null) {
            $('#sg_' + searchData[resultlistPath].variantService)
              .find('option')
              .remove()
              .end()
              .append('<option value="">' + ema.shell.getLanguageTextString('allgemein', 'lblselect') + '</option>')
              .val('')
            ;
            for (i = 0; i < json[7].length; i += 1) {
              $('#sg_' + searchData[resultlistPath].variantService).append($('<option></option>').attr('value', json[7][i][1]).text(json[7][i][1]));
            }
            $('#sg_' + searchData[resultlistPath].variantService).val(searchData[resultlistPath].variantName);
          }
        }
      }
    } catch (e) {
      ema.shell.handleError('loadVariantsCallback', e, 'e');
    }
  };
  //End PUBLIC method /loadVariantsCallback/
  //Begin PUBLIC method /selectVariant/
  selectVariant = function (sourceFieldId, resultlistPath) {
    try {
      var request, variant_values, variant_text;

      searchData[resultlistPath].variantName = $('#' + sourceFieldId).val();
      
      request = {};
      request.IMPORT = {};
      request.IMPORT.REPORT = searchData[resultlistPath].variantService;
      request.IMPORT.VARIANT = $('#' + sourceFieldId).val();
      request.IMPORT.SEL_TEXT = '';
      request.IMPORT.MOVE_OR_WRITE = 'M';
      request.IMPORT.SORTED = '';
      request.IMPORT.EXECUTE_DIRECT = '';
      
      request.TABLES = {};
      request.TABLES.VARIANT_VALUES = [];
      variant_values = {};
      variant_values.SELNAME = '';
      variant_values.KIND = '';
      variant_values.SIGN = '';
      variant_values.OPTION = '';
      variant_values.LOW = '';
      variant_values.HIGH = '';
      request.TABLES.VARIANT_VALUES[0] = variant_values;
      
      request.TABLES.VARIANT_TEXT = [];
      variant_text = {};
      variant_text.TECH_NAME = '';
      variant_text.TEXT = '';
      request.TABLES.VARIANT_TEXT[0] = variant_text;
      
      ema.datamanager.doRequest('LOAD_VARIANT_DATA', request, ema.selectiongenerator.selectVariantCallback, null);
    } catch (e) {
      ema.shell.handleError('selectVariant', e, 'e');
    }
  };
  //End PUBLIC method /selectVariant/
  //Begin PUBLIC method /selectVariantCallback/
  selectVariantCallback = function (json) {
    try {
      var entry, resultlistPath, i;
      //1. find config for this variant:
      for (entry in searchData) {
        if (searchData.hasOwnProperty(entry)) {
          if (searchData[entry].variantService === json[1][0][1]) {
            resultlistPath = entry;
          }
        }
      }
      
      //2. delete existing variant data
      searchData[resultlistPath].variantInfo = {};
      
      //3. write variant data to config
      for (i = 0; i < json[2][0].length; i += 1) {
        if (searchData[resultlistPath].variantInfo[json[2][0][i][0]] === undefined) {
          searchData[resultlistPath].variantInfo[json[2][0][i][0]] = [];
        }
        searchData[resultlistPath].variantInfo[json[2][0][i][0]][searchData[resultlistPath].variantInfo[json[2][0][i][0]].length] = json[2][0][i];
      }
      
      //4. generate form
      generateSearchForm(resultlistPath);
    } catch (e) {
      ema.shell.handleError('selectVariantCallback', e, 'e');
    }
  };
  //End PUBLIC method /selectVariantCallback/
  //Begin PUBLIC method /getSearchRequestObject/
  getSearchRequestObject = function (resultlistPath) {
    try {
      return searchData[resultlistPath].requestObject;
    } catch (e) {
      ema.shell.handleError('getSearchRequestObject', e, 'e');
    }
  };
  //End PUBLIC method /getSearchRequestObject/
  //Begin PUBLIC method /resetFields/
  resetFields = function (resultlistPath) {
    try {
      searchData[resultlistPath].variantInfo = {};
      searchData[resultlistPath].variantName = undefined;
      
      generateSearchForm(resultlistPath);
    } catch (e) {
      ema.shell.handleError('resetFields', e, 'e');
    }
  };
  //End PUBLIC method /resetFields/
  //Begin PUBLIC method /loadList/
  loadList = function (resultlistPath) {
    try {
      var request, validationError, i;
      
      request = generateSearchRequestObject(resultlistPath);
      validationError = false;
      //Check if required Fields are filled
      for (i = 0; i < searchData[resultlistPath].formDefinition.length; i += 1) {
        if (searchData[resultlistPath].formDefinition[i].required === true) {
          if (searchData[resultlistPath].formDefinition[i].kind === 'S') {
            if (request.IMPORT[searchData[resultlistPath].formDefinition[i].sapid].length === 0) {
              //error
              $('#' + searchData[resultlistPath].formDefinition[i].fieldId + '_error').show();
              validationError = true;
            } else {
              $('#' + searchData[resultlistPath].formDefinition[i].fieldId + '_error').hide();
            }
          } else if (searchData[resultlistPath].formDefinition[i].kind === 'P') {
            if (searchData[resultlistPath].formDefinition[i].fieldType !== 'checkbox') {
              if (request.IMPORT[searchData[resultlistPath].formDefinition[i].sapid] === '') {
                //error
                validationError = true;
              }
            }
          }
        }
      }
      
      if (validationError === false) {
        searchData[resultlistPath].requestObject = request;
        ema.shell.changeHash(resultlistPath, 'Ergebnis');
      } else {
        ema.shell.handleCustomError('selectionGenerator', 'errincompleteinput', 'e');
        searchData[resultlistPath].requestObject = undefined;
      }
    } catch (e) {
      ema.shell.handleError('loadList', e, 'e');
    }
  };
  //End PUBLIC method /loadList/
  
  return { 
    generateNewSearch : generateNewSearch,
    generateNewRow : generateNewRow,
    deleteRow : deleteRow,
    checkOptionChange : checkOptionChange,
    loadVariantsCallback : loadVariantsCallback,
    selectVariant : selectVariant,
    selectVariantCallback : selectVariantCallback,
    getSearchRequestObject : getSearchRequestObject,
    resetFields : resetFields,
    loadList : loadList
  };
}());

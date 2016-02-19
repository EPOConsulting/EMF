/*
 * ema.formgenerator.js
 * Formgenerator module
 */
ema.formgenerator = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  //internal functions:
  generateLabel, generateErrorLabel, generateTextField,
  generateSmallTextField, generateTextAreaField, generatePasswordField, 
  generateDateField, generateNumberField,

  //public functions:
  generateHeader, generateFooter, generateRow, 
  generateSelectRow, generateCheckboxRow, generateDateTimeRow, 
  generateButtonRow, generateDialog, generateActionDialog, 
  generateNumberFieldRow, getLoadingAnimation, showError,
  hideError, showHelpLayer, openHelpInNewWindow,
  generateSearchHelp;
  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/
  //Begin INTERNAL method /generateLabel/
  generateLabel = function (labelValue, labelClass, fieldId) {
    try {
      return '<div class="flabel"><label class="' + labelClass + '" for="' + fieldId + '">' + labelValue + '</label>&nbsp;</div>';
    } catch (e) {
      ema.shell.handleError('generateLabel', e, 'e');
    }
  };
  // End INTERNAL method /generateLabel/
  // Begin INTERNAL method /generateErrorLabel/
  generateErrorLabel = function (errorValue, errorLabelClass, fieldId, showErrorDiv) {
    try {
      var 
      retStr,
      contextHelpStr,
      strPartExternal,
      strPartContext;
      
      contextHelpStr = '';
      if (ema.shell.getConfigMapConfigValue('SHOWHELPIDS') === 'true') {
        contextHelpStr += '<div>ID: ' + fieldId + '</div>';
      }
      if (ema.shell.getConfigMapConfigValue('EXTERNALHELP') === 'true') {
        strPartExternal = ema.shell.getConfigMapExternalHelpValue(fieldId);
        if (strPartExternal !== '' && strPartExternal !== undefined) {
          contextHelpStr += '<div><a onclick="ema.formgenerator.showHelpLayer(\'' + strPartExternal + '\')"><i class="icon-help"></i></a></div>';
        }
      }
      if (ema.shell.getConfigMapConfigValue('CONTEXTHELP') === 'true') {
        strPartContext = ema.shell.getLanguageTextString('contexthelp', fieldId + '_ch');
        if (strPartContext !== fieldId + '_ch') {
          contextHelpStr += '<div class="' + fieldId + '_ch">' + strPartContext + '</div>';
        }
      }
      if (showErrorDiv === true) {
        retStr = '<div class="ferror ' + errorLabelClass + '" id="error_' + fieldId + '">' + errorValue + '</div>';
        retStr += '<div class="fcontext" id="context_' + fieldId + '" style="display:none">' + contextHelpStr + '</div>';
      } else {
        retStr = '<div class="ferror ' + errorLabelClass + '" id="error_' + fieldId + '" style="display:none">' + errorValue + '</div>';
        retStr += '<div class="fcontext" id="context_' + fieldId + '">' + contextHelpStr + '</div>';
      }
      return retStr;
    } catch (e) {
      ema.shell.handleError('generateErrorLabel', e, 'e');
    }
  };
  // End INTERNAL method /generateErrorLabel/
  // Begin INTERNAL method /generateTextField/
  generateTextField = function (fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder) {
    try {
      var strHtml;
      if (disabled === true) {
        //disabled fields cannot have js-events
        strHtml = '<input id="' + fieldId + '" class="tb_locked" ' + jsEvent + ' value="' + fieldValue + '" readonly></input>';
      } else {
        if (maxLength !== undefined) {
          strHtml = '<input id="' + fieldId + '" class="tb" ' + jsEvent + ' value="' + fieldValue + '" maxlength="' + maxLength + '"';
        } else {
          strHtml = '<input id="' + fieldId + '" class="tb" ' + jsEvent + ' value="' + fieldValue + '" ';
        }
        if (placeholder !== undefined) {
          strHtml += ' placeholder="' + placeholder + '" ';
        }
        strHtml += ' ></input>';
      }
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateTextField', e, 'e');
    }
  };
  // End INTERNAL method /generateTextField/
  // Begin INTERNAL method /generateSmallTextField/
  generateSmallTextField = function (fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder) {
    try {
      var strHtml;
      if (disabled === true) {
        //disabled fields cannot have js-events
        strHtml = '<input id="' + fieldId + '" class="tbs_locked" ' + jsEvent + ' value="' + fieldValue + '" readonly></input>';
      } else {
        if (maxLength !== undefined) {
          strHtml = '<input id="' + fieldId + '" class="tbs" ' + jsEvent + ' value="' + fieldValue + '" maxlength="' + maxLength + '"';
        } else {
          strHtml = '<input id="' + fieldId + '" class="tbs" ' + jsEvent + ' value="' + fieldValue + '" ';
        }
        if (placeholder !== undefined) {
          strHtml += ' placeholder="' + placeholder + '" ';
        }
        strHtml += ' ></input>';
      }
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateSmallTextField', e, 'e');
    }
  };
  // End INTERNAL method /generateSmallTextField/
  // Begin INTERNAL method /generateTextAreaField/
  generateTextAreaField = function (fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder) {
    try {
      var strHtml;
      if (disabled === true) {
        //disabled fields cannot have js-events
        strHtml = '<textarea id="' + fieldId + '" class="ta_locked" ' + jsEvent + ' readonly></input>';
      } else {
        if (maxLength !== undefined) {
          strHtml = '<textarea id="' + fieldId + '" class="ta" ' + jsEvent + ' maxlength="' + maxLength + '"';
        } else {
          strHtml = '<textarea id="' + fieldId + '" class="ta" ' + jsEvent;
        }
        if (placeholder !== undefined) {
          strHtml += ' placeholder="' + placeholder + '" ';
        }
        strHtml += ' >' + fieldValue + '</textarea>';
      }
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateTextAreaField', e, 'e');
    }
  };
  // End INTERNAL method /generateTextAreaField/
  // Begin INTERNAL method /generatePasswordField/
  generatePasswordField = function (fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder) {
    try {
      var strHtml;
      if (disabled === true) {
        //disabled fields cannot have js-events
        strHtml = '<input id="' + fieldId + '" type="password" class="tb_locked" ' + jsEvent + ' value="' + fieldValue + '" readonly></input>';
      } else {
        if (maxLength !== undefined) {
          strHtml = '<input id="' + fieldId + '" type="password" class="tb" ' + jsEvent + ' value="' + fieldValue + '" maxlength="' + maxLength + '"';
        } else {
          strHtml = '<input id="' + fieldId + '" type="password" class="tb" ' + jsEvent + ' value="' + fieldValue + '" ';
        }
        if (placeholder !== undefined) {
          strHtml += ' placeholder="' + placeholder + '" ';
        } else {
          strHtml += ' placeholder="&#XE81C;" ';
        }
        strHtml += ' ></input>';
      }
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generatePasswordField', e, 'e');
    }
  };
  // End INTERNAL method /generatePasswordField/
  // Begin INTERNAL method /generateDateField/
  generateDateField = function (fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder) {
    try {
      var strHtml;
      if (disabled === true) {
        //disabled fields cannot have js-events
        strHtml = '<input id="' + fieldId + '" type="date" class="tb_locked" ' + jsEvent + ' value="' + fieldValue + '" readonly></input>';
      } else {
        if (maxLength !== undefined) {
          strHtml = '<input id="' + fieldId + '" type="date" class="tb" ' + jsEvent + ' value="' + fieldValue + '" maxlength="' + maxLength + '"';
        } else {
          strHtml = '<input id="' + fieldId + '" type="date" class="tb" ' + jsEvent + ' value="' + fieldValue + '" ';
        }
        if (placeholder !== undefined) {
          strHtml += ' placeholder="' + placeholder + '" ';
        } else {
          strHtml += ' placeholder="&#XE846;" ';
        }
        strHtml += ' ></input>';
      }
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateDateField', e, 'e');
    }
  };
  // End INTERNAL method /generateDateField/
  // Begin INTERNAL method /generateNumberField/
  generateNumberField = function (fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder) {
    try {
      var strHtml;
      if (disabled === true) {
        //disabled fields cannot have js-events
        strHtml = '<input id="' + fieldId + '" type="number" class="tb_locked" ' + jsEvent + ' value="' + fieldValue + '" readonly></input>';
      } else {
        if (maxLength !== undefined) {
          strHtml = '<input id="' + fieldId + '" type="number" class="tb" ' + jsEvent + ' value="' + fieldValue + '" maxlength="' + maxLength + '"';
        } else {
          strHtml = '<input id="' + fieldId + '" type="number" class="tb" ' + jsEvent + ' value="' + fieldValue + '" ';
        }
        if (placeholder !== undefined) {
          strHtml += ' placeholder="' + placeholder + '" ';
        }
        strHtml += ' ></input>';
      }
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateNumberField', e, 'e');
    }
  };
//End INTERNAL method /generateNumberField/
  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
//Begin PUBLIC method /generateHeader/
  generateHeader = function (headerText, headerLabel, firstColValue, firstColClass, lastColValue, lastColClass) {
    try {
      var strHtml = '';

      strHtml += '<div class="w100p h20"></div>';
      strHtml += '<div class="w100p">';
      strHtml += '<div class="hlabel label ' + firstColClass + '">' + firstColValue + '&nbsp;</div>';
      strHtml += '<div class="hcontent b c ' + headerLabel + '">' + headerText + '</div>';
      strHtml += '<div class="herror ' + lastColClass + '">' + lastColValue + '&nbsp;</div>';
      strHtml += '</div>';
      strHtml += '<div class="w100p h20"></div>';

      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateHeader', e, 'e');
    }
  };
//End PUBLIC method /generateHeader/
//Begin PUBLIC method /generateFooter/
  generateFooter = function (showCancel, showReset, functionReset, showOkButton, labelOkButton, functionOkButton) {
    try {
      var strHtml = '';
      if (showCancel === true) {
        strHtml += '<div class="fbnok"><button class="button_nok w100p lblimgcancel" onclick="ema.shell.historyBack();"></button></div>';
      } else {
        strHtml += '<div class="fbnok">&nbsp;</div>';
      }
      if (showReset === true) {
        strHtml += '<div class="fbnok"><button class="button_nok w100p lblimgreset" onclick="' + functionReset + '"></button></div>';
      } else {
        strHtml += '<div class="fbnok">&nbsp;</div>';
      }
      if (showOkButton === true) {
        strHtml += '<div class="fbok"><button class="button_ok w100p ' + labelOkButton + '" onclick="' + functionOkButton + '"></button></div>';
      } else {
        strHtml += '<div class="fbok">&nbsp;</div>';
      }
      $('#footerbutton').html(strHtml);
    } catch (e) {
      ema.shell.handleError('generateFooter', e, 'e');
    }
  };
//End PUBLIC method /generateFooter/
//Begin PUBLIC method /generateRow/
  generateRow = function (fieldType, fieldId, fieldValue, jsEvent, disabled, labelValue, labelClass, errorValue, errorLabelClass, showErrorDiv, maxLength, placeholder) {
    try {
      var strHtml = '';

      strHtml += '<div class="w100p">';
      strHtml += generateLabel(labelValue, labelClass, fieldId);
      if (fieldType === 'empty' || fieldType === 'emptylow') {
        strHtml += '<div class="fcontent" id="' + fieldId + '">' + fieldValue + '&nbsp;</div>';
      } else {
        strHtml += '<div class="fcontent">';
        if (fieldType === 'text' || fieldType === 'textlow') {
          strHtml += generateTextField(fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder);
        } else if (fieldType === 'textsmall') {
          strHtml += generateSmallTextField(fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder);
        } else if (fieldType === 'textarea') {
          strHtml += generateTextAreaField(fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder);
        } else if (fieldType === 'password') {
          strHtml += generatePasswordField(fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder);
        } else if (fieldType === 'date' || fieldType === 'datelow') {
          strHtml += generateDateField(fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder);
        } else if (fieldType === 'number') {
          strHtml += generateNumberField(fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder);
        }
        strHtml += '</div>';
      }
      strHtml += generateErrorLabel(errorValue, errorLabelClass, fieldId, showErrorDiv);
      strHtml += '</div>';
      if (fieldType !== 'emptylow' && fieldType !== 'textlow' && fieldType !== 'datelow') {
        strHtml += '<div class="w100p h20"></div>';
      }

      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateRow', e, 'e');
    }
  };
//End PUBLIC method /generateRow/
//Begin PUBLIC method /generateSelectRow/
  generateSelectRow = function (fieldId, fieldValue, selection, jsEvent, disabled, labelValue, labelClass, errorValue, errorLabelClass, showErrorDiv) {
    try {
      var 
      strHtml = '',
      entry = '';

      strHtml += '<div class="w100p">';
      strHtml += generateLabel(labelValue, labelClass, fieldId);
      strHtml += '<div class="fcontent">';
      if (disabled === true) {
        //disabled fields cannot have js-events
        strHtml += '<select name="' + fieldId + '" id="' + fieldId + '" class="select" ' + jsEvent + ' disabled>';
      } else {
        strHtml += '<select name="' + fieldId + '" id="' + fieldId + '" class="select" ' + jsEvent + ' >';
      }
      strHtml += '<option value="">' + ema.shell.getLanguageTextString('allgemein', 'lblselect') + '</option>';
      for (entry  in selection) {
        if (selection.hasOwnProperty(entry)) {
          strHtml += '<option value="' + entry + '" ';
          if (fieldValue === entry) {
            strHtml += ' selected ';
          }
          strHtml += '>' + selection[entry] + '</option>';
        }
      }
      strHtml += '</select>';
      strHtml += '</div>';
      strHtml += generateErrorLabel(errorValue, errorLabelClass, fieldId, showErrorDiv);
      strHtml += '</div>';
      strHtml += '<div class="w100p h20"></div>';

      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateSelectRow', e, 'e');
    }
  };
//End PUBLIC method /generateSelectRow/
//Begin PUBLIC method /generateCheckboxRow/
  generateCheckboxRow = function (fieldId, fieldValues, selection, jsEvent, disabled, labelValue, labelClass, errorValue, errorLabelClass, showErrorDiv) {
    try {
      var
      i,
      j,
      entry = '',
      strHtml = '';

      strHtml += '<div class="w100p">';

      i = 0;
      for (entry  in selection) {
        if (selection.hasOwnProperty(entry)) {
          if (i > 0) {
            strHtml += '<div class="w100p h10"></div>';
          }
          strHtml += generateLabel(labelValue, labelClass, fieldId + i);
          strHtml += '<div class="fcontent">';

          strHtml += '<input name="' + fieldId + '" class="css-checkbox" id="' + fieldId + i + '" value="' + entry + '" type="checkbox" ' + jsEvent;
          for (j = 0; j < fieldValues.length; j += 1) {
            if (fieldValues[j] === entry) {
              strHtml += ' checked ';
            }
          }
          if (disabled === true) {
            strHtml += ' disabled ';
          }
          strHtml += '><label class="css-label" for="' + fieldId + i + '">' + selection[entry] + '</label>';
          strHtml += '</div>';
          strHtml += generateErrorLabel(errorValue, errorLabelClass, fieldId, showErrorDiv);
          if (i === 0) {
            labelClass = '';
            labelValue = '';
            errorLabelClass = '';
            errorValue = '';
          }
          i += 1;
        }
      }
      strHtml += '</div>';
      strHtml += '<div class="w100p h20"></div>';


      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateCheckboxField', e, 'e');
    }
  };
//End PUBLIC method /generateCheckboxRow/
//Begin INTERNAL method /generateDateTimeRow/
  generateDateTimeRow = function (fieldId, dateValue, timeValue, jsEvent, disabled, labelValue, labelClass, errorValue, errorLabelClass, showErrorDiv, datePlaceholder, timePlaceholder) {
    try {
      var strHtml = '';

      strHtml += '<div class="w100p">';
      strHtml += generateLabel(labelValue, labelClass, fieldId + '_date');
      strHtml += '<div class="fcontent">';
      
      if (datePlaceholder === undefined) {
        datePlaceholder = '&#XE846;';
      }
      if (timePlaceholder === undefined) {
        timePlaceholder = '&#XE850;';
      }
      if (disabled === true) {
        //disabled fields cannot have js-events
        strHtml += '<div class="w55p"><input id="' + fieldId + '_date" type="date" class="tb_locked" ' + jsEvent + ' value="' + dateValue + '" readonly></input></div>';
        strHtml += '<div class="w5p">&nbsp;</div>';
        strHtml += '<div class="w40p"><input id="' + fieldId + '_time" type="time" class="tb_locked" ' + jsEvent + ' value="' + timeValue + '" readonly></input></div>';
      } else {
        strHtml += '<div class="w55p"><input id="' + fieldId + '_date" type="date" class="tb" ' + jsEvent + ' value="' + dateValue + '" placeholder="' + datePlaceholder + '"></input></div>';
        strHtml += '<div class="w5p">&nbsp;</div>';
        strHtml += '<div class="w40p"><input id="' + fieldId + '_time" type="time" class="tb" ' + jsEvent + ' value="' + timeValue + '" placeholder="' + timePlaceholder + '"></input></div>';
      }
      
      strHtml += '</div>';
      strHtml += generateErrorLabel(errorValue, errorLabelClass, fieldId, showErrorDiv);
      strHtml += '</div>';
      strHtml += '<div class="w100p h20"></div>';

      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateDateTimeRow', e, 'e');
    }
  };
//End INTERNAL method /generateDateTimeRow/
//Begin PUBLIC method /generateButtonRow/
  generateButtonRow = function (fieldId, fieldValue, jsEvent, disabled, labelValue, labelClass, errorValue, errorLabelClass, showErrorDiv, maxLength, placeholder, buttonText, buttonFunction) {
    try {
      var strHtml = '';

      strHtml += '<div class="w100p">';
      strHtml += generateLabel(labelValue, labelClass, fieldId);
      strHtml += '<div class="fcontent">';
      strHtml += '<div class="w90p">';
      strHtml += generateTextField(fieldId, fieldValue, jsEvent, disabled, maxLength, placeholder);
      strHtml += '</div>';
      strHtml += '<div class="w10p">';
      strHtml += '<button onclick="' + buttonFunction + ';" class="tbg">' + buttonText + '</button>';
      strHtml += '</div>';
      strHtml += '</div>';
      strHtml += generateErrorLabel(errorValue, errorLabelClass, fieldId, showErrorDiv);
      strHtml += '</div>';
      strHtml += '<div class="w100p h20"></div>';

      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateRow', e, 'e');
    }
  };
//End PUBLIC method /generateButtonRow/
//Begin PUBLIC method /generateDialog/
  /*
   * generates a dialog for displaying information - dialog is hidden on click
   */
  generateDialog = function (dialogId, dialogContent) {
    try {
      var strHtml;
      
      strHtml = '<div id="' + dialogId + '" class="hidden">'; 
      strHtml += '<div class="overlayinner">';
      strHtml += '<div class="hcontent overlaycontent w50p" onclick="ema.shell.showDialog(\'' + dialogId + '\')" class="tbg">' + dialogContent + '</div>';
      strHtml += '</div>';
      strHtml += '</div>';
      
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateDialog', e, 'e');
    }
  };
  //End PUBLIC method /generateDialog/
  //Begin PUBLIC method /generateActionDialog/
  /*
   * generates a dialog for user action - this dialog is not hidden on click
   */
  generateActionDialog = function (dialogId, dialogContent, label, cssClass) {
    try {
      var strHtml;
      if (cssClass === undefined || cssClass === '') {
        cssClass = 'w50p';
      }
      strHtml = '<div id="' + dialogId + '" class="hidden">'; 
      strHtml += '<div class="overlayinner">'; 
      strHtml += '<div class="hcontent overlaycontent ' + cssClass + '">';
      strHtml += '<div class="w80p overlayhead">&nbsp;' + label + '</div>';
      strHtml += '<div class="w20p overlayhead r"><button onclick="ema.shell.showDialog(\'' + dialogId + '\')" class="tbg"><i class="icon-cancel"></i></button></div>';
      strHtml += dialogContent;
      strHtml += '</div>';
      strHtml += '</div>';
      strHtml += '</div>';

      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateActionDialog', e, 'e');
    }
  };
  //End PUBLIC method /generateActionDialog/
  // Begin PUBLIC method /generateNumberField/
  generateNumberFieldRow = function (fieldId, fieldValue, kommastellen, jsEvent, disabled, labelValue, labelClass, errorValue, errorLabelClass, showErrorDiv) {
    try {
      var strHtml;
      strHtml = '<div class="w100p">';
      strHtml += generateLabel(labelValue, labelClass, fieldId);

      strHtml += '<div class="fcontent">';

      if (disabled === true) {
        //disabled fields cannot have js-events
        strHtml += '<input id="' + fieldId + '" type="number" class="tb_locked" onkeyup="ema.model.validateNumericInput(this.id, \'' + kommastellen + '\')" onblur="ema.model.validateNumericInput(this.id, \'' + kommastellen + '\')" ' + jsEvent + ' value="' + fieldValue + '" readonly></input>';
      } else {
        strHtml += '<input id="' + fieldId + '" type="number" class="tb" onkeyup="ema.model.validateNumericInput(this.id, \'' + kommastellen + '\')" onblur="ema.model.validateNumericInput(this.id, \'' + kommastellen + '\')" ' + jsEvent + ' value="' + fieldValue + '"></input>';
      }

      strHtml += '</div>';
      strHtml += generateErrorLabel(errorValue, 'lblerror' + kommastellen + 'decimalplaces', fieldId, showErrorDiv);
      strHtml += '</div>';
      strHtml += '<div class="w100p h20"></div>';
      
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateNumberField', e, 'e');
    }
  };
  //End PUBLIC method /generateNumberField/
  // Begin PUBLIC method /getLoadingAnimation/
  getLoadingAnimation = function (animSize, getAnimOnly) {
    try {
      var strHtml;
      
      strHtml = '';
      if (getAnimOnly === false) {
        strHtml += '<div class="w100p mhcontent">';
        strHtml += '<div class="w100p h100"></div>';
        strHtml += '<div class="w100p c">';
      }
      if (animSize === 'large') {
        strHtml += '<div class="large progress w100p"><div class="w100p"><img src="' + ema.shell.getConfigMapConfigValue('COREPATH') + 'ressources/css/images/loader_grey.gif"></img></div></div>';
      } else if (animSize === 'medium') {
        strHtml += '<div class="progress"><div>Loading�</div></div>';
      } else {
        strHtml = '<div class="small progress"><div>Loading�</div></div>';
      }
      if (getAnimOnly === false) {
        strHtml += '</div>';
        strHtml += '</div>';
      }
      
      return strHtml;
    } catch (e) {
      ema.shell.handleError('getLoadingAnimation', e, 'e');
    }
  };
  //End PUBLIC method /getLoadingAnimation/
  // Begin PUBLIC method /showError/
  showError = function (fieldId) {
    try {
      $('#error_' + fieldId).show();
      $('#context_' + fieldId).hide();
    } catch (e) {
      ema.shell.handleError('showError', e, 'e');
    }
  };
//End PUBLIC method /showError/
  // Begin PUBLIC method /hideError/
  hideError = function (fieldId) {
    try {
      $('#error_' + fieldId).hide();
      $('#context_' + fieldId).show();
    } catch (e) {
      ema.shell.handleError('hideError', e, 'e');
    }
  };
//End PUBLIC method /hideError/
  // Begin PUBLIC method /showHelpLayer/
  showHelpLayer = function (uri) {
    try {
      $('#ema_external_help_frame').attr('src', uri);
      ema.shell.showDialog('ema_external_help');
    } catch (e) {
      ema.shell.handleError('showHelpLayer', e, 'e');
    }
  };
//End PUBLIC method /showHelpLayer/
// Begin PUBLIC method /openHelpInNewWindow/
  openHelpInNewWindow = function () {
    try {
      window.open($('#ema_external_help_frame').attr('src'), '_new');
      ema.shell.showDialog('ema_external_help');
    } catch (e) {
      ema.shell.handleError('openHelpInNewWindow', e, 'e');
    }
  };
//End PUBLIC method /openHelpInNewWindow/
  // Begin Public method /generateSearchHelp/
  generateSearchHelp = function (fieldId, jsFunction, btnLabel, searchParamList) {
    try {
      var
      entry,
      strHtml;
      
      strHtml = '<div class="w100p">';
      strHtml += '<div class="w30p">&nbsp;</div>'; 
      strHtml += '<div class="w60p labelsmall">';
      strHtml += 'Suche:';
      for (entry in searchParamList) {
        if (searchParamList.hasOwnProperty(entry)) {
          strHtml += entry + '/<a onclick="ema.model.addSearchParameter(\'' + fieldId + '\', \'' + searchParamList[entry] + '\');">' + searchParamList[entry] + '</a>, '; 
        }
      }
      strHtml += '</div></div>';

      strHtml += generateRow('empty', fieldId + '_selectButton', '<button onclick="' + jsFunction + '" class="tbg button_load ' + btnLabel + '"><i class="icon-down"></i></button>', '', false, '', '', '', '', false);
      
      return strHtml;
      
    } catch (e) {
      ema.shell.handleError('ema_generateSearchHelp', e, 'e');
    }
  };
  // End PUBLIC method /generateSearchHelp/

  return { 
    generateHeader : generateHeader,
    generateFooter : generateFooter,
    generateRow : generateRow,
    generateSelectRow : generateSelectRow,
    generateCheckboxRow : generateCheckboxRow,
    generateDateTimeRow : generateDateTimeRow,
    generateButtonRow : generateButtonRow,
    generateDialog : generateDialog,
    generateActionDialog : generateActionDialog,
    generateNumberFieldRow : generateNumberFieldRow,
    getLoadingAnimation : getLoadingAnimation,
    showError : showError,
    hideError : hideError,
    showHelpLayer : showHelpLayer,
    openHelpInNewWindow : openHelpInNewWindow,
    generateSearchHelp : generateSearchHelp
  };
//------------------- END PUBLIC METHODS ---------------------
}());
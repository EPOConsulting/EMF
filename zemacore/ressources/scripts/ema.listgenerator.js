/*
 * ema.listgenerator.js
 * listgenerator module
 */
ema.listgenerator = (function () {
  'use strict';
  /** Variables ************************************************************************************************************************************************************************************************/
  var
  
  listDataCollection = {},
  
  //internal functions
  generateColumn, generateSubColumn, generateEmptyColumn, 
  generateShowHideButton, generateSortColumn, generateEmptySortColumn,
  sortListData, generateSortAndSearchFields, compareRowToSearch,
  generateSortedList, getMatchingSort,

  // public functions
  generateRow, generateSumRow, generateHeader, 
  initializeSortedList, sortList, searchList, 
  addRowToSortedList, editRowInSortedList, removeRowFromSortedList,
  deleteListData;

  /** INTERNAL FUNCTIONS**********************************************************************************************************************************************/
  //Begin INTERNAL method /generateColumn/
  generateColumn = function (columnWidth, columnLabel, columnValues, columnStyle, addStyle, drawLabels) {
    try {
      var strHtml = '';

      if (columnValues === '') {
        columnValues = '&nbsp;';
      }
      strHtml = '<div class="w' + columnWidth + 'p dbr' + addStyle + '">';
      if (drawLabels !== false) {
        strHtml += '<div class="cellheader ' + columnLabel + '" >&nbsp;</div>';
        strHtml += '<div class="cell ' + columnStyle + '" >' + columnValues + '</div>';
      } else {
        strHtml += '<div class="cellsmall ' + columnStyle + '" >' + columnValues + '</div>';
      }
      strHtml += '</div>';
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateColumn', e, 'e');
    }
  };
  //End INTERNAL method /generateColumn/
  //Begin INTERNAL method /generateSubColumn/
  generateSubColumn = function (columnWidth, columnLabel, columnValues, lastEntry, lastRow, drawLabels) {
    try {
      var strHtml = '';

      strHtml = '<div class="w' + columnWidth + 'p';
      if (lastEntry === false) {
        strHtml += ' dbr';
      }
      if (lastRow === false) {
        strHtml += ' dbb';
      }
      strHtml += '">';
      if (drawLabels !== false) {
        strHtml += '<div class="cellheader ' + columnLabel + ' greybg" >&nbsp;</div>';
        strHtml += '<div class="cell greybg" >' + columnValues + '&nbsp;</div>';
      } else {
        strHtml += '<div class="cellsmall greybg" >' + columnValues + '&nbsp;</div>';
      }
      strHtml += '</div>';
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateSubColumn', e, 'e');
    }
  };
  //End INTERNAL method /generateSubColumn/
  //Begin INTERNAL method /generateEmptyColumn/
  generateEmptyColumn = function (columnWidth, addStyle, drawLabels) {
    try {
      var strHtml = '';

      if (drawLabels !== false) {
        strHtml = '<div class="w' + columnWidth + 'p h46' + addStyle + '">&nbsp;</div>';
      } else {
        strHtml = '<div class="w' + columnWidth + 'p h92' + addStyle + '">&nbsp;</div>';
      }
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateEmptyColumn', e, 'e');
    }
  };
  //End INTERNAL method /generateEmptyColumn/
  //Begin INTERNAL method /generateShowHideButton/
  generateShowHideButton = function (sectionId, subCount, drawLabels) {
    try {
      var strHtml = '';
      if (subCount > 0 || subCount !== '') {
        strHtml = '<div class="w5p">';
        if (drawLabels !== false) {
          strHtml += '<div class="cellheader" >' + subCount + '</div>';
          strHtml += '<div class="cell" ><button onclick="ema.shell.showHideSection(\'' + sectionId + '\')" class="tbg"><i class="icon-angle-up" id="button' + sectionId + '"></i></button></div>';
        } else {
          strHtml += '<div class="cellsmall" ><button onclick="ema.shell.showHideSection(\'' + sectionId + '\')" class="tbg"><i class="icon-angle-up" id="button' + sectionId + '"></i></button></div>';
        }
        strHtml += '</div>';
      } else {
        strHtml = '<div class="w5p">';
        if (drawLabels !== false) {
          strHtml += '<div class="cellheader">&nbsp;</div>';
          strHtml += '<div class="cell" ><button onclick="ema.shell.showHideSection(\'' + sectionId + '\')" class="tbg"><i class="icon-angle-up" id="button' + sectionId + '"></i></button></div>';
        } else {
          strHtml += '<div class="cellsmall" ><button onclick="ema.shell.showHideSection(\'' + sectionId + '\')" class="tbg"><i class="icon-angle-up" id="button' + sectionId + '"></i></button></div>';
        }
        strHtml += '</div>';
      }
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateShowHideButton', e, 'e');
    }
  };
  //End INTERNAL method /generateShowHideButton/
  //Begin INTERNAL method /generateSortColumn/
  generateSortColumn = function (columnWidth, columnSearch, columnSearchValue, columnSearchId, path, columnNo, icon, addClass) {
    try {
      var strHtml = '';
      
      strHtml = '<div class="w' + columnWidth + 'p dbr searchbar">';
      strHtml += '<div class="w100p"><button onclick="ema.listgenerator.sortList(\'' + path + '\', ' + columnNo + ', true);" class="tbg"><i class="icon-angle-' + icon + ' ' + addClass + '"></i></button></div>';
      if (columnSearch === true) {
        if (columnSearchId !== undefined) {
          strHtml += '<div class="w100p"><input class="sb" type="text" onkeyup="ema.listgenerator.searchList(\'' + path + '\', this.id, this.value);" id="' + columnSearchId + '" value="' + columnSearchValue + '"></div>';
        } else {
          strHtml += '<div class="w100p">&nbsp;</div>';
        }
      }
      strHtml += '</div>';
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateSortColumn', e, 'e');
    }
  };
  //End INTERNAL method /generateSortColumn/
  //Begin INTERNAL method /generateEmptySortColumn/
  generateEmptySortColumn = function (columnWidth, addStyle) {
    try {
      var strHtml = '';

      strHtml = '<div class="w' + columnWidth + 'p h46' + addStyle + '">&nbsp;</div>';
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateEmptySortColumn', e, 'e');
    }
  };
  //End INTERNAL method /generateEmptySortColumn/
  //Begin INTERNAL method /sortListData/
  sortListData = function (listData) {
    try {
      if (listData.sortType === 'asc') {
        listData.rows.sort(function (a, b) {
          if (a.columnValues[listData.sortColumn].toLowerCase() < b.columnValues[listData.sortColumn].toLowerCase()) {
            return -1;
          } else if (a.columnValues[listData.sortColumn].toLowerCase() > b.columnValues[listData.sortColumn].toLowerCase()) {
            return 1;
          } else {
            return 0;
          }
        });
      } else if (listData.sortType === 'desc') {
        listData.rows.sort(function (a, b) { 
          if (a.columnValues[listData.sortColumn].toLowerCase() < b.columnValues[listData.sortColumn].toLowerCase()) {
            return 1;
          } else if (a.columnValues[listData.sortColumn].toLowerCase() > b.columnValues[listData.sortColumn].toLowerCase()) {
            return -1;
          } else {
            return 0;
          }
        });
      } else if (listData.sortType === 'ascNum') {
        listData.rows.sort(function (a, b) { 
          return a.columnValues[listData.sortColumn] - b.columnValues[listData.sortColumn];
        });
      } else if (listData.sortType === 'descNum') {
        listData.rows.sort(function (a, b) { 
          return b.columnValues[listData.sortColumn] - a.columnValues[listData.sortColumn];
        });
      } else if (listData.sortType === 'ascDate') {
        listData.rows.sort(function (a, b) {
          var dateA, dateB;
          dateA = new Date(ema.model.generateJSDate(a.columnValues[listData.sortColumn]));
          dateB = new Date(ema.model.generateJSDate(b.columnValues[listData.sortColumn]));
          return dateA.getTime() - dateB.getTime();
        });
      } else if (listData.sortType === 'descDate') {
        listData.rows.sort(function (a, b) {
          var dateA, dateB;
          dateA = new Date(ema.model.generateJSDate(a.columnValues[listData.sortColumn]));
          dateB = new Date(ema.model.generateJSDate(b.columnValues[listData.sortColumn]));
          return dateB.getTime() - dateA.getTime();
        });
      }
      return listData;
    } catch (e) {
      ema.shell.handleError('sortListData', e, 'e');
    }
  };
  //End INTERNAL method /sortListData/
  //Begin INTERNAL method /generateSortAndSearchFields/
  generateSortAndSearchFields = function (listData) {
    try {
      var
      i,
      totalWidth = 0,
      strHtml = '',
      strRowIds = '';
      
      for (i = 0; i < listData.rows[0].columnValues.length; i += 1) {
        totalWidth += listData.columnWidth[i];
      }
      if (listData.hasHiddenSection === true) {
        strHtml += '<div class="w95p">';
      } else {
        strHtml += '<div class="w100p">';
      }
      for (i = 0; i < listData.rows.length; i += 1) {
        //RowIds merken
        if (strRowIds === '') {
          strRowIds = '\'' + listData.rows[i].rowId + '\'';
        } else {
          strRowIds += ', \'' + listData.rows[i].rowId + '\'';
        }
      }
      
      for (i = 0; i < listData.rows[0].columnValues.length; i += 1) {
        if (i === listData.sortColumn) {
          if (listData.sortType === 'desc' || listData.sortType === 'descNum' || listData.sortType === 'descDate') {
            strHtml += generateSortColumn(listData.columnWidth[i], listData.columnSearch, listData.columnSearchValues[i], listData.columnSearchIds[i], listData.path, i, 'down', 'black');
          } else {
            strHtml += generateSortColumn(listData.columnWidth[i], listData.columnSearch, listData.columnSearchValues[i], listData.columnSearchIds[i], listData.path, i, 'up', 'black');
          }
        } else if (listData.columnSorting[i] === 'no') {
          strHtml += generateEmptySortColumn(listData.columnWidth[i], ' dbr');
        } else if (listData.columnSorting[i] === 'desc' || listData.columnSorting[i] === 'descNum' || listData.columnSorting[i] === 'descDate') {
          strHtml += generateSortColumn(listData.columnWidth[i], listData.columnSearch, listData.columnSearchValues[i], listData.columnSearchIds[i], listData.path, i, 'down', 'grey');
        } else {
          strHtml += generateSortColumn(listData.columnWidth[i], listData.columnSearch, listData.columnSearchValues[i], listData.columnSearchIds[i], listData.path, i, 'up', 'grey');
        }
      }
      if (totalWidth < 100) {
        strHtml += generateEmptySortColumn(100 - totalWidth, '');
      }
      strHtml += '</div>';
      if (listData.hasHiddenSection === true) {
        strHtml += '<div class="w5p"><button onclick="ema.shell.showSections([' + strRowIds + ']);"><i class="icon-plus iconSmall"></i></button><button onclick="ema.shell.hideSections([' + strRowIds + ']);"><i class="icon-minus iconSmall"></i></button></div>';
      }
      
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateSortAndSearchFields', e, 'e');
    }
  };
  //End INTERNAL method /generateSortAndSearchFields/
  //Begin INTERNAL method /compareRowToSearch/
  compareRowToSearch = function (columnValues, columnSearchValues) {
    try {
      var 
      i,
      retVal;
      
      retVal = true;
      for (i = 0; i < columnValues.length; i += 1) {
        if (columnSearchValues[i] !== undefined && columnSearchValues[i] !== '') {
          if ((columnValues[i] + '').toLowerCase().indexOf(columnSearchValues[i].toLowerCase()) === -1) {
            retVal = false;
          }
        }
      }
     
      return retVal;
    } catch (e) {
      ema.shell.handleError('compareRowToSearch', e, 'e');
    }
  };
  //End INTERNAL method /compareRowToSearch/
  //Begin INTERNAL method /generateSortedList/
  generateSortedList = function (listData, drawRowsOnly) {
    try {
      var
      totalWidth,
      i,
      j,
      strHtml = '',
      searchFields = '';
      
      //sort list
      listData = sortListData(listData);
      
      if (drawRowsOnly !== true) {
        //create sorticons and searchfields
        strHtml += generateSortAndSearchFields(listData);
        
        strHtml += '<div class="w100p" id="' + listData.container + '_rows">';
      }
      j = 0;
      for (i = 0; i < listData.rows.length; i += 1) {
        if (compareRowToSearch(listData.rows[i].columnValues, listData.columnSearchValues) === true) {
          strHtml += generateRow(
              listData.rows[i].rowId, 
              listData.columnWidth, 
              listData.columnLabel, 
              listData.rows[i].columnValues, 
              listData.rows[i].columnStyles, 
              listData.rows[i].rowOnClick, 
              listData.hasHiddenSection, 
              listData.rows[i].subCount, 
              listData.hiddenColumnWidth, 
              listData.hiddenColumnLabel, 
              listData.rows[i].hiddenColumnValues, 
              listData.rows[i].customHiddenContent, 
              listData.rows[i].subColumns,
              listData.drawLabels,
              listData.alternateRowClass,
              j);
          j += 1;
        }
      }
      if (drawRowsOnly !== true) {
        strHtml += '</div>';
        if (listData.sumRow !== undefined) {
          for (i = 0; i < listData.sumRow.length; i += 1) {
            strHtml += generateSumRow(
                listData.columnWidth, 
                listData.sumRow[i].columnValues,
                listData.hasHiddenSection);
          }
        }
        
        $('#' + listData.container).html(strHtml);
      } else {
        $('#' + listData.container + '_rows').html(strHtml);
      }
      
      
    } catch (e) {
      ema.shell.handleError('generateSortedList', e, 'e');
    }
  };
  //End INTERNAL method /generateSortedList/
  //Begin INTERNAL method /getMatchingSort/
  getMatchingSort = function (sortType) {
    try {
      if (sortType === 'asc') {
        return 'desc';
      } else if (sortType === 'desc') {
        return 'asc';
      } else if (sortType === 'ascNum') {
        return 'descNum';
      } else if (sortType === 'descNum') {
        return 'ascNum';
      } else if (sortType === 'ascDate') {
        return 'descDate';
      } else if (sortType === 'descDate') {
        return 'ascDate';
      } else {
        return undefined;
      }
    } catch (e) {
      ema.shell.handleError('getMatchingSort', e, 'e');
    }
  };
  //End INTERNAL method /getMatchingSort/
  /** PUBLIC FUNCTIONS**********************************************************************************************************************************************/
  //Begin PUBLIC method /generateRow/
  generateRow = function (rowId, columnWidth, columnLabel, columnValues, columnStyles, rowOnClick, hasHiddenSection, subCount, hiddenColumnWidth, hiddenColumnLabel, hiddenColumnValues, customHiddenContent, subColumns, drawLabels, alternateRowClass, rowNumber) {
    try {
      var 
      i, 
      j, 
      strHtml = '',
      totalWidth = 0,
      hiddenRowTotalWidth = 0,
      subEntryTotalWidth = 0,
      lastSubRow = false;

      for (i = 0; i < columnValues.length; i += 1) {
        totalWidth += columnWidth[i];
      }
     
      //check if the row has more than 100% length
      if (totalWidth > 100) {
        ema.shell.handleCustomError('generateRow', 'errgeneraterow', 'w');
      }

      if (alternateRowClass !== undefined && (rowNumber % 2 === 0)) {
        strHtml = '<div class="w100p sbb"><div class="w100p ' + alternateRowClass + '" id="section' + rowId + '">';
      } else {
        strHtml = '<div class="w100p sbb"><div class="w100p" id="section' + rowId + '">';
      }
      if (hasHiddenSection === true) {
        strHtml += '<div class="w95p" ' + rowOnClick + '>';
      } else {
        strHtml += '<div class="w100p" ' + rowOnClick + '>';
      }

      for (i = 0; i < columnValues.length; i += 1) {
        strHtml += generateColumn(columnWidth[i], columnLabel[i], columnValues[i], columnStyles[i], '', drawLabels);
      }
      if (totalWidth < 100) {
        strHtml += generateEmptyColumn(100 - totalWidth, '', drawLabels);
      }
      strHtml += '</div>';
      if (hasHiddenSection === true) {
        strHtml += generateShowHideButton(rowId, subCount, drawLabels);
      }
      strHtml += '</div>';
      if (hasHiddenSection === true) {
        if (hiddenColumnValues !== undefined) {
          for (i = 0; i < hiddenColumnValues.length; i += 1) {
            hiddenRowTotalWidth += hiddenColumnWidth[i];
          }
          
          //check if the row has more than 100% length
          if (hiddenRowTotalWidth > 100) {
            ema.shell.handleCustomError('generateRow', 'errgeneraterow2', 'w');
          }
        }

        strHtml += '<div class="w100p" id="section' + rowId + '_hidden" style="display:none">';
        strHtml += '<div class="w95p">';
        if (hiddenColumnValues !== undefined) {
          for (i = 0; i < hiddenColumnValues.length; i += 1) {
            strHtml += generateColumn(hiddenColumnWidth[i], hiddenColumnLabel[i], hiddenColumnValues[i], ' dbb', '', drawLabels);
          }
          if (hiddenRowTotalWidth < 100) {
            strHtml += generateEmptyColumn(100 - hiddenRowTotalWidth, ' dbb', drawLabels);
          }
  
          if (customHiddenContent !== undefined) {
            strHtml += '<div class="w100p">' + customHiddenContent + '</div>';
          }
        }

        //generate Subrows
        if (subColumns !== undefined) {
          for (i = 0; i < subColumns.length; i += 1) {
            if (i + 1 === subColumns.length) {
              lastSubRow = true;
            }
            subEntryTotalWidth = 0;

            for (j = 0; j < subColumns[i].values.length; j += 1) {
              subEntryTotalWidth += subColumns[i].width[j];
            }

            //check if the row has more than 100% length
            if (subEntryTotalWidth > 100) {
              ema.shell.handleCustomError('generateRow', 'errgeneraterow', 'w');
            }

            strHtml += '<div class="w100p">' + generateEmptyColumn(5, '', drawLabels);
            for (j = 0; j < subColumns[i].values.length; j += 1) {
              if (j + 1 === subColumns[i].values.length) {
                strHtml += generateSubColumn(subColumns[i].width[j], subColumns[i].labels[j], subColumns[i].values[j], true, lastSubRow, drawLabels);
              } else {
                strHtml += generateSubColumn(subColumns[i].width[j], subColumns[i].labels[j], subColumns[i].values[j], false, lastSubRow, drawLabels);
              }
            }
            strHtml += generateEmptyColumn(5, '', drawLabels) + '</div>';
          }
        }
        strHtml += '</div>';
        if (hiddenColumnValues !== undefined) {
          strHtml += generateEmptyColumn(5, ' dbb', drawLabels);
        }
        strHtml += '</div>';
      }
      strHtml += '</div>';
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateRow', e, 'e');
    }
  };
  //End PUBLIC method /generateRow/
  //Begin PUBLIC method /generateSumRow/
  generateSumRow = function (columnWidth, columnValues, hasHiddenSection) {
    try {
      var 
      i, 
      j, 
      strHtml = '',
      totalWidth = 0,
      hiddenRowTotalWidth = 0,
      subEntryTotalWidth = 0,
      lastSubRow = false;
      
      for (i = 0; i < columnValues.length; i += 1) {
        totalWidth += columnWidth[i];
      }
      
      //check if the row has more than 100% length
      if (totalWidth > 100) {
        ema.shell.handleCustomError('generateRow', 'errgeneraterow', 'w');
      }
      
      strHtml = '<div class="w100p sbb">';
      if (hasHiddenSection === true) {
        strHtml += '<div class="w95p">';
      } else {
        strHtml += '<div class="w100p">';
      }
      
      for (i = 0; i < columnValues.length; i += 1) {
        strHtml += '<div class="w' + columnWidth[i] + 'p dbr">';
        strHtml += '<div class="sum" >' + columnValues[i] + '&nbsp;</div>';
        strHtml += '</div>';
      }
      if (totalWidth < 100) {
        strHtml += '<div class="w' + 100 - totalWidth + 'p sum">&nbsp;</div>';
      }
      strHtml += '</div>';
      if (hasHiddenSection === true) {
        strHtml += '<div class="w5p sum">&nbsp;</div>';
      }
      strHtml += '</div>';
      strHtml += '</div>';
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateSumRow', e, 'e');
    }
  };
  //End PUBLIC method /generateSumRow/
  //Begin PUBLIC method /generateHeader/
  generateHeader = function (headerText, headerLabel, onChangeFunction, divId) {
    try {
      var strHtml = '';
      strHtml += '<div class="mhcontent">';
      if (headerText !== '' || headerLabel !== '') {
        strHtml += '<div class="w100p h20"></div>';
        strHtml += '<div class="hlabel">&nbsp;</div>';
        strHtml += '<div class="hcontent b c ' + headerLabel + '">' + headerText + '</div>';
        if (onChangeFunction !== '') {
          strHtml += '<div class="herror r"><button onclick="' + onChangeFunction + '();" class="tbg"><i class="icon-arrows-cw"></i></button></div>';
        } else {
          strHtml += '<div class="herror">&nbsp;</div>';
        }
        strHtml += '<div class="w100p h20"></div>';
      }
      strHtml += '<div class="w100p" id="' + divId + '">';
      strHtml += '</div>';
      strHtml += '</div>';
      return strHtml;
    } catch (e) {
      ema.shell.handleError('generateHeader', e, 'e');
    }
  };
  //End PUBLIC method /generateHeader/
  //Begin PUBLIC method /initializeSortedList/
  initializeSortedList = function (listData) {
    try {
      if (listData.rows.length > 0) {
        listDataCollection[listData.path] = listData;
        sortList(listData.path, listData.sortColumn, false);
      } else {
        $('#' + listData.container).html(ema.shell.getLanguageTextString('errors', 'errnoentries'));
      }
    } catch (e) {
      ema.shell.handleError('initializeSortedList', e, 'e');
    }
  };
  //End PUBLIC method /initializeSortedList/
  //Begin PUBLIC method /sortList/
  sortList = function (path, columnNo, drawRowsOnly) {
    try {
      //switch sorting
      if (getMatchingSort(listDataCollection[path].columnSorting[columnNo]) !== undefined) {
        listDataCollection[path].columnSorting[columnNo] = getMatchingSort(listDataCollection[path].columnSorting[columnNo]);
        listDataCollection[path].sortType = listDataCollection[path].columnSorting[columnNo];
        listDataCollection[path].sortColumn = columnNo;
        
        generateSortedList(listDataCollection[path], drawRowsOnly);
                
        ema.model.loadLanguagePattern(ema.shell.getStateMapValue('selected_language'));
      }
    } catch (e) {
      ema.shell.handleError('sortList', e, 'e');
    }
  };
  //End PUBLIC method /sortList/
  //Begin PUBLIC method /searchList/
  searchList = function (path, elemId, elemValue) {
    try {
      var 
      i,
      elem;
      
      for (i = 0; i < listDataCollection[path].columnSearchIds.length; i += 1) {
        if (elemId === listDataCollection[path].columnSearchIds[i]) {
          listDataCollection[path].columnSearchValues[i] = elemValue;

          generateSortedList(listDataCollection[path], true);

          elem = $('#' + elemId);
          elem.focus();
          elem[0].setSelectionRange(elem.val().length, elem.val().length);
          
          ema.model.loadLanguagePattern(ema.shell.getStateMapValue('selected_language'));
        }
      }
    } catch (e) {
      ema.shell.handleError('searchList', e, 'e');
    }
  };
  //End PUBLIC method /searchList/
  //Begin PUBLIC method /addRowToSortedList/
  addRowToSortedList = function (row, path) {
    try {
      if (listDataCollection[path] !== undefined) {
        listDataCollection[path].rows[listDataCollection[path].rows.length] = row;
        generateSortedList(listDataCollection[path], true);
      }
    } catch (e) {
      ema.shell.handleError('addRowToSortedList', e, 'e');
    }
  };
  //End PUBLIC method /addRowToSortedList/
  //Begin PUBLIC method /editRowInSortedList/
  editRowInSortedList = function (path, rowId, columnValues, hiddenColumnValues) {
    try {
      var i;
      if (listDataCollection[path] !== undefined) {
        for (i = 0; i < listDataCollection[path].rows.length; i += 1) {
          if (listDataCollection[path].rows[i].rowId === rowId) {
            listDataCollection[path].rows[i].columnValues = columnValues;
            listDataCollection[path].rows[i].hiddenColumnValues = hiddenColumnValues;
            generateSortedList(listDataCollection[path], true);
          }
        }
      }
    } catch (e) {
      ema.shell.handleError('editRowInSortedList', e, 'e');
    }
  };
  //End PUBLIC method /editRowInSortedList/
  //Begin PUBLIC method /removeRowFromSortedList/
  removeRowFromSortedList = function (rowId, path) {
    try {
      var i;
      
      if (listDataCollection[path] !== undefined) {
        for (i = 0; i < listDataCollection[path].rows.length; i += 1) {
          if (listDataCollection[path].rows[i].rowId === rowId) {
            listDataCollection[path].rows.splice(i, 1);
          }
        }
        generateSortedList(listDataCollection[path], true);
      }
    } catch (e) {
      ema.shell.handleError('removeRowFromSortedList', e, 'e');
    }
  };
  //End PUBLIC method /removeRowFromSortedList/
  //Begin PUBLIC method /deleteListData/
  deleteListData = function () {
    try {
      var entry;
      for (entry  in listDataCollection) {
        if (listDataCollection.hasOwnProperty(entry)) {
          if (listDataCollection[entry].preventDeletion !== true) {
            delete listDataCollection[entry]; 
          }
        }
      }
    } catch (e) {
      ema.shell.handleError('deleteListData', e, 'e');
    }
  };
  //End PUBLIC method /deleteListData/
  
  return { 
    generateRow : generateRow,
    generateSumRow : generateSumRow,
    generateHeader : generateHeader,
    initializeSortedList : initializeSortedList,
    sortList : sortList,
    searchList : searchList,
    addRowToSortedList : addRowToSortedList,
    editRowInSortedList : editRowInSortedList,
    removeRowFromSortedList : removeRowFromSortedList,
    deleteListData : deleteListData
  };
}());
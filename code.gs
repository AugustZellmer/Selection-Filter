const DIR_KEY = "orientaion"
const ROW_DIR = "row";
const COLUMN_DIR = "column";


function onInstall(){
  onOpen();
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createAddonMenu()
    .addItem('Filter Out Rows', 'mainProcedureRows')
    .addItem('Filter Out Columns', 'mainProcedureColumns')
    .addItem('Clear Filters', 'unhideAll')
    .addToUi();
}




function mainProcedureRows(){
  const valid = validateRowInput();
  if(!valid){
    SpreadsheetApp.getUi().alert("Your selection must include multiple rows so that some of the selected rows can be filtered out.")
    return;
  }
  PropertiesService.getScriptProperties().setProperty(DIR_KEY, ROW_DIR);
  openPopup();
}




function mainProcedureColumns(){
  const valid = validateColumnInput();
  if(!valid){
    SpreadsheetApp.getUi().alert("Your selection must include multiple columns so that some of the selected columns can be filtered out.")
    return;
  }
  PropertiesService.getScriptProperties().setProperty(DIR_KEY, COLUMN_DIR);
  openPopup();
}




function validateRowInput(){
  const rangeList = SpreadsheetApp.getActive().getActiveRangeList();
  if(rangeList === null){
    SpreadsheetApp.getUi().alert("No range selected. I didn't think this was possible.");
  }
  const ranges = rangeList.getRanges();
  
  for(const range of ranges){
    if(range.getNumRows() > 1){
      return true;
    }
  }
  
  if(ranges.length == 1){
    return false;
  }
  
  const rowIndexOfFirstRange = ranges[0].getRow();
  for(var i = 1; i < ranges.length; i++){
    const rowIndexOfCurrentRange = ranges[i].getRow();
    if(rowIndexOfFirstRange !== rowIndexOfCurrentRange){
      return true;
    }
  }
  return false;
}




function validateColumnInput(){
  const rangeList = SpreadsheetApp.getActive().getActiveRangeList();
  if(rangeList === null){
    SpreadsheetApp.getUi().alert("No range selected. I didn't think this was possible.");
  }
  const ranges = rangeList.getRanges();
  
  for(const range of ranges){
    if(range.getNumColumns() > 1){
      return true;
    }
  }
  
  if(ranges.length == 1){
    return false;
  }
  
  const colIndexOfFirstRange = ranges[0].getColumn();
  for(var i = 1; i < ranges.length; i++){
    const colIndexOfCurrentRange = ranges[i].getColumn();
    if(colIndexOfFirstRange !== colIndexOfCurrentRange){
      return true;
    }
  }
  return false;
}




function openPopup() {
  const html = HtmlService
      .createTemplateFromFile('dialog')
      .evaluate();
  SpreadsheetApp.getUi()
      .showModalDialog(html, 'select which items should remain visible');
}




function getCellContents(){
  const rangeList = SpreadsheetApp.getActive().getActiveRangeList();
  if(rangeList === null){
    return [];
  }
  const ranges = rangeList.getRanges();
  var values = [];
  for(const range of ranges){
    const table = range.getDisplayValues();
    for(const row of table){
      for(const cell of row){
        if(values.indexOf(cell) === -1){
          values.push(cell);
        }
      }
    }
  }
  return values;
}




function doFilter(values){
  const orientation = PropertiesService.getScriptProperties().getProperty(DIR_KEY);
  if(orientation === COLUMN_DIR){ 
    filterColumns(values);
  }
  else{
    filterRows(values);
  }
}




function filterColumns(values){
  const rangeList = SpreadsheetApp.getActive().getActiveRangeList();
  if(rangeList === null){
    SpreadsheetApp.getUi().alert("No range selected. I didn't think this was possible.");
  }
  const ranges = rangeList.getRanges();
  hideAllColumns(ranges);
  for(const range of ranges){
    for(colNum = 1; colNum <= range.getNumColumns(); colNum++){
      for(rowNum = 1; rowNum <= range.getNumRows(); rowNum++){
        const cell = range.getCell(rowNum, colNum);
        const value = cell.getDisplayValue();
        if(values.indexOf(value) > -1){
          unhideColumnOf(cell);
          break;
        }
      }
    }
  }
}




function filterRows(values){
  const rangeList = SpreadsheetApp.getActive().getActiveRangeList();
  if(rangeList === null){
    SpreadsheetApp.getUi().alert("No range selected. I didn't think this was possible.");
  }
  const ranges = rangeList.getRanges();
  hideAllRows(ranges);
  for(const range of ranges){
    for(rowNum = 1; rowNum <= range.getNumRows(); rowNum++){
      for(colNum = 1; colNum <= range.getNumColumns(); colNum++){
        const cell = range.getCell(rowNum, colNum);
        const value = cell.getDisplayValue();
        if(values.indexOf(value) > -1){
          unhideRowOf(cell);
          break;
        }
      }
    }
  }
}




function hideAllColumns(ranges){
  for(const range of ranges){
    for(colNum = 1; colNum <= range.getNumColumns(); colNum++){
      if(colNum === range.getSheet().getMaxColumns()){
       continue; 
      }
      const cell = range.getCell(1, colNum);
      cell.getSheet().hideColumn(cell);
    }
  }
}




function hideAllRows(ranges){
  for(const range of ranges){
    for(rowNum = 1; rowNum <= range.getNumRows(); rowNum++){
      if(rowNum === range.getSheet().getMaxRows()){
       continue; 
      }
      const cell = range.getCell(rowNum, 1);
      cell.getSheet().hideRow(cell);
    }
  }
}




function unhideAll(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const dataRange = sheet.getDataRange();
  sheet.unhideColumn(dataRange);
  sheet.unhideRow(dataRange);
}




function unhideColumnOf(cell){
  cell.getSheet().unhideColumn(cell);
}




function unhideRowOf(cell){
  cell.getSheet().unhideRow(cell);
}

/*
* Licensed to the Apache Software Foundation (ASF) under one or more
* contributor license agreements.  See the NOTICE file distributed with
* this work for additional information regarding copyright ownership.
* The ASF licenses this file to You under the Apache License, Version 2.0
* (the "License"); you may not use this file except in compliance with
* the License.  You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
$(document).ready(function() {
  createBulkImportHeader();
  createServerBulkHeader();
  refreshBulkImport();
});

function refreshBulkImport() {
  $.ajaxSetup({
    async: false
  });
  getBulkImports();
  $.ajaxSetup({
    async: true
  });
  refreshBulkImportTable();
  
  refreshServerBulkTable();
}

var timer;
function refresh() {
  if (sessionStorage.autoRefresh == "true") {
    timer = setInterval("refreshBulkImport()", 5000);
  } else {
    clearInterval(timer);
  }
}

function refreshBulkImportTable() {
  
  clearTable("masterBulkImportStatus");
  
  var data = sessionStorage.bulkImports === undefined ? undefined : JSON.parse(sessionStorage.bulkImports);
  var items = [];
  
  if (sessionStorage.bulkImports === undefined || data.bulkImport.length === 0) {
    items.push("<td class='center' colspan='3'><i>Empty</i></td>");
  } else {
    $.each(data.bulkImport, function(key, val) {
      items.push("<td class='firstcell left' data-value='" + val.filename + "'>" + val.filename + "</td>");
      items.push("<td class='right' data-value='" + val.age + "'>" + val.age + "</td>");
      items.push("<td class='right' data-value='" + val.state + "'>" + val.state + "</td>");
    });
  }
  
  $("<tr/>", {
    html: items.join("")
  }).appendTo("#masterBulkImportStatus");
}

function refreshServerBulkTable() {
  
  clearTable("bulkImportStatus");
  
  var data = sessionStorage.bulkImports === undefined ? undefined : JSON.parse(sessionStorage.bulkImports);
  var items = [];
  
  if (sessionStorage.bulkImports === undefined || data.tabletServerBulkImport.length === 0) {
    items.push("<td class='center' colspan='3'><i>Empty</i></td>");
  } else {
    $.each(data.tabletServerBulkImport, function(key, val) {
      items.push("<td class='firstcell left' data-value='" + val.server + "'><a href='/tservers?s=" + val.server + "'>" + val.server + "</a></td>");
      items.push("<td class='right' data-value='" + val.importSize + "'>" + val.importSize + "</td>");
      items.push("<td class='right' data-value='" + val.oldestAge + "'>" + (val.oldestAge > 0 ? val.oldestAge : "&mdash;") + "</td>");
    });
  }
  
  $("<tr/>", {
   html: items.join("")
  }).appendTo("#bulkImportStatus");
}

function sortTable(n) {

  if (sessionStorage.tableColumnSort !== undefined && sessionStorage.tableColumnSort == n && sessionStorage.direction !== undefined) {
      direction = sessionStorage.direction === "asc" ? "desc" : "asc";
  } else {
    direction = sessionStorage.direction === undefined ? "asc" : sessionStorage.direction;
  }
      
  sessionStorage.tableColumnSort = n;
      
  sortTables("bulkImportStatus", direction, n);
}
  
$(function() {
  $(document).tooltip();
});

function createBulkImportHeader() {	
  var caption = [];
  
  caption.push("<span class='table-caption'>Bulk&nbsp;Import&nbsp;Status</span><br />");

  $("<caption/>", {
    html: caption.join("")
  }).appendTo("#masterBulkImportStatus");
  
  var items = [];

  items.push("<th class='firstcell' onclick='sortTable(0)' >Directory&nbsp;</th>");
  items.push("<th onclick='sortTable(1)' title='"+descriptions["Import Age"]+"'>Age&nbsp;</th>");
  items.push("<th onclick='sortTable(2)' title='"+descriptions["Import State"]+"'>State&nbsp;</th>");
  
  $("<tr/>", {
    html: items.join("")
  }).appendTo("#masterBulkImportStatus");
}

function createServerBulkHeader() {	
  var caption = [];
  
  caption.push("<span class='table-caption'>TabletServer&nbsp;Bulk&nbsp;Import&nbsp;Status</span><br />");

  $("<caption/>", {
    html: caption.join("")
  }).appendTo("#bulkImportStatus");
  
  var items = [];
	
  items.push("<th class='firstcell' onclick='sortTable(0)' >Server&nbsp;</th>");
  items.push("<th onclick='sortTable(1)' title='"+descriptions["# Imports"]+"'>#&nbsp;</th>");
  items.push("<th onclick='sortTable(2)' title='"+descriptions["Oldest Age"]+"'>Oldest&nbsp;Age&nbsp;</th>");
  
  $("<tr/>", {
    html: items.join("")
  }).appendTo("#bulkImportStatus");
}

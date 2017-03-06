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
  $.ajaxSetup({
    async: false
  });
  getProblems();
  $.ajaxSetup({
    async: true
  });
  createHeader();
  createProblemsTable();
  sortTable(sessionStorage.tableColumnSort === undefined ? 0 : sessionStorage.tableColumnSort);
});

function createProblemsTable() {
  var data = JSON.parse(sessionStorage.problems);

  $.each(data, function(key, val) {
    var items = [];
    items.push("<td class='firstcell left' data-value='" + val.tablename + "'><a href='/tables/" + val.tableId + "'>" + val.tablename + "</a></td>");
    items.push("<td class='right' data-value='" + val.type + "'>" + val.type + "</td>");
    items.push("<td class='right' data-value='" + val.server + "'>" + val.server + "</td>");
    var date = new Date(val.time);
    items.push("<td class='right' data-value='" + val.time + "'>" + date.toLocateString() + "</td>");
    items.push("<td class='right' data-value='" + val.resource + "'>" + val.resource + "</td>");
    items.push("<td class='right' data-value='" + val.exception + "'>" + val.exception + "</td>");
    items.push("<td class='right' data-value='" + val.operations + "'>" + val.operations + "</td>");
              
    $("<tr/>", {
      html: items.join("")
    }).appendTo("#problemDetails");
              
  });
  
  if (Object.keys(data).length === 0) {
    var items = [];
    items.push("<td class='center' colspan='7'><i>Empty</i></td>");
    $("<tr/>", {
      html: items.join("")
    }).appendTo("#problemDetails");
  }
}

function sortTable(n) {
  if (!JSON.parse(sessionStorage.namespaceChanged)) {
    if (sessionStorage.tableColumnSort !== undefined && sessionStorage.tableColumnSort == n && sessionStorage.direction !== undefined) {
      direction = sessionStorage.direction === "asc" ? "desc" : "asc";
    }
  } else {
    direction = sessionStorage.direction === undefined ? "asc" : sessionStorage.direction;
  }
      
  sessionStorage.tableColumnSort = n;
      
  sortTables("problemDetails", direction, n);
}

function createHeader() {	
  var caption = [];
  
  caption.push("<span class='table-caption'>Problem&nbsp;Details</span><br />");
  caption.push("<span class='table-subcaption'>Problems&nbsp;identified&nbsp;with&nbsp;tables.</span><br />");
  
  $("<caption/>", {
    html: caption.join("")
  }).appendTo("#problemDetails");

  var items = [];

  items.push("<th class='firstcell' onclick='sortTable(0)'>Table&nbsp;</th>");
  items.push("<th onclick='sortTable(1)'>Problem&nbsp;Type&nbsp;</th>");
  items.push("<th onclick='sortTable(2)'>Server&nbsp;</th>");
  items.push("<th onclick='sortTable(3)'>Time&nbsp;</th>");
  items.push("<th onclick='sortTable(4)'>Resource&nbsp;</th>");
  items.push("<th onclick='sortTable(5)'>Exception&nbsp;</th>");
  items.push("<th>Operations&nbsp;</th>");
  
  $("<tr/>", {
    html: items.join("")
  }).appendTo("#problemDetails");
}

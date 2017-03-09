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
  getMaster();
  getLogs();
  getProblems();
  $.ajaxSetup({
    async: true
  });
  var data = JSON.parse(sessionStorage.master);
  
  logEventBanner();
  
  if (data.master !== "No Masters running") {
    createHeader();
    createMasterTable();
  } else {
    doBanner("masterBanner", "error", "Master Server Not Running");
  }
  //recoveryList(); // TODO Implement this
  
});

function logEventBanner() {
  var data = JSON.parse(sessionStorage.logs);
  
  if (data.length > 0) {
      var error = 0, warning = 0, total = 0;
      
      $.each(data, function(key, val) {
        if (val.level === "ERROR") {
          error++;
        } else if (val.level === "WARN") {
          warning++;
        }
        total++;
      });
      
      doBanner("masterBanner", error > 0 ? "danger" : "warning", "<a href='/log'>Log Events: " + error + " Error" + (error == 1 ? "" : "s") + ", " + warning + " Warning" + (warning == 1 ? "" : "s") + ", " + total + " Total</a>");
  }
}

function recoveryList() {
  
}

function createMasterTable() {
  var data = JSON.parse(sessionStorage.master);
  var items = [];
  items.push("<td class='firstcell left' data-value='" + data.master + "'>" + data.master + "</td>");
  items.push("<td class='right' data-value='" + data.onlineTabletServers + "'>" + data.onlineTabletServers + "</td>");
  items.push("<td class='right' data-value='" + data.totalTabletServers + "'>" + data.totalTabletServers + "</td>");
  var date = new Date(parseInt(data.lastGC));
  items.push("<td class='left' data-value='" + data.lasGC + "'><a href='/gc'>" + date.toLocaleString() + "</a></td>");
  items.push("<td class='right' data-value='" + data.tablets + "'>" + bigNumberForQuantity(data.tablets) + "</td>");
  items.push("<td class='right' data-value='" + data.unassignedTablets + "'>" + bigNumberForQuantity(data.unassignedTablets) + "</td>");
  items.push("<td class='right' data-value='" + data.numentries + "'>" + bigNumberForQuantity(data.numentries) + "</td>");
  items.push("<td class='right' data-value='" + data.ingestrate + "'>" + bigNumberForQuantity(Math.round(data.ingestrate)) + "</td>");
  items.push("<td class='right' data-value='" + data.entriesRead + "'>" + bigNumberForQuantity(Math.round(data.entriesRead)) + "</td>");
  items.push("<td class='right' data-value='" + data.queryrate + "'>" + bigNumberForQuantity(Math.round(data.queryrate)) + "</td>");
  items.push("<td class='right' data-value='" + data.holdTime + "'>" + timeDuration(data.holdTime) + "</td>");
  items.push("<td class='right' data-value='" + data.osload + "'>" + bigNumberForQuantity(data.osload) + "</td>");
  
  $("<tr/>", {
   html: items.join("")
  }).appendTo("#masterStatus");
}

function sortTable(n) {
  if (sessionStorage.tableColumnSort !== undefined && sessionStorage.tableColumnSort == n && sessionStorage.direction !== undefined) {
      direction = sessionStorage.direction === "asc" ? "desc" : "asc";
  } else {
    direction = sessionStorage.direction === undefined ? "asc" : sessionStorage.direction;
  }
      
  sessionStorage.tableColumnSort = n;
      
  sortTables("masterStatus", direction, n);
}
  
$(function() {
  $(document).tooltip();
});

function createHeader() {	
  var caption = [];
  
  caption.push("<span class='table-caption'>Master&nbsp;Status</span><br />");

  $("<caption/>", {
    html: caption.join("")
  }).appendTo("#masterStatus");
      
  var items = [];

  items.push("<th class='firstcell' onclick='sortTable(0)' title='"+descriptions["Master"]+"'>Master&nbsp;</th>");
  items.push("<th onclick='sortTable(1)' title='"+descriptions["# Online Tablet Servers"]+"'>#&nbsp;Online<br />Tablet&nbsp;Servers&nbsp;</th>");
  items.push("<th onclick='sortTable(2)' title='"+descriptions["# Total Tablet Servers"]+"'>#&nbsp;Total<br />Tablet&nbsp;Servers&nbsp;</th>");
  items.push("<th onclick='sortTable(3)' title='"+descriptions["Last GC"]+"'>Last&nbsp;GC&nbsp;</th>");
  items.push("<th onclick='sortTable(4)' title='"+descriptions["# Tablets"]+"'>#&nbsp;Tablets&nbsp;</th>");
  items.push("<th onclick='sortTable(5)'>#&nbsp;Unassigned<br />Tablets&nbsp;</th>");
  items.push("<th onclick='sortTable(6)' title='"+descriptions["Total Entries"]+"'>Entries&nbsp;</th>");
  items.push("<th onclick='sortTable(7)' title='"+descriptions["Total Ingest"]+"'>Ingest&nbsp;</th>");
  items.push("<th onclick='sortTable(8)' title='"+descriptions["Total Entries Read"]+"'>Entries<br />Read&nbsp;</th>");
  items.push("<th onclick='sortTable(9)' title='"+descriptions["Total Entries Returned"]+"'>Entries<br />Returned&nbsp;</th>");
  items.push("<th onclick='sortTable(10)' title='"+descriptions["Max Hold Time"]+"'>Hold&nbsp;Time&nbsp;</th>");
  items.push("<th onclick='sortTable(11)' title='"+descriptions["OS Load"]+"'>OS&nbsp;Load&nbsp;</th>");
  
  $("<tr/>", {
    html: items.join("")
  }).appendTo("#masterStatus");
}

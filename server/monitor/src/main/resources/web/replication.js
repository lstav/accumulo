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
  createHeader();
  refreshReplication();
});

function refreshReplication() {
  $.ajaxSetup({
    async: false
  });
  getReplication();
  $.ajaxSetup({
    async: true
  });
  refreshReplicationsTable();
}

var timer;
function refresh() {
  if (sessionStorage.autoRefresh == "true") {
    timer = setInterval("refreshReplication()", 5000);
  } else {
    clearInterval(timer);
  }
}

function refreshReplicationsTable() {
  
  clearTable("replicationStats");
  
  var data = JSON.parse(sessionStorage.replication);

  $.each(data, function(key, val) {
    var items = [];
    items.push("<td class='firstcell left' data-value='" + val.tableName + "'>" + val.tableName + "</td>");
    items.push("<td class='right' data-value='" + val.peerName + "'>" + val.peerName + "</td>");
    items.push("<td class='right' data-value='" + val.remoteIdentifier + "'>" + val.remoteIdentifier + "</td>");
    items.push("<td class='right' data-value='" + val.replicaSystemType + "'>" + val.replicaSystemType + "</td>");
    items.push("<td class='right' data-value='" + val.filesNeedingReplication + "'>" + bigNumberForQuantity(val.filesNeedingReplication) + "</td>");
              
    $("<tr/>", {
      html: items.join("")
    }).appendTo("#replicationStats");
              
  });
  
  if (data.length === 0) {
    var items = [];
    items.push("<td class='center' colspan='5'><i>Replication table is offline</i></td>");
    $("<tr/>", {
      html: items.join("")
    }).appendTo("#replicationStats");
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
      
  sortTables("replicationStats", direction, n);
}

function createHeader() {	
  var caption = [];
  
  caption.push("<span class='table-caption'>Replication Status</span><br />");

  $("<caption/>", {
    html: caption.join("")
  }).appendTo("#replicationStats");

  var items = [];

  items.push("<th class='firstcell' onclick='sortTable(0)'>Table&nbsp;</th>");
  items.push("<th onclick='sortTable(1)'>Peer&nbsp;</th>");
  items.push("<th onclick='sortTable(2)'>Remote&nbsp;Identifier&nbsp;</th>");
  items.push("<th onclick='sortTable(3)'>Replica&nbsp;System&nbsp;Type&nbsp;</th>");
  items.push("<th onclick='sortTable(4)'>Files&nbsp;needing&nbsp;replication&nbsp;</th>");
  
  $("<tr/>", {
    html: items.join("")
  }).appendTo("#replicationStats");
}

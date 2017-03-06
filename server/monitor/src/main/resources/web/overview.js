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
  getZK();
  getIngestRate();
  getScanEntries();
  getIngestByteRate();
  getQueryByteRate();
  getLoadAverage();
  getLookups();
  getMinorCompactions();
  getMajorCompactions();
  getIndexCacheHitRate();
  getDataCacheHitRate();
  $.ajaxSetup({
    async: true
  });
  createMasterTable();
  createZKTable();
  makePlots();
});

function createMasterTable() {
  var data = JSON.parse(sessionStorage.master);
  var items = [];
  items.push("<tr><th colspan='2'><a href='/master'>Accumulo&nbsp;Master</a></th></tr>");
  if (data.master === "No Masters running") {
    items.push("<tr><td colspan='2'><span class='error'>Master is Down</span></td></tr>");
  } else {
    items.push("<tr><td class='left'><a href='/tables'>Tables</a></td><td class='right'>" + bigNumberForQuantity(data.tables) + "</td></tr>");
    items.push("<tr><td class='left'><a href='/tservers'>Tablet&nbsp;Servers</a></td><td class='right'>" + bigNumberForQuantity(data.totalTabletServers) + "</td></tr>");
    items.push("<tr><td class='left'><a href='/tservers'>Dead&nbsp;Tablet&nbsp;Servers</a></td><td class='right'>" + bigNumberForQuantity(data.deadTabletServersCount) + "</td></tr>");
    items.push("<tr><td class='left'>Tablets</td><td class='right'>" + bigNumberForQuantity(data.tablets) + "</td></tr>");
    items.push("<tr><td class='left'>Entries</td><td class='right'>" + bigNumberForQuantity(data.numentries) + "</td></tr>");
    items.push("<tr><td class='left'>Lookups</td><td class='right'>" + bigNumberForQuantity(data.lookups) + "</td></tr>");
    items.push("<tr><td class='left'>Uptime</td><td class='right'>" + timeDuration(data.uptime) + "</td></tr>");
  }

  $("<table/>", {
    html: items.join(""),
    class: "table table-bordered table-striped table-condensed"
  }).appendTo("#master");
}

function createZKTable() {
  var data = JSON.parse(sessionStorage.zk);
  var items = [];
  items.push("<tr><th colspan='3'>Zookeeper</th></tr>");
  items.push("<tr><th>Server</th><th>Mode</th><th>Clients</th></tr>");
  if (data.zkServers.length === 0) {
    items.push("<td class='center' colspan='3'><i>No Zookeepers</i></td>");
  } else {
    $.each(data.zkServers, function(key, val) {
      if (val.clients >= 0) {
        items.push("<tr><td class='left'>" + val.server + "</td>");
        items.push("<td class='left'>" + val.mode + "</td>");
        items.push("<td class='right'>" + val.clients + "</td></tr>");
      } else {
        items.push("<tr><td class='left'>" + val.server + "</td>");
        items.push("<td class='left'><span class='error'>Down</span></td>");
        items.push("<td class='right'></td></tr>");
      }
    });
  }
  
  $("<table/>", {
   html: items.join(""),
   class: "table table-bordered table-striped table-condensed"
  }).appendTo("#zookeeper");
}

//// Overview plot creation

function makePlots() {
  var ingestRate = [];
  $.each(JSON.parse(sessionStorage.ingestRate), function(key, val) {
    ingestRate.push([val.first, val.second]);
  });
  $.plot($("#ingest_entries"),[{ data: ingestRate, lines: { show: true }, color:"red" }], {yaxis:{}, xaxis:{mode:"time",minTickSize: [1, "minute"],timeformat: "%H:%M<br />UTC", ticks:3}});
  
  var scanEntries = {"Read":[], "Returned":[]};
  $.each(JSON.parse(sessionStorage.scanEntries), function(key, val) {
    $.each(val.second, function(key2, val2) {
      scanEntries[val.first].push([val2.first, val2.second]);
    });           
  });
  $.plot($("#scan_entries"),[{ label: "Read", data: scanEntries.Read, lines: { show: true }, color:"red" },{ label: "Returned", data: scanEntries.Returned, lines: { show: true }, color:"blue" }], {yaxis:{}, xaxis:{mode:"time",minTickSize: [1, "minute"],timeformat: "%H:%M<br />UTC", ticks:3}});
  
  var ingestMB = [];
  $.each(JSON.parse(sessionStorage.ingestMB), function(key, val) {
    ingestMB.push([val.first, val.second]);
  });
  $.plot($("#ingest_mb"),[{ data: ingestMB, lines: { show: true }, color:"red" }], {yaxis:{}, xaxis:{mode:"time",minTickSize: [1, "minute"],timeformat: "%H:%M<br />UTC", ticks:3}});
  
  var queryMB = [];
  $.each(JSON.parse(sessionStorage.queryMB), function(key, val) {
  queryMB.push([val.first, val.second]);
  });
  $.plot($("#scan_mb"),[{ data: queryMB, lines: { show: true }, color:"red" }], {yaxis:{}, xaxis:{mode:"time",minTickSize: [1, "minute"],timeformat: "%H:%M<br />UTC", ticks:3}});

  var loadAvg = [];
  $.each(JSON.parse(sessionStorage.loadAvg), function(key, val) {
    loadAvg.push([val.first, val.second]);
  });
  $.plot($("#load_avg"),[{ data: loadAvg, lines: { show: true }, color:"red" }], {yaxis:{}, xaxis:{mode:"time",minTickSize: [1, "minute"],timeformat: "%H:%M<br />UTC", ticks:3}});
  
  var lookups = [];
  $.each(JSON.parse(sessionStorage.lookups), function(key, val) {
    lookups.push([val.first, val.second]);
  });
  $.plot($("#seeks"),[{ data: lookups, lines: { show: true }, color:"red" }], {yaxis:{}, xaxis:{mode:"time",minTickSize: [1, "minute"],timeformat: "%H:%M<br />UTC", ticks:3}});
  
  var minor = [];
  $.each(JSON.parse(sessionStorage.minorCompactions), function(key, val) {
    minor.push([val.first, val.second]);
  });
  $.plot($("#minor"),[{ data: minor, lines: { show: true }, color:"red" }], {yaxis:{}, xaxis:{mode:"time",minTickSize: [1, "minute"],timeformat: "%H:%M<br />UTC", ticks:3}});
  
  var major = [];
  $.each(JSON.parse(sessionStorage.majorCompactions), function(key, val) {
    major.push([val.first, val.second]);
  });
  $.plot($("#major"),[{ data: major, lines: { show: true }, color:"red" }], {yaxis:{}, xaxis:{mode:"time",minTickSize: [1, "minute"],timeformat: "%H:%M<br />UTC", ticks:3}});
  
  var indexCache = [];
  $.each(JSON.parse(sessionStorage.indexCache), function(key, val) {
    indexCache.push([val.first, val.second]);
  });
  $.plot($("#index_cache"),[{ data: indexCache, points: { show: true, radius: 1 }, color:"red" }], {yaxis:{}, xaxis:{mode:"time",minTickSize: [1, "minute"],timeformat: "%H:%M<br />UTC", ticks:3}});
  
  var dataCache = [];
  $.each(JSON.parse(sessionStorage.dataCache), function(key, val) {
    dataCache.push([val.first, val.second]);
  });
  $.plot($("#data_cache"),[{ data: dataCache, points: { show: true, radius: 1 }, color:"red" }], {yaxis:{}, xaxis:{mode:"time",minTickSize: [1, "minute"],timeformat: "%H:%M<br />UTC", ticks:3}});

}
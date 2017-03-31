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

/**
 * Creates overview initial tables
 */
$(document).ready(function() {
  createMasterTable();
  createZKTable();
  refreshOverview();
});

/**
 * Makes the REST calls, generates the tables with the new information
 */
function refreshOverview() {
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
  refreshMasterTable();
  refreshZKTable();
  makePlots();
}

/**
 * Used to redraw the page
 */
function refresh() {
  refreshOverview();
}

/**
 * Refreshes the master table
 */
function refreshMasterTable() {
  var data = sessionStorage.master === undefined ?
      [] : JSON.parse(sessionStorage.master);

  $('#master tr td:first').hide();
  $('#master tr td').hide();

  // If the master is down, show the first row, otherwise refresh old values
  if (data.length === 0 || data.master === 'No Masters running') {
    $('#master tr td:first').show();
  } else {
    $('#master tr td:not(:first)').show();
    var table = $('#master td.right');

    table.eq(0).html(bigNumberForQuantity(data.tables));
    table.eq(1).html(bigNumberForQuantity(data.totalTabletServers));
    table.eq(2).html(bigNumberForQuantity(data.deadTabletServersCount));
    table.eq(3).html(bigNumberForQuantity(data.tablets));
    table.eq(4).html(bigNumberForQuantity(data.numentries));
    table.eq(5).html(bigNumberForQuantity(data.lookups));
    table.eq(6).html(timeDuration(data.uptime));
  }
}

/**
 * Generates the master table
 */
function createMasterTable() {
  var items = [];
  items.push('<tr><th colspan="2"><a href="/master">Accumulo' +
      '&nbsp;Master</a></th></tr>');

  items.push('<tr><td colspan="2" class="center">' +
      '<span class="label label-danger">Master is Down</span></td></tr>');

  items.push('<tr><td class="left"><a href="/tables">Tables</a></td>' +
      '<td class="right"></td></tr>');

  items.push('<tr><td class="left"><a href="/tservers">Tablet' +
      '&nbsp;Servers</a></td><td class="right"></td></tr>');

  items.push('<tr><td class="left"><a href="/tservers">Dead&nbsp;' +
      'Tablet&nbsp;Servers</a></td><td class="right"></td></tr>');

  items.push('<tr><td class="left">Tablets</td><td class="right"></td></tr>');
  items.push('<tr><td class="left">Entries</td><td class="right"></td></tr>');
  items.push('<tr><td class="left">Lookups</td><td class="right"></td></tr>');
  items.push('<tr><td class="left">Uptime</td><td class="right"></td></tr>');

  $('<table/>', {
    html: items.join(''),
    class: 'table table-bordered table-striped table-condensed'
  }).appendTo('#master');
}

/**
 * Refresh the zookeeper table
 */
function refreshZKTable() {
  var data = sessionStorage.zk === undefined ?
      [] : JSON.parse(sessionStorage.zk);

  $('#zookeeper tr td:first').hide();
  $('#zookeeper tr:gt(2)').remove();

  if (data.length === 0 || data.zkServers.length === 0) {
    $('#zookeeper tr td:first').show();
  } else {
    var items = [];
    $.each(data.zkServers, function(key, val) {
      if (val.clients >= 0) {
        items.push('<td class="left">' + val.server + '</td>');
        items.push('<td class="left">' + val.mode + '</td>');
        items.push('<td class="right">' + val.clients + '</td></tr>');
      } else {
        items.push('<tr><td class="left">' + val.server + '</td>');
        items.push('<td class="left"><span class="error">Down</span></td>');
        items.push('<td class="right"></td>');
      }
    });
    $('<tr/>', {
      html: items.join('')
    }).appendTo('#zookeeper table');
  }
}

/**
 * Generates the zookeeper table
 */
function createZKTable() {
  var items = [];
  items.push('<tr><th colspan="3">Zookeeper</th></tr>');
  items.push('<tr><th>Server</th><th>Mode</th><th>Clients</th></tr>');
  items.push('<td class="center" colspan="3"><i>No Zookeepers</i></td>');
  $('<table/>', {
    html: items.join(''),
    class: 'table table-bordered table-striped table-condensed'
  }).appendTo('#zookeeper');
}

//// Overview plot creation

/**
 * Create the plots for the overview page
 */
function makePlots() {
  var d = new Date();
  var n = d.getTimezoneOffset() * 60000; // Converts offset to milliseconds
  var tz = new Date().toLocaleTimeString('en-us',
      {timeZoneName: 'short'}).split(' ')[2]; // Short version of timezone
  var tzFormat = '%H:%M<br />' + tz;

  // Create Ingest Rate plot
  var ingestRate = [];
  var data = sessionStorage.ingestRate === undefined ?
      [] : JSON.parse(sessionStorage.ingestRate);
  $.each(data, function(key, val) {

    ingestRate.push([val.first - n, val.second]);
  });
  $.plot($('#ingest_entries'), [{ data: ingestRate,
      lines: { show: true }, color: '#d9534f' }],
      {yaxis: {}, xaxis: {mode: 'time', minTickSize: [1, 'minute'],
      timeformat: tzFormat, ticks: 3}});

  // Create Scan Entries plot
  var scanEntries = {'Read': [], 'Returned': []};
  var data = sessionStorage.scanEntries === undefined ?
      [] : JSON.parse(sessionStorage.scanEntries);
  $.each(data, function(key, val) {
    $.each(val.second, function(key2, val2) {
      scanEntries[val.first].push([val2.first - n, val2.second]);
    });
  });
  $.plot($('#scan_entries'), [{ label: 'Read',
      data: scanEntries.Read, lines: { show: true }, color: '#d9534f' },
      { label: 'Returned', data: scanEntries.Returned, lines: { show: true },
      color: '#337ab7' }], {yaxis: {}, xaxis: {mode: 'time',
      minTickSize: [1, 'minute'], timeformat: tzFormat, ticks: 3}});

  // Create Ingest MB plot
  var ingestMB = [];
  var data = sessionStorage.ingestMB === undefined ?
      [] : JSON.parse(sessionStorage.ingestMB);
  $.each(data, function(key, val) {
    ingestMB.push([val.first - n, val.second]);
  });
  $.plot($('#ingest_mb'), [{ data: ingestMB, lines: { show: true },
      color: '#d9534f' }], {yaxis: {}, xaxis: {mode: 'time',
      minTickSize: [1, 'minute'], timeformat: tzFormat, ticks: 3}});

  // Create Query MB plot
  var queryMB = [];
  var data = sessionStorage.queryMB === undefined ?
      [] : JSON.parse(sessionStorage.queryMB);
  $.each(data, function(key, val) {
  queryMB.push([val.first - n, val.second]);
  });
  $.plot($('#scan_mb'), [{ data: queryMB, lines: { show: true },
      color: '#d9534f' }], {yaxis: {}, xaxis: {mode: 'time',
      minTickSize: [1, 'minute'], timeformat: tzFormat, ticks: 3}});

  // Create Load Average plot
  var loadAvg = [];
  var data = sessionStorage.loadAvg === undefined ?
      [] : JSON.parse(sessionStorage.loadAvg);
  $.each(data, function(key, val) {
    loadAvg.push([val.first - n, val.second]);
  });
  $.plot($('#load_avg'), [{ data: loadAvg, lines: { show: true },
      color: '#d9534f' }], {yaxis: {}, xaxis: {mode: 'time',
      minTickSize: [1, 'minute'], timeformat: tzFormat, ticks: 3}});

  // Create Seeks plot
  var lookups = [];
  var data = sessionStorage.lookups === undefined ?
      [] : JSON.parse(sessionStorage.lookups);
  $.each(data, function(key, val) {
    lookups.push([val.first - n, val.second]);
  });
  $.plot($('#seeks'), [{ data: lookups, lines: { show: true },
      color: '#d9534f' }], {yaxis: {}, xaxis: {mode: 'time',
      minTickSize: [1, 'minute'], timeformat: tzFormat, ticks: 3}});

  // Create Minor Compactions plot
  var minor = [];
  var data = sessionStorage.minorCompactions === undefined ?
      [] : JSON.parse(sessionStorage.minorCompactions);
  $.each(data, function(key, val) {
    minor.push([val.first - n, val.second]);
  });
  $.plot($('#minor'), [{ data: minor, lines: { show: true },
      color: '#d9534f' }], {yaxis: {}, xaxis: {mode: 'time',
      minTickSize: [1, 'minute'], timeformat: tzFormat, ticks: 3}});

  // Create Major Compaction plot
  var major = [];
  var data = sessionStorage.majorCompactions === undefined ?
      [] : JSON.parse(sessionStorage.majorCompactions);
  $.each(data, function(key, val) {
    major.push([val.first - n, val.second]);
  });
  $.plot($('#major'), [{ data: major, lines: { show: true },
      color: '#d9534f' }], {yaxis: {}, xaxis: {mode: 'time',
      minTickSize: [1, 'minute'], timeformat: tzFormat, ticks: 3}});

  // Create Index Cache plot
  var indexCache = [];
  var data = sessionStorage.indexCache === undefined ?
      [] : JSON.parse(sessionStorage.indexCache);
  $.each(data, function(key, val) {
    indexCache.push([val.first - n, val.second]);
  });
  $.plot($('#index_cache'), [{ data: indexCache,
      points: { show: true, radius: 1 }, color: '#d9534f' }],
      {yaxis: {}, xaxis: {mode: 'time', minTickSize: [1, 'minute'],
      timeformat: tzFormat, ticks: 3}});

  // Create Data Cache plot
  var dataCache = [];
  var data = sessionStorage.dataCache === undefined ?
      [] : JSON.parse(sessionStorage.dataCache);
  $.each(data, function(key, val) {
    dataCache.push([val.first - n, val.second]);
  });
  $.plot($('#data_cache'), [{ data: dataCache,
      points: { show: true, radius: 1 }, color: '#d9534f' }],
      {yaxis: {}, xaxis: {mode: 'time', minTickSize: [1, 'minute'],
      timeformat: tzFormat, ticks: 3}});
}

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
 * Creates scans initial table
 */
$(document).ready(function() {
  createHeader();
  refreshScans();
});

/**
 * Makes the REST calls, generates the tables with the new information
 */
function refreshScans() {
  $.ajaxSetup({
    async: false
  });
  getScans();
  $.ajaxSetup({
    async: true
  });
  refreshScansTable();
}

/**
 * Used to set the refresh interval to 5 seconds
 */
function refresh() {
  clearInterval(TIMER);
  if (sessionStorage.autoRefresh == 'true') {
    TIMER = setInterval('refreshScans()', 5000);
  }
}

/**
 * Generates the scans table
 */
function refreshScansTable() {
  clearTable('scanStatus');

  var data = sessionStorage.scans === undefined ?
      [] : JSON.parse(sessionStorage.scans);

  if (data.length === 0 || data.scans.length === 0) {
    var items = '<td class="center" colspan="3"><i>Empty</i></td>';

    $('<tr/>', {
      html: items
    }).appendTo('#scanStatus');
  } else {
    $.each(data.scans, function(key, val) {
      var items = [];

      items.push('<td class="firstcell left" data-value="' + val.server +
          '"><a href="/tservers?s=' + val.server + '">' + val.server +
          '</a></td>');

      items.push('<td class="right" data-value="' + val.scanCount + '">' +
          val.scanCount + '</td>');

      items.push('<td class="right" data-value="' + val.oldestScan + '">' +
          timeDuration(val.oldestScan) + '</td>');

      $('<tr/>', {
        html: items.join('')
      }).appendTo('#scanStatus');
    });
  }
}

/**
 * Sorts the scanStatus table on the selected column
 *
 * @param {number} n Column number to sort by
 */
function sortTable(n) {
  if (sessionStorage.tableColumnSort !== undefined &&
      sessionStorage.tableColumnSort == n &&
      sessionStorage.direction !== undefined) {
    direction = sessionStorage.direction === 'asc' ? 'desc' : 'asc';
  } else {
    direction = sessionStorage.direction === undefined ?
        'asc' : sessionStorage.direction;
  }
  sessionStorage.tableColumnSort = n;
  sortTables('scanStatus', direction, n);
}

/**
 * Create tooltip for table column information
 */
$(function() {
  $(document).tooltip();
});

/**
 * Creates the scans header
 */
function createHeader() {
  var caption = [];

  caption.push('<span class="table-caption">Scan&nbsp;Status</span><br />');

  $('<caption/>', {
    html: caption.join('')
  }).appendTo('#scanStatus');

  var items = [];

  items.push('<th class="firstcell" onclick="sortTable(0)">Server&nbsp;</th>');

  items.push('<th onclick="sortTable(1)" title="' +
      descriptions['# Scans'] + '">#&nbsp;</th>');

  items.push('<th onclick="sortTable(2)" title="' +
      descriptions['Oldest Scan'] + '">Oldest&nbsp;Age&nbsp;</th>');

  $('<tr/>', {
    html: items.join('')
  }).appendTo('#scanStatus');
}

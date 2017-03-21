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

function refreshTables() {
  $.ajaxSetup({
    async: false
  });
  getNamespaces();
  $.ajaxSetup({
    async: true
  });

  createNamespacesDropdown();
  if (sessionStorage.namespaces === undefined) {
    sessionStorage.namespaces = '[]';
    populateTable(undefined);
  }
  populateTable(undefined);
  sortTable(sessionStorage.tableColumnSort === undefined ? 0 : sessionStorage.tableColumnSort);
}

var timer;
function refresh() {
  if (sessionStorage.autoRefresh == 'true') {
    timer = setInterval('refreshTables()', 5000);
  } else {
    clearInterval(timer);
  }
}

function namespaceChanged() {
  var $namespaceSelect = $('#namespaces');
  
  $namespaceSelect.off();
  
  $namespaceSelect.on('select2:select', function (e) {
    var id = e.params === null ? undefined : e.params['data']['id'];
    populateTable(id);
  });
  
  $namespaceSelect.on('select2:unselect', function (e) {
    var id = e.params === null ? undefined : e.params['data']['id'];
    populateTable(id);
  });
}

function createNamespacesDropdown() {
  var data = JSON.parse(NAMESPACES).namespaces;
  var caption = [];
  
  caption.push('<span class="table-caption">Table&nbsp;List</span><br />');

  $('<caption/>', {
    html: caption.join('')
  }).appendTo('#filters');
  
  var data2 = [{ id: '*', text: '* (All Tables)'}];
  $.each(data, function(key, val) {
    var namespace = val === '' ? '- (DEFAULT)' : val;
    data2.push({id: val === '' ? '-' : val, text: namespace});
  });  
  
  $('#namespaces').select2({
    data: data2,
    allowClear: true
  });
  namespaceChanged();
}

function populateTable(ns) {  
  var tmpArr = sessionStorage.namespaces === undefined ? [] : JSON.parse(sessionStorage.namespaces);
  sessionStorage.namespaceChanged = true;
  var namespaces = JSON.parse(NAMESPACES).namespaces;
  
  if (ns !== undefined) {
    if (tmpArr.indexOf(ns) == -1) {
      if (ns === '*') {
        tmpArr = [];
        
        tmpArr.push('*');
        $.each(namespaces, function(key, val) {
          tmpArr.push(val === '' ? '-' : val);
        });
      } else {
        tmpArr.push(ns);
        if (tmpArr.length == namespaces.length) {
          tmpArr.push('*');
        }
      }
    } else {
      if (tmpArr.indexOf('*') !== -1 && ns !== '*') {
        tmpArr.splice(tmpArr.indexOf('*'),1);
      }
      if (ns !== '*') {
        tmpArr.splice(tmpArr.indexOf(ns),1);
      } else {
        tmpArr = [];
      }
    }
  }
  
  $('#namespaces').select2().val(tmpArr).trigger('change'); // TODO Fix this, causes null dataAdapter
    
  sessionStorage.namespaces = JSON.stringify(tmpArr);
  
  $.ajaxSetup({
    async: false
  });
  getNamespaceTables(tmpArr);
  $.ajaxSetup({
    async: true
  });
  
  var data = sessionStorage.tables === undefined ? [] : JSON.parse(sessionStorage.tables);
  clearTable('tableList');
  
  var numTables = 0;
    
  $.each(data.tables, function(keyT, tab) {
    if (tmpArr.indexOf(tab.namespace === '' ? '-' : tab.namespace) !== -1 || tmpArr.indexOf('*') !== -1) {
      $.each(tab.table, function(key, val) {
        
        var row = [];
        row.push('<td class="firstcell left" data-value="' + val.tablename + '"><a href="/tables/' + val.tableId + '">' + val.tablename + '</a></td>');
        row.push('<td class="center" data-value="' + val.tableState + '"><span>' + val.tableState + '</span></td>');

        if (val.tableState === 'ONLINE') {
          row.push('<td class="right" data-value="' + val.tablets + '">' + bigNumberForQuantity(val.tablets) + '</td>');
          row.push('<td class="right" data-value="' + val.offlineTablets + '">' + bigNumberForQuantity(val.offlineTablets) + '</td>');
          row.push('<td class="right" data-value="' + val.recs + '">' + bigNumberForQuantity(val.recs) + '</td>');
          row.push('<td class="right" data-value="' + val.recsInMemory + '">' + bigNumberForQuantity(val.recsInMemory) + '</td>');
          row.push('<td class="right" data-value="' + val.ingest + '">' + bigNumberForQuantity(Math.floor(val.ingest)) + '</td>');
          row.push('<td class="right" data-value="' + val.entriesRead + '">' + bigNumberForQuantity(Math.floor(val.entriesRead)) + '</td>');
          row.push('<td class="right" data-value="' + val.entriesReturned + '">' + bigNumberForQuantity(Math.floor(val.entriesReturned)) + '</td>');
          row.push('<td class="right" data-value="' + val.holdTime + '">' + timeDuration(val.holdTime) + '</td>');
          if (val.scans === null) {
            row.push('<td class="right" data-value="-">-</td>');
          } else {
            row.push('<td class="right" data-value="' + (val.scans.running + val.scans.queued) + '">' + bigNumberForQuantity(val.scans.running) + '&nbsp;(' + bigNumberForQuantity(val.scans.queued) + ')</td>');
          }
          if (val.minorCompactions === null) {
            row.push('<td class="right" data-value="-">-</td>');
          } else {
            row.push('<td class="right" data-value="' + (val.minorCompactions.running + val.minorCompactions.queued) + '">' + bigNumberForQuantity(val.minorCompactions.running) + '&nbsp;(' + bigNumberForQuantity(val.minorCompactions.queued) + ')</td>');
          }
          if (val.majorCompactions === null) {
            row.push('<td class="right" data-value="-">-</td>');
          } else {
            row.push('<td class="right" data-value="' + (val.majorCompactions.running + val.majorCompactions.queued) + '">' + bigNumberForQuantity(val.majorCompactions.running) + '&nbsp;(' + bigNumberForQuantity(val.majorCompactions.queued) + ')</td>');
          }
        } else {
          row.push('<td class="right" data-value="-">-</td>');
          row.push('<td class="right" data-value="-">-</td>');
          row.push('<td class="right" data-value="-">-</td>');
          row.push('<td class="right" data-value="-">-</td>');
          row.push('<td class="right" data-value="-">-</td>');
          row.push('<td class="right" data-value="-">-</td>');
          row.push('<td class="right" data-value="-">-</td>');
          row.push('<td class="right" data-value="-">&mdash;</td>');
          row.push('<td class="right" data-value="-">-</td>');
          row.push('<td class="right" data-value="-">-</td>');
          row.push('<td class="right" data-value="-">-</td>');
        }

        $('<tr/>', {
          html: row.join(''),
          id: tab.namespace === '' ? '-' : tab.namespace
        }).appendTo('#tableList');
        
        numTables++;
      });
    }
  });
  if (numTables === 0) {
    var item = '<td class="center" colspan="13"><i>Empty</i></td>';
        
    $('<tr/>', {
      html: item
    }).appendTo('#tableList');
  }
}

function sortTable(n) {
  if (!JSON.parse(sessionStorage.namespaceChanged)) {
    if (sessionStorage.tableColumnSort !== undefined && sessionStorage.tableColumnSort == n && sessionStorage.direction !== undefined) {
      direction = sessionStorage.direction === 'asc' ? 'desc' : 'asc';
    } else {
      direction = sessionStorage.direction === undefined ? 'asc' : sessionStorage.direction;
    }
  } else {
    direction = sessionStorage.direction === undefined ? 'asc' : sessionStorage.direction;
  }
      
  sessionStorage.tableColumnSort = n;
      
  sortTables('tableList', direction, n);
  sessionStorage.namespaceChanged = false;
}
  
$(function() {
  $(document).tooltip();
});

function createHeader() {
  var items = [];
  
  items.push('<th class="firstcell" onclick="sortTable(0)">Table&nbsp;Name&nbsp;</th>');
  items.push('<th onclick="sortTable(1)">State&nbsp;</th>');
  items.push('<th onclick="sortTable(2)" title="'+descriptions['# Tablets']+'">#&nbsp;Tablets&nbsp;</th>');
  items.push('<th onclick="sortTable(3)" title="'+descriptions['# Offline Tablets']+'">#&nbsp;Offline<br />Tablets&nbsp;</th>');
  items.push('<th onclick="sortTable(4)" title="'+descriptions['Entries']+'">Entries&nbsp;</th>');
  items.push('<th onclick="sortTable(5)" title="'+descriptions['Entries in Memory']+'">Entries<br />In&nbsp;Memory&nbsp;</th>');
  items.push('<th onclick="sortTable(6)" title="'+descriptions['Ingest']+'">Ingest&nbsp;</th>');
  items.push('<th onclick="sortTable(7)" title="'+descriptions['Entries Read']+'">Entries<br />Read&nbsp;</th>');
  items.push('<th onclick="sortTable(8)" title="'+descriptions['Entries Returned']+'">Entries<br />Returned&nbsp;</th>');
  items.push('<th onclick="sortTable(9)" title="'+descriptions['Hold Time']+'">Hold&nbsp;Time&nbsp;</th>');
  items.push('<th onclick="sortTable(10)" title="'+descriptions['Running Scans']+'">Running<br />Scans&nbsp;</th>');
  items.push('<th onclick="sortTable(11)" title="'+descriptions['Minor Compactions']+'">Minor<br />Compactions&nbsp;</th>');
  items.push('<th onclick="sortTable(12)" title="'+descriptions['Major Compactions']+'">Major<br />Compactions&nbsp;</th>');

  $('<tr/>', {
    html: items.join('')
  }).appendTo('#tableList');
}

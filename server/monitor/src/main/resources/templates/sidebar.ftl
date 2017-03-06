<#--
  Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
      <div id='nav'>
        <ul class="nav nav-pills">
          <li><a href="/">Overview</a></li>
          <li role="presentation" class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
              Servers <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
              <li><a href="/master">Master&nbsp;Server</a></li>
              <li><a href="/tservers">Tablet&nbsp;Servers</a></li>
              <li><a href="/gc">Garbage&nbsp;collector</a></li>
            </ul>
          </li>
          <li><a href="/tables">Tables</a></li>
          <li role="presentation" class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
              Activity <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
              <li><a href="/scans">Active&nbsp;Scans</a></li>
              <li><a href="/bulkImports">Bulk&nbsp;Imports</a></li>
              <li><a href="/vis">Server&nbsp;Activity</a></li>
              <li><a href="/replication">Replication</a></li>
            </ul>
          </li>
          <li role="presentation" class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
              Debug <span class='smalltext <#if num_logs gt 0 || num_problems gt 0><#if logs_have_error?? && logs_have_error || num_problems gt 0>error<#else>warning</#if></#if>'>(${num_logs + num_problems})</span><span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
              <li><a href="/trace/summary?minutes=10">Recent&nbsp;Traces</a></li>
              <li><a href="/log">Recent&nbsp;Logs&nbsp;<span class='smalltext <#if  num_logs gt 0><#if logs_have_error?? && logs_have_error>error<#else>warning</#if></#if>'>(${num_logs})</span></a></li>
              <li><a href="/problems">Table&nbsp;Problems&nbsp;<span class='smalltext <#if num_problems gt 0>error</#if>'>(${num_problems})</span></a></li>             
            </ul>
          </li>
          <li role="presentation" class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
              API <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
              <li><a href="/xml">XML</a></li>
              <li><a href="/rest/json">JSON</a></li>
            </ul>
          </li>
          <#if is_ssl>
            <li><a href="/shell">Shell</a></li>
          </#if>
          
        </ul>
      </div>
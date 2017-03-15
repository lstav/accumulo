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
package org.apache.accumulo.monitor.rest.api;

/**
 * A single problem
 */
public class ProblemDetailInformation {

  public String tableName, tableID, type, server;
  public Long time;
  public String resource, exception;

  public ProblemDetailInformation() {}

  public ProblemDetailInformation(String tableName, String tableID, String type, String server, Long time, String resource, String exception) {
    this.tableName = tableName;
    this.tableID = tableID;
    this.type = type;
    this.server = server;
    this.time = time;
    this.resource = resource;
    this.exception = exception;
  }
}

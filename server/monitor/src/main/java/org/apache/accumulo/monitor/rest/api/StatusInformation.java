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

public class StatusInformation {

  public String masterStatus, gcStatus, tServerStatus;

  public Integer logNumber;
  public boolean logsHaveError;
  public Integer problemNumber;

  public StatusInformation() {
    this.masterStatus = null;
    this.gcStatus = null;
    this.tServerStatus = null;
    this.logNumber = 0;
    this.logsHaveError = false;
    this.problemNumber = 0;
  }

  public StatusInformation(String masterStatus, String gcStatus, String tServerStatus, Integer logNumber, boolean logsHaveError, Integer problemNumber) {
    this.masterStatus = masterStatus;
    this.gcStatus = gcStatus;
    this.tServerStatus = tServerStatus;
    this.logNumber = logNumber;
    this.logsHaveError = logsHaveError;
    this.problemNumber = problemNumber;

  }
}

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

import org.apache.accumulo.core.gc.thrift.GcCycleStats;

/**
 * Metrics about a single cycle of the garbage collector
 */
public class GarbageCollectorCycle {

  public static final GarbageCollectorCycle EMPTY = new GarbageCollectorCycle();

  public long started, finished, candidates, inUse, deleted, errors;

  public GarbageCollectorCycle() {
    started = finished = candidates = inUse = deleted = errors = 0l;
  }

  public GarbageCollectorCycle(GcCycleStats thriftStats) {
    this.started = thriftStats.started;
    this.finished = thriftStats.finished;
    this.candidates = thriftStats.candidates;
    this.inUse = thriftStats.inUse;
    this.deleted = thriftStats.deleted;
    this.errors = thriftStats.errors;
  }
}

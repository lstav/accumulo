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
package org.apache.accumulo.monitor.rest;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.net.URI;

import org.apache.accumulo.core.Constants;
import org.apache.accumulo.core.client.Instance;
import org.apache.accumulo.core.util.Daemon;
import org.apache.accumulo.core.zookeeper.ZooUtil;
import org.apache.accumulo.fate.util.LoggingRunnable;
import org.apache.accumulo.fate.util.UtilWaitThread;
import org.apache.accumulo.fate.zookeeper.ZooUtil.NodeExistsPolicy;
import org.apache.accumulo.monitor.Monitor;
import org.apache.accumulo.monitor.ZooKeeperStatus;
import org.apache.accumulo.server.AccumuloServerContext;
import org.apache.accumulo.server.conf.ServerConfigurationFactory;
import org.apache.accumulo.server.zookeeper.ZooReaderWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.net.HostAndPort;

/**
 *
 */
public abstract class MonitorApplication implements Runnable {
  private static final Logger log = LoggerFactory.getLogger(MonitorApplication.class);

  protected URI getServerUri() {
    return URI.create("http://localhost:50096/accumulo");
  }

  protected void advertiseHttpAddress(Instance instance, String hostname, int port) {
    try {
      String monitorAddress = HostAndPort.fromParts(hostname, port).toString();

      log.debug("Using " + monitorAddress + " to advertise monitor location in ZooKeeper");

      ZooReaderWriter.getInstance().putPersistentData(ZooUtil.getRoot(instance) + Constants.ZMONITOR_HTTP_ADDR, monitorAddress.getBytes(UTF_8),
          NodeExistsPolicy.OVERWRITE);
      log.info("Set monitor address in zookeeper to " + monitorAddress);
    } catch (Exception ex) {
      log.error("Unable to set monitor HTTP address in zookeeper", ex);
    }
  }

  protected void startDataDaemons(ServerConfigurationFactory config, Instance instance, AccumuloServerContext serverContext) {
    Monitor.setConfig(config);
    Monitor.setInstance(instance);
    Monitor.setContext(serverContext);

    // Preload data
    try {
      Monitor.fetchData();
    } catch (Exception e) {
      log.warn(e.getMessage(), e);
    }

    try {
      Monitor.fetchScans();
    } catch (Exception e) {
      log.warn(e.getMessage(), e);
    }

    // Start daemons
    new Daemon(new LoggingRunnable(log, new ZooKeeperStatus()), "ZooKeeperStatus").start();

    // need to regularly fetch data so plot data is updated
    new Daemon(new LoggingRunnable(log, new Runnable() {

      @Override
      public void run() {
        while (true) {
          try {
            Monitor.fetchData();
          } catch (Exception e) {
            log.warn(e.getMessage(), e);
          }

          UtilWaitThread.sleep(333);
        }

      }
    }), "Data fetcher").start();

    new Daemon(new LoggingRunnable(log, new Runnable() {
      @Override
      public void run() {
        while (true) {
          try {
            Monitor.fetchScans();
          } catch (Exception e) {
            log.warn(e.getMessage(), e);
          }
          UtilWaitThread.sleep(5000);
        }
      }
    }), "Scan scanner").start();
  }
}

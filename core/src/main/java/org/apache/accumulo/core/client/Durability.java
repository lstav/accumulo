package org.apache.accumulo.core.client;

import org.apache.accumulo.core.tabletserver.thrift.TDurability;

/**
 * The value for the durability of a BatchWriter or ConditionalWriter.
 * @since 1.7.0
 */
public enum Durability {
  // Note, the order of these is important; the "highest" Durability is used in group commits.
  /**
   * Use the durability as specified by the table or system configuration.
   */
  DEFAULT,
  /**
   * Don't bother writing mutations to the write-ahead log.
   */
  NONE,
  /**
   * Write mutations the the write-ahead log. Data may be sitting the the servers output buffers, and not replicated anywhere.
   */
  LOG,
  /**
   * Write mutations to the write-ahead log, and ensure the data is stored on remote servers, but perhaps not on persistent storage.
   */
  FLUSH,
  /**
   * Write mutations to the write-ahead log, and ensure the data is saved to persistent storage.
   */
  SYNC;

  // for internal use only
  public TDurability toThrift() {
    switch (this) {
      case DEFAULT:
        return TDurability.DEFAULT;
      case SYNC:
        return TDurability.SYNC;
      case FLUSH:
        return TDurability.FLUSH;
      case LOG:
        return TDurability.LOG;
      default:
        return TDurability.NONE;
    }
  }

  // for internal use only
  static public Durability fromString(String value) {
    try {
      return Durability.valueOf(value.toUpperCase());
    } catch (IllegalArgumentException ex) {
      return Durability.SYNC;
    }
  }

  // for internal use only
  public static Durability fromThrift(TDurability tdurabilty) {
    if (tdurabilty == null) {
      return Durability.DEFAULT;
    }
    switch (tdurabilty) {
      case DEFAULT:
        return Durability.DEFAULT;
      case SYNC:
        return Durability.SYNC;
      case FLUSH:
        return Durability.FLUSH;
      case LOG:
        return Durability.LOG;
      default:
        return Durability.NONE;
    }
  }

  // for internal use only
  public Durability resolveDurability(Durability tabletDurability) {
    if (this == Durability.DEFAULT) {
      return tabletDurability;
    }
    return this;
  }
}
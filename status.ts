/** Standard WebSocket status codes.
 * RFC 6455, 7.4.1
 */
export enum Status {
  NormalClosure = 1000,
  GoingAway = 1001,
  ProtocolError = 1002,
  UnsupportedData = 1003,
  Reserved = 1004,
  NoStatusRcvd = 1005,
  AbnormalClosure = 1006,
  InvalidFramePayloadData = 1007,
  PolicyViolation = 1008,
  MessageTooBig = 1009,
  MandatoryExt = 1010,
  InternalServerError = 1011,
  TLSHandshake = 1015,
}

/** A record of all the status codes text.
 * ```ts
 * import {
 *   Status,
 *   STATUS_TEXT,
 * } from "https://deno.land/x/http_websocket@$VERSION/mod.ts";
 * import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";
 * assertEquals(Status.NormalClosure, 1000);
 * assertEquals(STATUS_TEXT[Status.NormalClosure], "Normal Closure");
 * ```
 */
export const STATUS_TEXT: Readonly<Record<Status, string>> = {
  [Status.NormalClosure]: "Normal Closure",
  [Status.GoingAway]: "Going Away",
  [Status.ProtocolError]: "Protocol error",
  [Status.UnsupportedData]: "Unsupported Data",
  [Status.Reserved]: "---Reserved----",
  [Status.NoStatusRcvd]: "No Status Rcvd",
  [Status.AbnormalClosure]: "Abnormal Closure",
  [Status.InvalidFramePayloadData]: "Invalid frame payload data",
  [Status.PolicyViolation]: "Policy Violation",
  [Status.MessageTooBig]: "Message Too Big",
  [Status.MandatoryExt]: "Mandatory Ext.",
  [Status.InternalServerError]: "Internal Server Error",
  [Status.TLSHandshake]: "TLS handshake",
};

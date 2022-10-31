import React, { useState } from "react";

const symbols = ["BTC-MOVE-09-04", "BTC/USD"];
const channels = ['trades', 'orderbook'];

const ws_init = function () {
  const ws = new WebSocket("wss://ftx.com/ws/");

  ws.onopen = function () {
    for (var s of symbols) {
      for (var c of channels) {
        ws.send(`{"op": "subscribe", "channel": "${c}", "market": "${s}"}`);
      }
    }
  };

  ws.onclose = function () {
    setTimeout(ws_init(), 5000);
  };

  ws.onerror = function (error) {
    console.log("WS error: " + error);
  };

  const ping = function () {
    ws.send('{"op":"ping"}');
  };

  setInterval(ping, 10000);
  return ws;
};

const ws = ws_init();

export { ws };

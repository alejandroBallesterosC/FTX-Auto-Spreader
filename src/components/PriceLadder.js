import React, { useState } from "react";
import { ws } from "./session";
import "./PriceLadder.css";
import { sendOrder } from "./rest-client";


function PriceLadder() {
  const NUM_LEVELS = 10;
  var asksArray = Array(NUM_LEVELS).fill({ price: 0, qty: 0 });
  var bidsArray = Array(NUM_LEVELS).fill({ price: 0, qty: 0 });
  const [asks, setAsks] = useState(asksArray);
  const [bids, setBids] = useState(bidsArray);

  ws.onmessage = function (e) {
    let data = JSON.parse(e.data);
    if (
      //if first time receiving orderbook
      data.channel == "orderbook" &&
      data.market == "BTC/USD" &&
      data.data.action == "partial"
    ) {
      for (var i = 0; i < NUM_LEVELS; i++) {
        asksArray[i].price = data.data.asks[i][0];
        asksArray[i].qty = data.data.asks[i][1];
      }
      for (var i = 0; i < NUM_LEVELS; i++) {
        bidsArray[i].price = data.data.bids[i][0];
        bidsArray[i].qty = data.data.bids[i][1];
      }
      setAsks(asksArray);
      setBids(bidsArray);
      //console.log(asksArray);
    } else if (
      //if updating an already loaded orderbook
      data.channel == "orderbook" &&
      data.market == "BTC/USD" &&
      data.data.action == "update"
    ) {
      //update asks
      //console.log("Best Ask: ", data.data.asks[0]);
      var updatedAsks = [];
      var numZeroAsks = 0;
      var askToPush = null;
      var i = 0;
      var j = 0;
      while (updatedAsks.length < NUM_LEVELS) {
        if (i < data.data.asks.length && j < asks.length) {
          if (asks[j].price < data.data.asks[i][0]) {
            askToPush = asks[j];
            j++;
          } else if (asks[j].price == data.data.asks[i][0]) {
            askToPush = {
              price: data.data.asks[i][0],
              qty: data.data.asks[i][1],
            };
            i++;
            j++;
          } else {
            askToPush = {
              price: data.data.asks[i][0],
              qty: data.data.asks[i][1],
            };
            i++;
          }
        } else if (j < asks.length) {
          askToPush = asks[j];
          j++;
        }
        updatedAsks.push(askToPush);
        if (askToPush.qty == 0) {
          numZeroAsks += 1;
        }
      }

      var updatedBids = [];
      var numZeroBids = 0;
      var bidToPush = null;
      i = 0;
      j = 0;
      while (updatedBids.length < NUM_LEVELS) {
        if (i < data.data.bids.length && j < bids.length) {
          if (bids[j].price > data.data.bids[i][0]) {
            bidToPush = bids[j];
            j++;
          } else if (bids[j].price == data.data.bids[i][0]) {
            bidToPush = {
              price: data.data.bids[i][0],
              qty: data.data.bids[i][1],
            };
            i++;
            j++;
          } else {
            bidToPush = {
              price: data.data.bids[i][0],
              qty: data.data.bids[i][1],
            };
            i++;
          }
        } else if (j < bids.length) {
          bidToPush = bids[j];
          j++;
        }
        updatedBids.push(bidToPush);
        if (bidToPush.qty == 0) {
          numZeroBids += 1;
        }
      }


      if (numZeroAsks >= 5 || numZeroBids >= 5) {
        ws.send(`{"op": "unsubscribe", "channel": "orderbook", "market": "BTC/USD"}`);
        ws.send(`{"op": "subscribe", "channel": "orderbook", "market": "BTC/USD"}`);
      } else {
        setAsks(updatedAsks);
        setBids(updatedBids);
      }
    }
  };
  const isNonZero = (order) => order.qty != 0;

  function submitPassiveOrder (order) {
    console.log(order.price)
    sendOrder("BTC/USD", 'SELL', order.price,  0.000001);
  }
  

  return (
    <div>
      <table>
        <tbody>
          <tr className="product-header"><td></td><td>BTC/USD</td><td></td></tr>
          {[...asks]
            .reverse()
            .filter(isNonZero)
            .map((ask, index) => (
              //slice(0, NUM_LEVELS)
              // Setting "index" as key because name and age can be repeated, It will be better if you assign uniqe id as key
              <tr key={index} className='ask'>
                <td></td>
                <td className = "price">
                  {ask.price}
                </td>
                <td className = "quantity" onClick={() => submitPassiveOrder(ask)}>
                  {ask.qty}
                </td>
              </tr>
            ))}
            <tr className="divider"><td/><td/><td/></tr>
            {[...bids]
            .filter(isNonZero)
            .map((bid, index) => (
              //slice(0, NUM_LEVELS)
              // Setting "index" as key because name and age can be repeated, It will be better if you assign uniqe id as key
              <tr key={index} className="bid">
                <td className="quantity">
                  {bid.qty}
                </td>
                <td className = "price">
                  {bid.price}
                </td>
                <td></td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default PriceLadder;

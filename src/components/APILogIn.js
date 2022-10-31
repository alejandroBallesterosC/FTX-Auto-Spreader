import React, { useState } from "react";
import "./APILogIn.css";
import {ws} from "./session"


function APILogIn() {

  const [enteredAPIKey, setAPIKey] = useState();
  const [btc_usd, setBtcUsd] = useState(null);

  function textChangeHandler(event) {
    setAPIKey(event.target.value);
  }

  const submitHandler = (event) => {
    event.preventDefault(); //prevents reloading in the browser
    const API_KEY = enteredAPIKey;
    console.log(API_KEY);
  };

  ws.onmessage = function (e) {
    let data = JSON.parse(e.data);
    if (data.channel == "trades" && data.type == "update" && data.market == "BTC/USD") {
        setBtcUsd(data.data[0].price);
        //console.log(data)
    }
  };

  return (
    <div>
      <form onSubmit={submitHandler}>
        <div className="api-log-in">
          <label>FTX API KEY</label>
          <input type="text" onChange={textChangeHandler} />
        </div>
        <button> Authenticate </button>
      </form>
      <div>
        <p> BTC/USD </p>
        <p>{btc_usd}</p>
      </div>
    </div>
  );
}

export default APILogIn;

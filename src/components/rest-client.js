import axios, { AxiosRequestConfig } from 'axios';
import APIAUTH from './FTX API KEY.txt';
import forge from 'node-forge';


let API_KEY;
let API_SECRET;

fetch(APIAUTH)
  .then(r => r.text())
  .then(text => {
    API_KEY = text.substring(10, 50)
    API_SECRET = text.substring(64);
  });

let time = new Date().getTime();

// generate and return hash
function generateHash(plainText, secretKey){
    let hmac = forge.hmac.create();  
        hmac.start('sha256', secretKey);
        hmac.update(plainText);  
        var hashText = hmac.digest().toHex();  
        return hashText
    }      

function sendOrder(market, side, price, size){
    
    axios({
    method: 'POST',
    url: 'https://ftx.com/api/orders',
    data: {
        "market": market,
        "side": side,
        "price": price,
        "type": "limit",
        "size": size,
        "reduceOnly": false,
        "ioc": false,
        "postOnly": false,
        "clientId": null
    },
    headers: {
        'Access-Control-Allow-Origin': "http://localhost:3000/",
        "FTX-KEY": API_KEY,
        "FTX-TS": time,
        "FTX-SIGN": generateHash(`${new Date()}${"POST"}${"/orders"}`, API_SECRET),
    }
  })
}

export { sendOrder };
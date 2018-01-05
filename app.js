const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", socket => {
    console.log("New client connected"), setInterval(
      () => getApisAndEmit(socket),
      10000
    );
    socket.on("disconnect", () => console.log("Client disconnected"));
});

const getApisAndEmit = async socket => {
    try {
    //   const res = await axios.get(
    //     "https://api.darksky.net/forecast/0d92a3c9a12c1f5da066588b33ebdd06/59.334591,18.063240"
    //   ); // Getting the data from DarkSky 
    //   let temperatureCelcius = (res.data.currently.temperature - 32) * 5/9;
      const bittrexRes = await axios.get(
        "https://bittrex.com/api/v1.1/public/getticker?market=BTC-LTC"
      ); // Getting the data from Bittrex
      const cryptoCompareRes = await axios.get(
        "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR"
      ); // Getting the data from CryptoCompare
      const cryptoWatchRes = await axios.get(
        "https://api.cryptowat.ch/markets/gdax/btcusd/summary"
      ); // Getting the data from CryptoWatch
      const bitfinexRes = await axios.get(
        "https://api.bitfinex.com/v1/book/btcusd"
      ); // Getting the data from Bitfinex       
      const newsapiRes = await axios.get(
        "https://newsapi.org/v2/top-headlines?sources=the-economist&apiKey=a9abbe3465e94ced9e86589daaefcbcd"
      ); // Getting the data from News API
      // Emitting new messages. They will be consumed by the client
      //   socket.emit("DarkSkyAPI", res.data.currently.temperature);
      socket.emit("BittrexAPI", bittrexRes.data.result.Last);
      socket.emit("CryptoCompareAPI", cryptoCompareRes.data);
      socket.emit("CryptoWatchAPI", cryptoWatchRes.data.result.price.last);
      socket.emit("BitfinexAPI", bitfinexRes.data.bids[0].price);
      socket.emit("NewsAPI", newsapiRes.data.articles[0]);
    } catch (error) {
      console.error(`Error: ${error.code}`);
    }
};

server.listen(port, () => console.log(`Listening on port ${port}`));

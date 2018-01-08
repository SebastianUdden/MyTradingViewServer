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
    // Run when connection opens
    getApisAndEmit(socket);
    
    // Run every minute
    console.log("New client connected"), setInterval(
      () => getApisAndEmit(socket),
      600000
    );
    socket.on("disconnect", () => console.log("Client disconnected"));
});

const getApisAndEmit = async socket => {
    try {
      // GET requests
      const bittrexRes = await axios.get("https://bittrex.com/api/v1.1/public/getticker?market=BTC-LTC");
      const cryptoCompareRes = await axios.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR");
      const cryptoWatchRes = await axios.get("https://api.cryptowat.ch/markets/gdax/btcusd/summary");
      const bitfinexRes = await axios.get("https://api.bitfinex.com/v1/book/btcusd");
      const newsapiRes = await axios.get("https://newsapi.org/v2/top-headlines?sources=the-economist&apiKey=a9abbe3465e94ced9e86589daaefcbcd");

      const bloombergRes = await axios.get("https://newsapi.org/v2/top-headlines?sources=bloomberg&apiKey=a9abbe3465e94ced9e86589daaefcbcd");
      const businessInsiderRes = await axios.get("https://newsapi.org/v2/top-headlines?sources=business-insider&apiKey=a9abbe3465e94ced9e86589daaefcbcd");
      const cnnRes = await axios.get("https://newsapi.org/v2/top-headlines?sources=cnn&apiKey=a9abbe3465e94ced9e86589daaefcbcd");
      const cnbcRes = await axios.get("https://newsapi.org/v2/top-headlines?sources=cnbc&apiKey=a9abbe3465e94ced9e86589daaefcbcd");

      // Emitting new messages. They will be consumed by the client
      socket.emit("BittrexAPI", bittrexRes.data.result.Last);
      socket.emit("CryptoCompareAPI", cryptoCompareRes.data);
      socket.emit("CryptoWatchAPI", cryptoWatchRes.data.result.price.last);
      socket.emit("BitfinexAPI", bitfinexRes.data.bids[0].price);

      socket.emit("BloombergArticles", bloombergRes.data.articles);
      socket.emit("BusinessInsiderArticles", businessInsiderRes.data.articles);
      socket.emit("CnnArticles", cnnRes.data.articles);
      socket.emit("CnbcArticles", cnbcRes.data.articles);
      
      socket.emit("NewsAPI", newsapiRes.data.articles[0]);
    } catch (error) {
      console.error(`Error: ${error.code}`);
      console.error(`ErrorObject: ${error}`);
    }
};

server.listen(port, () => console.log(`Listening on port ${port}`));
      //   socket.emit("DarkSkyAPI", res.data.currently.temperature);
    //   const res = await axios.get(
    //     "https://api.darksky.net/forecast/0d92a3c9a12c1f5da066588b33ebdd06/59.334591,18.063240"
    //   ); // Getting the data from DarkSky 
    //   let temperatureCelcius = (res.data.currently.temperature - 32) * 5/9;
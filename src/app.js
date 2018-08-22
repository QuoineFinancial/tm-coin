const createABCIServer = require('./server')
const Coin = require('../lib/coin')


// require('debug').enable('abci*')
const intialSupply = 1000000
const dcoin = new Coin({'1Anr1hPt6g8pHoNkQt9bA6yGMavkGjVqQA': intialSupply})
const port = process.env.PORT || 46658
console.log(dcoin.tmHandlers());

createABCIServer(dcoin.tmHandlers()).listen(port, () => {
  console.log(`listening on port ${port}`)
})

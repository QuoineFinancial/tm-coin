let createABCIServer = require('..')
let decodeTx = require('./tx-encoding.js').decode
let { normalizeTx } = require('./common.js')
let getSigHash = require('./sigHash.js')
const Accounts = require('./accounts.js')

// turn on debug logging
require('debug').enable('abci*')


let state = {}

let handlers = {
  info (request) {
    return {
      data: 'Node.js counter app',
      version: '0.0.0',
      lastBlockHeight: 0,
      lastBlockAppHash: Buffer.alloc(0)
    }
  },

  checkTx (request) {
    return { code: 0, log: 'tx succeeded' }
  },

  deliverTx (request) {
    console.log(state)
    let rawTx = request.tx
    let tx = decodeTx(rawTx)
    if (tx.from == null || tx.to == null) {
      return { code: 1, log: 'not a coin tx' }
    }

    // convert tx to canonical format
    normalizeTx(tx)
    let inputs = tx.from
    let outputs = tx.to

    // add sigHash
    tx.sigHash = getSigHash({ from: inputs, to: outputs })

    // process inputs and outputs
    for (let input of inputs) {
      Accounts.onInput(input, tx, state)
    }
    for (let output of outputs) {
      Accounts.onOutput(output, tx, state)
    }
    return { code: 0, log: 'tx succeeded' }
  }
}

let port = 46658
createABCIServer(handlers).listen(port, () => {
  console.log(`listening on port ${port}`)
})


let decodeTx = require('./tx-encoding').decode
let {normalizeTx, inOutCheck} = require('./common')
let getSigHash = require('./sighash')
const Accounts = require('./accounts')

// turn on debug logging
// require('debug').enable('abci*')


function _info(request) {
  return {
    data: 'BCoin Version 1.0',
    version: '0.1',
    lastBlockHeight: 0,
    lastBlockAppHash: Buffer.alloc(0)
  }
}

function _checkTx(request) {
  let rawTx = request.tx
  let tx = decodeTx(rawTx)
  if (tx.from == null || tx.to == null) {
    return { code: 1, log: 'not a tx' }
  }
  normalizeTx(tx)
  let inputs = tx.from
  let outputs = tx.to
  try{
    inOutCheck(inputs, outputs)
  } catch(err) {
    return {code: 1, log: err.toString()}
  }

  return { code: 0, log: 'tx succeeded' }
}

function _deliverTx(request, state){
  let rawTx = request.tx
  let tx = decodeTx(rawTx)

  // convert tx to canonical format
  // (e.g. ensure `to` and `from` are arrays)
  normalizeTx(tx)
  
  let inputs = tx.from
  let outputs = tx.to
  
  // add properties to tx object
  // TODO: use a getter func (and cache the result)
  tx.sigHash = getSigHash({ from: inputs, to: outputs })

  try{
    for (let input of inputs) {
      Accounts.onInput(input, tx, state)
    }
    for (let output of outputs) {
      Accounts.onOutput(output, tx, state)
    }  
  } catch(err) {
    return {code: 1, log: err.toString()}
  }

  console.log(state)
  return { code: 0, log: 'tx succeeded' }
}


class Coin {
  constructor(initialBalances){
    this.state = {}
    for (const address in initialBalances) {
      if (initialBalances.hasOwnProperty(address)) {
        //TODO address validation
        this.state[address] = { nonce: 0, balance: initialBalances[address] }
      }
    }    
  }

  tmHandlers() {
    const state = this.state
    return {
      info (request) {
        return _info(request) 
      },
      checkTx (request) {
        return _checkTx(request)
      },
      deliverTx (request) {
        return _deliverTx(request, state)
      }
    }
  }
}

module.exports = Coin




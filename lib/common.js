let { createHash } = require('crypto')
let base58check = require('bs58check')

function hashFunc (algo) {
  return (data) => createHash(algo).update(data).digest()
}

let sha256 = hashFunc('sha256')
let ripemd160 = hashFunc('ripemd160')
const VERSION = 0x00;
function addressHash (data) {
  let version = Buffer.from([VERSION]);
  let hash = ripemd160(sha256(data));
  return base58check.encode(Buffer.concat([version, hash]));
}

// make sure in/out are arrays
function normalizeTx (tx) {
  if (!Array.isArray(tx.from)) tx.from = [ tx.from ]
  if (!Array.isArray(tx.to)) tx.to = [ tx.to ]
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function inoutItemCheck(inout) {
  if (typeof inout.amount !== 'number') {
    throw Error('Inputs and outputs must have a number `amount`')
  }
  if (inout.amount < 0) {
    throw Error('Amount must be >= 0')
  }
  if (!Number.isInteger(inout.amount)) {
    throw Error('Amount must be an integer')
  }
  if (inout.amount > Number.MAX_SAFE_INTEGER) {
    throw Error(`Amount must be <= ${Number.MAX_SAFE_INTEGER}`)
  }
}

function inOutCheck(inputs, outputs) {
  for(const input of inputs){
    inoutItemCheck(input)
  }
  for(const output of outputs){
    inoutItemCheck(output)
  }
  let inputSum = inputs.reduce((sum, { amount }) => sum + amount, 0)
  if (inputSum > Number.MAX_SAFE_INTEGER) {
    throw Error(`Total input must be <= ${Number.MAX_SAFE_INTEGER}`)
  }
  let outputSum = inputs.reduce((sum, { amount }) => sum + amount, 0)
  if (outputSum > Number.MAX_SAFE_INTEGER) {
    throw Error(`Total output be <= ${Number.MAX_SAFE_INTEGER}`)
  }
  if (inputSum !== outputSum) {
    throw Error('Sum of inputs and outputs must match')
  }
}

module.exports = {
  sha256,
  ripemd160,
  addressHash,
  normalizeTx,
  inOutCheck,
  clone
}

let { clone, sha256, normalizeTx } = require('./common.js')
let { stringify, parse } = require('deterministic-json')

module.exports = function getSigHash (tx) {
  tx = clone(tx)
  normalizeTx(tx)

  for (let input of tx.from) {
    for (let key in input) {
      if (key === 'signature' || key === 'signatures') {
        delete input[key]
      }
    }
  }
  let txString = stringify(tx)
  return sha256(txString)
}

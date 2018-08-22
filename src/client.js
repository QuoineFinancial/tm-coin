let axios = require('axios')
let secp = require('secp256k1')
let { sha256, addressHash } = require('../lib/common.js')
let getSigHash = require('../lib/sighash.js')
let encodeTx = require('../lib/tx-encoding.js').encode

let priv = sha256('quoine')
let pub = secp.publicKeyCreate(priv)
console.log(addressHash(pub))

let priv2 = sha256('chinh')
let pub2 = secp.publicKeyCreate(priv2)
let address2 = addressHash(pub2)

async function main () {
  let tx = {
    from: {
      amount: 5,
      pubkey: pub,
      nonce: 0
    },
    to: {
      amount: 5,
      address: address2
    }
  }

  // sign tx
  let sigHash = getSigHash(tx)
  tx.from.signature = secp.sign(sigHash, priv).signature
  console.log(tx)

  let nonce = Math.floor(Math.random() * (2 << 12))
  let txBytes = '0x'+encodeTx(tx, nonce).toString('hex')
  console.log(txBytes)
  let result = await axios.get('http://127.0.0.1:46657/broadcast_tx_commit', {
    params: {
      tx: txBytes
    }
  })
  console.log(result.data)

}
main()

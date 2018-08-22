const { addressHash } = require('./common.js')
const secp256k1 = require('secp256k1')

const Accounts = {
  getAddress (input) {
    return addressHash(input.pubkey)
  },

  // validate spend condition, e.g valid signature
  onSpend ({ pubkey, signature }, { sigHash }) {
    // verify signature
    if (!secp256k1.verify(sigHash, signature, pubkey)) {
      throw Error('Invalid signature')
    }
  },

  onInput (input, tx, state) {
    let { amount, nonce } = input

    if (!Number.isInteger(nonce)) {
      throw Error('Nonce must be an integer')
    }

    let address = Accounts.getAddress(input)
    let account = state[address]
    if (account == null) {
      throw Error(`Account "${address}" does not exist`)
    }

    // verify account balance/nonce
    if (nonce !== account.nonce) {
      throw Error(`Invalid nonce, expect "${account.nonce}"`)
    }

    if (account.balance < amount) {
      throw Error('Insufficient funds')
    }

    // throw if signature is not valid
    Accounts.onSpend(input, tx)

    // debit account
    account.balance -= amount
    account.nonce += 1
  },

  onOutput ({ address, amount }, tx, state) {
    if (state[address] == null) {
      state[address] = { balance: 0, nonce: 0 }
    }

    state[address].balance += amount

    if (state[address].balance > Number.MAX_SAFE_INTEGER) {
      throw Error(`Account balance must be <= ${Number.MAX_SAFE_INTEGER}`)
    }
  }
}

module.exports = Accounts

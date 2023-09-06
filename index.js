const ldpos = require('ldpos-client');
const { convertWalletAddressToId } = require('./utils');
const { validateCredentials } = require('./validate');

const DEFAULT_CURRENCY_UNIT_SIZE = 100000000;

class CapitaliskAuthProvider {
  constructor(options) {
    let {
      hostname,
      port,
      networkSymbol,
      chainModuleName,
      secure,
      minAccountBalance,
      currencyUnitSize
    } = options || {};

    this.minAccountBalance = minAccountBalance;
    this.currencyUnitSize = BigInt(
      currencyUnitSize == null ? DEFAULT_CURRENCY_UNIT_SIZE : currencyUnitSize
    );
    this.networkSymbol = networkSymbol;
    this.walletAddressRegExp = new RegExp(`^${networkSymbol}[0-9a-f]{40}$`);
    this.ldposClient = ldpos.createClient({
      hostname,
      port,
      networkSymbol,
      chainModuleName,
      secure
    });
  }

  async authenticate(credentials) {
    validateCredentials(credentials, {
      walletAddressRegExp: this.walletAddressRegExp
    });

    let { type, passphrase, walletAddress } = credentials || {};
    if (!type) {
      type = 'sig';
    }

    let account;
    try {
      account = await this.ldposClient.getAccount(walletAddress);
    } catch (error) {
      throw new Error(`The account with wallet address ${walletAddress} was not initialized with any tokens`);
    }
    let accountBalance = Number(BigInt(account.balance) * 100n / this.currencyUnitSize) / 100;
    if (accountBalance < this.minAccountBalance) {
      throw new Error(
        `The balance of the account with wallet address ${
          walletAddress
        } did meet the minimum requirement of ${
          this.minAccountBalance
        } ${
          this.networkSymbol.toUpperCase()
        } tokens`
      );
    }

    let accountKeyIndex;
    let accountPublicKey;
    if (type === 'sig') {
      accountKeyIndex = account.nextSigKeyIndex;
      accountPublicKey = account.sigPublicKey;
    } else {
      accountKeyIndex = account.nextMultisigKeyIndex;
      accountPublicKey = account.multisigPublicKey;
    }
    if (accountKeyIndex == null || accountPublicKey == null) {
      // Alternative authentication for accounts which have not yet been initialized.
      let derivedWalletAddress = await ldpos.computeWalletAddressFromPassphrase(passphrase);
      if (type === 'sig' && derivedWalletAddress === walletAddress) {
        return {
          walletAddress,
          accountBalance
        };
      }
      throw new Error(`Authentication via ${type} key was not supported on the specified account`);
    }

    let publicKey;
    try {
      let seed = ldpos.computeSeedFromPassphrase(passphrase);
      let treeIndex = ldpos.computeTreeIndex(accountKeyIndex);
      publicKey = await ldpos.computePublicKeyFromSeed(this.networkSymbol, seed, type, treeIndex);
    } catch (error) {
      throw new Error(`Failed to verify passphrase`);
    }

    if (publicKey !== accountPublicKey) {
      throw new Error(
        `The specified credentials did not correspond to the ${
          type
        } public key of the account`
      );
    }

    return {
      walletAddress,
      accountBalance
    };
  }

  async connect(options) {
    return this.ldposClient.connect(options);
  }

  disconnect() {
    this.ldposClient.disconnect();
  }
}

module.exports = {
  CapitaliskAuthProvider,
  convertWalletAddressToId
};

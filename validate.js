function validateObject(value, maxPropCount, path) {
  if (value == null || typeof value !== 'object') {
    throw new Error(`Value at ${path} is not an object`);
  }
  if (Object.keys(value).length > maxPropCount) {
    throw new Error(
      `Object at ${path} exceeded the size limit of ${maxPropCount} properties`
    );
  }
}

function validateKeyType(value, path) {
  if (value !== 'sig' && value !== 'multisig') {
    throw new Error(`Value at ${path} is not a valid key type; expected either sig or multisig`);
  }
}

function validatePassphrase(value, path) {
  if (typeof value !== 'string' || value.trim().split(' ').length !== 12) {
    throw new Error(`Value at ${path} is not a valid passphrase; expected a 12-word mnemonic`);
  }
}

function validateWalletAddress(value, path, regExp) {
  if (typeof value !== 'string' || !regExp.test(value)) {
    throw new Error(
      `Value at ${path} is not a valid wallet address`
    );
  }
}

function validateCredentials(credentials, options) {
  validateObject(credentials, 3, '.');
  validateKeyType(credentials.type, '.type');
  validatePassphrase(credentials.passphrase, '.passphrase');
  validateWalletAddress(credentials.walletAddress, '.walletAddress', options.walletAddressRegExp);
}

module.exports = {
  validateCredentials
};

const crypto = require('crypto');

function convertWalletAddressToId(string) {
  let idHex = crypto.createHash('sha256').update(string).digest('hex').slice(0, 32);

  let third = (
    (parseInt(idHex.slice(12, 16), 16) & 0x0fff) | 0x4000
  ).toString(16);

  let fourth = (
    (parseInt(idHex.slice(16, 20), 16) & 0x3fff) | 0x8000
  ).toString(16);

  return `${idHex.slice(0, 8)}-${idHex.slice(8, 12)}-${third}-${fourth}-${idHex.slice(20, 32)}`;
}

module.exports = {
  convertWalletAddressToId
};

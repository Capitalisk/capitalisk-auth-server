# capitalisk-auth-server
A modular back end toolkit for easily implementing log in using any Capitalisk/LDPoS blockchain.

## What is this for?

This project provides back end Node.js components to allow you to easily extend your app or website to support authentication (log in) via a Capitalisk-based blockchain.
It's an alternative to the standard email-based authentication which is currently supported by most websites and it saves you from having to do the work of setting up a registration page and handling the whole sign up and email verification flow.

This project is intended to be used with `capitalisk-auth-client` (https://github.com/Capitalisk/capitalisk-auth-client) on the front end to initiate the authentication flow.
This library is highly versatile and can work with any transport protocol (I.e. HTTP/HTTPS and WebSockets) and any API framework on the back end (I.e. ExpressJS, Koa... or without any framework).

## How does it work?

See https://github.com/Capitalisk/capitalisk-auth-client#how-does-it-work

## Usage

### Include library

```js
const { CapitaliskAuthProvider, convertWalletAddressToId } = require('capitalisk-auth-server');
```

Or with import syntax:

```js
import capitaliskAuthServer from 'capitalisk-auth-server';
const { CapitaliskAuthProvider, convertWalletAddressToId } = capitaliskAuthServer;
```

### Instantiate CapitaliskAuthProvider

You should Instantiate it at the top level scope outside of any API route handlers like this:

```js
let capitaliskAuth = new CapitaliskAuthProvider({
  hostname: 'capitalisk.com',
  port: 443,
  networkSymbol: 'clsk',
  chainModuleName: 'capitalisk_chain',
  secure: true,
  minAccountBalance: 1
});
```

Then, ideally somewhere near the top, inside your API endpoint handler/function:

```js
// Assuming your API handler is an async function...

let walletInfo;
try {
  // Be sure to add the await keyword here to catch async errors.
  // The credentials object comes directly from the front end
  // capitalisk-log-in component's 'submitCredentials' event.detail property.
  walletInfo = await capitaliskAuth.authenticate(credentials);
} catch (error) {
  // The authenticate() method will throw an error if blockchain authentication
  // fails or if the credentials object format is incorrect.
  // In this case, respond to the request with an error.
  // ... RESPOND HERE.
  // Also, log the exception somewhere.
  // You can return from the function to prevent further processing.
  // Do not proceed with authentication.
  return;
}
// If no error was thrown, then it means authentication was successful and you
// can either create a session for your user and/or respond with a token (e.g. JWT).

let { walletAddress, accountBalance } = walletInfo;

// This optional utility function allows you to convert a blockchain wallet address
// into a valid UUIDv4 string deterministically derived from it.
// It can be useful for databases which support UUIDs and it allows you
// have a direct mapping between blockchain accounts and account IDs within your system.
let accountId = convertWalletAddressToId(walletAddress);

// ...
```

# Keyguard Bitcoin Experiments

## Test 01 - BitcoinJS

This test is using bitcoin-js (https://github.com/bitcoinjs/bitcoinjs-lib). To compile for browser-use, I used
```bash
yarn browserify -r buffer -s NodeBuffer -o nodebuffer.js
yarn browserify -r bitcoinjs-lib -s BitcoinJS -o bitcoinjs.js
```

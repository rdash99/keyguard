const API_URL = 'https://testnet-api.smartbit.com.au/v1/blockchain';

/**
 * @typedef {{
 *     received: string,
 *     received_int: number,
 *     spent: string,
 *     spent_int: number,
 *     balance: string,
 *     balance_int: number,
 *     input_count: number,
 *     output_count: number,
 *     transaction_count: number,
 * }} SmartBitAddressStats
 *
 * @typedef {{
 *     addresses: string[],
 *     value_int: number,
 *     txid: string,
 *     vout: number,
 *     script_sig: {
 *         asm: string,
 *         hex: string,
 *     },
 *     sequence: number,
 *     type: string,
 * }} SmartBitInput
 *
 * @typedef {{
 *     addresses: string[],
 *     value_int: number,
 *     n: number,
 *     script_pub_key: {
 *         asm: string,
 *         hex: string,
 *     },
 *     req_sigs: number,
 *     type: string,
 *     spend_txid?: string,
 * }} SmartBitOutput
 *
 * @typedef {{
 *     txid: string,
 *     block?: number,
 *     confirmations: number,
 *     version: number,
 *     locktime: number,
 *     time?: number,
 *     first_seen: number,
 *     double_spend: boolean,
 *     size: number,
 *     vsize: number,
 *     fee_int: number,
 *     input_count: number,
 *     inputs: SmartBitInput[],
 *     output_count: number,
 *     outputs: SmartBitOutput[],
 * }} SmartBitTransaction
 *
 * @typedef {SmartBitAddressStats & {
 *     transactions: SmartBitTransaction[],
 *     next?: string,
 * }} SmartBitAddressInfoFull
 */

class SmartBit {
    /**
     * @param {string} path
     * @param {FetchOptions} [options]
     */
    static async fetchApi(path, options) {
        return fetch(API_URL + path, options).then(res => res.json());
    }

    /**
     * @param {string} address
     * @returns {Promise<AddressStats>}
     */
    static async fetchAddressStats(address) {
        /** @type {SmartBitAddressStats} */
        const stats = await SmartBit.fetchApi('/address/' + address + '?tx=0').then(res => res.address.total);
        return {
            address,
            balance: stats.balance_int,
            txCount: stats.transaction_count,
            utxoCount: stats.input_count - stats.output_count,
        };
    }

    /**
     * @param {string} address
     * @param {string} [next]
     * @returns {Promise<Transaction[]>}
     */
    static async fetchTxs(address, next) {
        /** @type {{transactions: SmartBitTransaction[], next?: string}} */
        const result = await SmartBit.fetchApi('/address/' + address + (next ? '?next=' + next : '')).then(res => ({
            transactions: res.address.transactions,
            next: res.address.transaction_paging.next,
        }));
        result.transactions = result.transactions.map(SmartBit.normalizeTransaction);

        if (result.next) {
            // Recurse
            result.transactions.concat(await SmartBit.fetchTxs(address, result.next));
        }

        return result.transactions;
    }

    /**
     * @param {string} txHex
     * @returns {Promise<{success: boolean, error: {code: string, message: string}}>}
     */
    static async pushTx(txHex) {
        return SmartBit.fetchApi('/pushtx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({hex: txHex}),
        });
    }

    static async getWebsocket() {
        SmartBit._ws = SmartBit._ws || new Promise((resolve, reject) => {
            const ws = new WebSocket('wss://testnet-ws.smartbit.com.au/v1/blockchain');

            ws.addEventListener('open', (event) => {
                console.log('Websocket OPEN');
                resolve(ws);
            });

            ws.addEventListener('error', (error) => {
                console.log('Websocket ERROR', error);
                reject(error);
            });

            ws.addEventListener('close', (event) => {
                console.log('Websocket CLOSE');
                SmartBit._ws = null;
                SmartBit.getWebsocket();
            });

            ws.addEventListener('message', (msgEvent) => {
                SmartBit.onMessage(JSON.parse(msgEvent.data));
            });
        });

        return SmartBit._ws;
    }

    static onMessage(msg) {
        console.log('Websocket MESSAGE', msg);
        switch(msg.type) {
            case 'heartbeat': break; // Ignore
            case 'subscribe-response': SmartBit.onSubscribeResponse(msg.payload); break;
            case 'new-transaction': SmartBit.onTransaction && SmartBit.onTransaction(msg.payload); break;
            case 'transaction': SmartBit.onTransactionMined(msg.payload); break;
        }
    }

    /**
     * @param {string} address
     * @returns {Promise<boolean>}
     */
    static async subscribeAddresses(address) {
        const ws = await SmartBit.getWebsocket();

        return new Promise((resolve, reject) => {
            SmartBit._subscriptionListener = (payload) => {
                if (payload.success) resolve(true);
                reject(new Error(payload.message));
            };
            ws.send(JSON.stringify({
                type: 'address',
                address,
            }));
        });
    }

    /**
     * @param {{success: boolean, message: string}}
     */
    static onSubscribeResponse(payload) {
        if (!SmartBit._subscriptionListener) {
            throw new Error('Received subscription response, but no listener is registered');
        }
        SmartBit._subscriptionListener(payload);
        SmartBit._subscriptionListener = null;
    }

    /**
     * @param {SmartBitTransaction} payload
     */
    static onTransaction(payload) {}

    /**
     * @param {{txid: string, block: {height: number, hash: string}}} payload
     */
    static onTransactionMined(payload) {}

    /**
     * @param {SmartBitTransaction} tx
     * @returns {Transaction}
     */
    static normalizeTransaction(tx) {
        return {
            txid: tx.txid,
            block_height: tx.block,
            confirmations: tx.confirmations,
            version: tx.version,
            block_time: tx.time,
            seen_time: tx.first_seen,
            vsize: tx.vsize,
            fee: tx.fee_int,
            inputs: tx.inputs.map(SmartBit.normalizeInput),
            outputs: tx.outputs.map(SmartBit.normalizeOutput),
        };
    }

    static normalizeInput(vin) {
        return {
            address: vin.addresses[0],
            value: vin.value_int,
            txid: vin.txid,
            output_index: vin.vout,
            script: vin.script_sig.hex,
        };
    }

    static normalizeOutput(vout) {
        return {
            address: vout.addresses[0],
            value: vout.value_int,
            index: vout.n,
            script: vout.script_pub_key.hex,
            spent_txid: vout.spend_txid,
        };
    }
}

SmartBit._ws = null;
SmartBit._subscriptionListener = null;

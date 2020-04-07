const TOKEN = 'allyourbasearebelongtous';

const API_URL = 'https://api.blockcypher.com/v1/btc/test3';

/**
 * @typedef {{
 *     address: string,
 *     total_received: number,
 *     total_sent: number,
 *     balance: number,
 *     unconfirmed_balance: number,
 *     final_balance: number,
 *     n_tx: number,
 *     unconfirmed_n_tx: number,
 *     final_n_tx: number,
 * }} AddressStats
 *
 * @typedef {{
 *     prev_hash: string,
 *     output_index: number,
 *     script: string,
 *     output_value: number,
 *     sequence: number,
 *     addresses: string[],
 *     script_type: string,
 * }} Input
 *
 * @typedef {{
 *     value: number,
 *     script: string,
 *     addresses: string[],
 *     script_type: string,
 *     spent_by?: string,
 * }} Output
 *
 * @typedef {{
 *     block_hash?: string,
 *     block_height: number,
 *     hash: string,
 *     addresses: string[],
 *     total: number,
 *     fees: number,
 *     size: number,
 *     preference: number,
 *     relayed_by: string,
 *     confirmed?: string,
 *     received: string,
 *     ver: number,
 *     lock_time: number,
 *     double_spend: boolean,
 *     vin_sz: number,
 *     vout_sz: number,
 *     confirmations: number,
 *     confidence: number,
 *     inputs: Input[],
 *     outputs: Output[],
 *     opt_in_rbf?: boolean,
 * }} Transaction
 *
 * @typedef {AddressStats & {
 *     txs: Transaction[],
 *     hasMore?: boolean,
 * }} AddressInfoFull
 */

class BlockCypher {
    /**
     * @param {string} path
     * @param {FetchOptions} [options]
     */
    static async fetchApi(path, options) {
        const url = new URL(API_URL + path);
        url.searchParams.append('token', TOKEN);
        return fetch(url.href, options).then(res => res.json());
    }

    /**
     * @param {string} address
     * @returns {Promise<AddressStats>}
     */
    static async fetchAddressStats(address) {
        return this.fetchApi('/addrs/' + address + '/balance');
    }

    /**
     * @param {string} address
     * @param {number} [before]
     * @returns {Promise<Transaction[]>}
     */
    static async fetchTxs(address, before) {
        /** @type {AddressInfoFull} */
        const addressInfo = await this.fetchApi('/addrs/' + address + '/full' + (before ? '?before=' + before : ''));
        return addressInfo.txs;
    }

    /**
     * @param {string} txHex
     * @returns {Promise<Transaction>}
     */
    static async pushTx(txHex) {
        return this.fetchApi('/txs/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({tx: txHex}),
        });
    }
}

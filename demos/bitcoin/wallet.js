async function fetchApi(path) {
    return fetch('https://blockstream.info/testnet/api/' + path).then(res => res.json());
}

async function fetchTxoStats(address) {
    return fetchApi('address/' + address);
}

async function fetchTxs(address) {
    return fetchApi('address/' + address + '/txs');
}

function nodeToBech32Address(node) {
    return BitcoinJS.payments.p2wpkh({ pubkey: node.publicKey, network: TEST.network }).address;
}

async function updateAddressInfoActivity(addressInfo) {
    const stats = await fetchTxoStats(addressInfo.address);
    addressInfo.active = !!stats.chain_stats.tx_count || !!stats.mempool_stats.tx_count;
    return addressInfo;
}

INACTIVE_ADDRESS_GAP = 1; // As soon as one inactive address is found, search stops

var app = new Vue({
    el: '#app',
    data: {
        isNimiqLoaded: false,
        mnemonic: TEST.mnemonic,
        ext_index: 0,
        int_index: 0,
        ext_addresses: [],
        int_addresses: [],
        txs: {},
    },
    computed: {
        seed() { // Nimiq.SerialBuffer
            return this.isNimiqLoaded && this.mnemonic
                ? Nimiq.MnemonicUtils.mnemonicToSeed(this.mnemonic)
                : '';
        },
        seedHex() { // String
            return this.seed
                ? Nimiq.BufferUtils.toHex(this.seed)
                : '';
        },
        masterExtPrivKey() { // BitcoinJS BIP32 Object
            return this.seed
                ? BitcoinJS.bip32.fromSeed(NodeBuffer.Buffer.from(this.seed), TEST.network)
                : null;
        },
        accountExtPrivKey() { // BitcoinJS BIP32 Object
            return this.masterExtPrivKey
                ? this.masterExtPrivKey.derivePath(DERIVATION_PATH_ACCOUNT)
                : null;
        },
        accountExtPubKey() { // BitcoinJS BIP32 Object
            return this.accountExtPrivKey
                ? this.accountExtPrivKey.neutered()
                : null;
        },
        xpub() { // String
            return this.accountExtPubKey
                ? this.accountExtPubKey.toBase58()
                : '';
        },
        txsArray() { // Array
            return Object.values(this.txs).sort((tx1, tx2) => {
                const timestamp1 = tx1.status.confirmed ? tx1.status.block_time : Number.MAX_SAFE_INTEGER;
                const timestamp2 = tx2.status.confirmed ? tx2.status.block_time : Number.MAX_SAFE_INTEGER;
                return timestamp2 - timestamp1;
            });
        },
        utxos() { // UTXO = Unspent TX Output
            if (!this.txsArray.length) return [];

            // Create a flat array of inputs.
            // Build an array of strings of the form '<tx hash>:<output index>' to be able to do a standard Array.includes() test below
            /** @type {string[]} */
            const inputs = this.txsArray.reduce((list, tx) => list.concat(tx.vin.map(input => `${input.txid}:${input.vout}`)), []);

            // Create a flat array of outputs.
            // Include tx hash and output index into the output, to be able to map it to a usable output later.
            const outputs = this.txsArray.reduce((list, tx) => {
                const txid = tx.txid;
                const vouts = tx.vout.map((vout, index) => ({ ...vout, txid, index }));
                return list.concat(vouts);
            }, []);

            const externalAddresses = this.ext_addresses.map(addressInfo => addressInfo.address);
            const internalAddresses = this.int_addresses.map(addressInfo => addressInfo.address);

            const utxos = [];

            for (const output of outputs) {
                const address = output.scriptpubkey_address;
                // Exclude outputs which are not ours
                if (!externalAddresses.includes(address) && !internalAddresses.includes(address)) continue;

                // Exlude outputs which are already spent
                if (inputs.includes(`${output.txid}:${output.index}`)) continue;

                // Format required by BitcoinJS (for tx inputs)
                // {
                //     hash: '<tx hash as HEX string>',
                //     index: <output index>
                //     witnessUtxo: {
                //         script: <Buffer of the output script>,
                //         value: <output value>,
                //     },
                // }
                utxos.push({
                    hash: output.txid,
                    index: output.index,
                    witnessUtxo: {
                        script: NodeBuffer.Buffer.from(output.scriptpubkey, 'hex'),
                        value: output.value,
                    },
                    address, // Only added for display in demo
                    isInternal: internalAddresses.includes(address), // Only added for display in demo
                });
            }

            return utxos;
        },
        balance() {
            return this.utxos.reduce((sum, utxo) => sum + utxo.witnessUtxo.value, 0);
        },
    },
    watch: {
        async accountExtPubKey(xPub, oldXPub) {
            if (!xPub) return;
            if (oldXPub !== null) {
                this.ext_addresses = [];
                this.int_addresses = [];
                this.txs = {};
            }

            /**
             * EXTERNAL ADDRESSES
             */

            let inactiveAddressGapWidth = 0;

            for (const addressInfo of this.ext_addresses) {
                if (addressInfo.active) {
                    // TODO: Update tx history (with low priority)
                    continue;
                }

                await updateAddressInfoActivity(addressInfo);

                if (!addressInfo.active) inactiveAddressGapWidth++;
                if (inactiveAddressGapWidth >= INACTIVE_ADDRESS_GAP) break;

                await this.fetchTxHistory(addressInfo.address);
            }

            while (inactiveAddressGapWidth < INACTIVE_ADDRESS_GAP) {
                // Derive next address
                const index = this.ext_addresses.length;
                const node = xPub
                    .derive(0) // 0 for external addresses
                    .derive(index);
                const address = nodeToBech32Address(node);

                const addressInfo = {
                    address,
                    index,
                    active: false,
                };
                await updateAddressInfoActivity(addressInfo);

                // Store address
                this.ext_addresses.push(addressInfo);

                if (!addressInfo.active) inactiveAddressGapWidth++;
                if (inactiveAddressGapWidth >= INACTIVE_ADDRESS_GAP) break;

                await this.fetchTxHistory(addressInfo.address);
            }

            /**
             * INTERNAL ADDRESSES
             */

            inactiveAddressGapWidth = 0;

            for (const addressInfo of this.int_addresses) {
                if (addressInfo.active) {
                    // TODO: Update tx history (with low priority)
                    continue;
                }

                await updateAddressInfoActivity(addressInfo);

                if (!addressInfo.active) inactiveAddressGapWidth++;
                if (inactiveAddressGapWidth >= INACTIVE_ADDRESS_GAP) break;

                await this.fetchTxHistory(addressInfo.address);
            }

            while (inactiveAddressGapWidth < INACTIVE_ADDRESS_GAP) {
                // Derive next address
                const index = this.int_addresses.length;
                const node = xPub
                    .derive(1) // 1 for internal addresses
                    .derive(index);
                const address = nodeToBech32Address(node);

                const addressInfo = {
                    address,
                    index,
                    active: false,
                };
                await updateAddressInfoActivity(addressInfo);

                // Store address
                this.int_addresses.push(addressInfo);

                if (!addressInfo.active) inactiveAddressGapWidth++;
                if (inactiveAddressGapWidth >= INACTIVE_ADDRESS_GAP) break;

                await this.fetchTxHistory(addressInfo.address);
            }
        },
    },
    mounted() {
        Nimiq.WasmHelper.doImport().then(() => this.isNimiqLoaded = true);
    },
    methods: {
        async fetchTxHistory(address) {
            // Fetch tx history
            const txs = await fetchTxs(address);
            const txsObj = {};
            for (const tx of txs) {
                txsObj[tx.txid] = tx;
            }
            this.txs = {
                ...this.txs,
                ...txsObj,
            };
        },
    },
});

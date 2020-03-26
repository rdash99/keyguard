/**
 * All test vectors were created with https://iancoleman.io/bip39/
 */

const TEST_mnemonic = 'rib dream attitude script click hope aisle orphan flat early athlete twelve toy sell cigar ugly drink flavor power common devote love relax capable';
const TEST_bip39seed = '4e99e97cfb3dd66c0aff61be106a81f9adef10995a39d1bbf43e9b97bc456bee7527ac44400ab1e7d8203b5fdfa4eaedfdf953f5b409b98f819a3145b08cc2c6';
const TEST_network = 'testnet';

// Segwit uses BIP84 to derive Bech32 addresses

const derivationpath_ext = 'm/84\'/1\'/0\'/0'; // m/84'/1'/0'/0: 84' is for BIP84, 1' is for testnet, 0' is for account 0, 0 is for external (receiving)
const derivationpath_chg = 'm/84\'/1\'/0\'/1'; // m/84'/1'/0'/0: 84' is for BIP84, 1' is for testnet, 0' is for account 0, 1 is for internal (change)

const TEST_ext_privatekeyWIFs = [ // WIF - Wallet Import Format
    'cSRVQNSD7ASBrTEdr245AjtcxfH7VZ7v5N1A42Vqy72pV6uVfKQd', // 0
    'cR2QckfyU3hQbjCnTt1XeMn4qc7crDJGTo6YKdXQr8oUxB9jH4gr', // 1
    'cVPXsCx6MkvtuLfvjLompkXd599BgCehrtfrcS2xkgCJ9DxLUojr', // 2
    'cTxAM5p6Yn64yPAjs3bT9V8PnLLdVCvj7A2gw8bFmCT8cHSKTjPz', // 3
    'cVLEFkqsB9dFU686ddWiyXSRLjHB4eFKU9m1A7ZDnS9k5x3CTBAz', // 4
    'cMnCMZrTuVTfaWLdoDqH3bNArffXNz2h4nRbes1LWaN9xqv1TszL', // 5
    'cTfE2MwBHgzvRzBZckJDu467AVEg5Y2d558ywQsgdGjRQqeMbtGt', // 6
    'cVK2zTgFaiqYq3s6K32ETNvcmHXxBsBjgdR6ea7sWYtYAuHRTENL', // 7
    'cNa2o499quhygRWc9Em9jUVpWGY1p6kjfqzZjGQrWr9cwTxXvLha', // 8
    'cTm1qmJu6KPwJpPWjTNvNmSLGw65Ams55J3sF654XFbSMsVcXse3', // 9
];

const TEST_ext_privatekeys = TEST_ext_privatekeyWIFs.map(wif => BitcoinJS.ECPair.fromWIF(wif, BitcoinJS.networks.testnet).privateKey);
const TEST_ext_privatekeys_hex = TEST_ext_privatekeys.map(pk => Nimiq.BufferUtils.toHex(pk));

const TEST_ext_addresses = [
    'tb1qsn4ehj7epnnaxdsfjgjeujumsxppt2tql9m9gl', // 0 - This address received 0.08005992 tBTC on March 25, 2020
    'tb1qm37aps59r86g79jg5xh8ecgfqfncv92wzfyyx7', // 1
    'tb1qjpv0wk5p07kdack2ky8jk4dnwnfqgx5cmt3r6l', // 2
    'tb1qhwlha0zaj5ly6jpdeq8uzwk0dj0hfqs6kdu49e', // 3
    'tb1qm600qzjdcc2syufar9suyt50ks3y0s4u46un04', // 4
    'tb1qv05qywlcplqhtd9tsklm9rht9jdjyz5rqkngvt', // 5
    'tb1qtscsd2u3hxjy5dxst5txxpuc52z8djx05hxnsx', // 6
    'tb1q4f4an0rfgv3gy05c3kkfq3m45dmgrdaewllsct', // 7
    'tb1qv6dwfw7ywuse20grmj59rmc0rk2hhu8gf2579q', // 8
    'tb1q9e00ea2tjanlc7kmzqa0nvz007we95h2tdns5x', // 9
];

const TEST_chg_privatekeyWIFs = [ // WIF - Wallet Import Format
    'cPr6o2Se6mGDQzgRmk6xyocqnsosuy8QzBmqwRUP4X7VLPzeBZJa', // 0
    'cQzWdbzLw4caGadQR8s4xj3L8Q59HD8nzUMG6cHT4AkPEe5nvKie', // 1
    'cQ3CsehgfkH1sHRUTvDttoNSToFjAjtrJVBT32V1YfiJSocW2z6n', // 2
    'cUC8tq1r6V3ZdzWXZv37LBYZGF8EEzLZdPeX5svHAbG5KECxvdh9', // 3
    'cRSH6qsa5ogFyMdBUSqNrXLz9MLGkyZeDz53dy6eri3nbtkZB75Y', // 4
    'cT7pHHypMy67LFmstoWg8wgmPKSUDEzvnvxL6cciQ85qYneYm93q', // 5
    'cPVWJp8i39TrdCGLHLoYMfpCzaTZ4n76hX7K6TZo8qm1ommuCTn5', // 6
    'cUYEYTkY2E9158QmnKbMDq29cN4ucw8jUUfPBoPs39rg1kuxzNB1', // 7
    'cQw1gssoBkYyFnGbFEMB4pMeuMTkabPdZdXwCxducG5a71J6fFxm', // 8
    'cNKf96md9XR6pmbMpCYbYGaQdKETF8VsQjrG8W1eKqKJXGrkEAnu', // 9
];

const TEST_chg_privatekeys = TEST_chg_privatekeyWIFs.map(wif => BitcoinJS.ECPair.fromWIF(wif, BitcoinJS.networks.testnet).privateKey);
const TEST_chg_privatekeys_hex = TEST_chg_privatekeys.map(pk => Nimiq.BufferUtils.toHex(pk));

const TEST_chg_addresses = [
    'tb1qxvrezy277f2035kasl39pls454yjwtgqkfv05z', // 0
    'tb1qug5uhjkd9uh67xxzcq099xn44697dqceagjg69', // 1
    'tb1qneprztu9xnq0ngv8c42trlqyjea0stxww4xnnd', // 2
    'tb1qm235aln7xyewr5kyckrta7xp29xurt7hdjvjyr', // 3
    'tb1q7asr2m6kz20cmwsvxwzeuxjk7cy7v4yjczt3zh', // 4
    'tb1q7yk3pmjnzfrg8g2ra4shdatdxdc52sed5rz0m0', // 5
    'tb1qnlz0naucldpc9jzphap52j3qw5p203j24we3wp', // 6
    'tb1qnuskus450zx95lwdczgx32jrssxmv2rmvy85em', // 7
    'tb1q8ss6xqy4ztwe5nn7ggl42ns82txylamhtscsuu', // 8
    'tb1q24zm9uytqjgefk30x8ttk8yupd6dwncnuje55g', // 9
];

function getBech32Address(node, network) {
    return BitcoinJS.payments.p2wpkh({ pubkey: node.publicKey, network }).address;
}

async function main() {
    await Nimiq.WasmHelper.doImport();

    // Going from mnemonic to seed is standardized, equal to how it's done in Nimiq.
    //
    // To do it with BitcoinJS tools would require using an external bip39 module:
    // const seed = bip39.mnemonicToSeedSync(mnemonic);
    const seed = Nimiq.MnemonicUtils.mnemonicToSeed(TEST_mnemonic);

    const seed_hex = Nimiq.BufferUtils.toHex(seed);
    console.log("Seed equals TEST:", seed_hex === TEST_bip39seed);

    // Going from seed to masterkey is different from Nimiq, as Bitcoin uses different parameters and cryptographic curve.
    const btc_master = BitcoinJS.bip32.fromSeed(NodeBuffer.Buffer.from(seed), BitcoinJS.networks.testnet);

    const btc_ext_root = btc_master.derivePath(derivationpath_ext); // Root for external addresses (receiving)
    const btc_chg_root = btc_master.derivePath(derivationpath_chg); // Root for internal addresses (change)

    console.log("\nDerive receiving private keys");
    for (const i in Array(10).fill()) {
        const node = btc_ext_root.derive(parseInt(i, 10));

        const privkey_hex = Nimiq.BufferUtils.toHex(node.privateKey);
        console.log("Derived privkey", i, "equals TEST:", privkey_hex === TEST_ext_privatekeys_hex[i]);
    }

    console.log("\nDerive receiving addresses");
    for (const i in Array(10).fill()) {
        const node = btc_ext_root.derive(parseInt(i, 10));

        const address = getBech32Address(node, BitcoinJS.networks.testnet);
        console.log("Derived address", i, "equals TEST:", address === TEST_ext_addresses[i]);
    }

    console.log("\nDerive change private keys");
    for (const i in Array(10).fill()) {
        const node = btc_chg_root.derive(parseInt(i, 10));

        const privkey_hex = Nimiq.BufferUtils.toHex(node.privateKey);
        console.log("Derived privkey", i, "equals TEST:", privkey_hex === TEST_chg_privatekeys_hex[i]);
    }

    console.log("\nDerive change addresses");
    for (const i in Array(10).fill()) {
        const node = btc_chg_root.derive(parseInt(i, 10));

        const address = getBech32Address(node, BitcoinJS.networks.testnet);
        console.log("Derived address", i, "equals TEST:", address === TEST_chg_addresses[i]);
    }

    // Transaction Virtual Sizes
    // Single input, single output: 110 bytes
    // Single input, two outputs: 141 bytes
    // Two inputs, single output: 178 bytes
    // Two inputs, two outputs: 208 bytes

    /**
     * Constructs a transaction with inputs from a single address
     *
     * @param {{privateKey: Uint8Array}} key
     * @param {{hash: string, index: number, witnessUtxo: {script: Buffer, value: number}}[]} inputs
     * @param {string} to
     * @param {number} amount
     * @param {string} changeAddress
     * @param {number} [feePerByte]
     */
    function makeTransaction(key, inputs, to, amount, changeAddress, feePerByte = 1) {
        // Estimate fee
        const estimatedVSize =
            12 /* Tx header */ +
            68 /* Per input */ * inputs.length +
            30 /* Per output */ * 2;
        const estimatedFee = estimatedVSize * feePerByte;

        // Calculate sum of all inputs (for later use)
        const inputValue = inputs.reduce((sum, input) => sum + input.witnessUtxo.value, 0);
        const estimatedChange = inputValue - amount - estimatedFee;

        if (estimatedChange < 0) throw new Error('Value of inputs is lower than transaction amount + estimated fee');

        // Sort inputs by tx hash ASC, then index ASC
        inputs.sort((input1, input2) => {
            if (input1.hash !== input2.hash) return input1.hash < input2.hash ? -1 : 1;
            return input1.index - input2.index;
        });

        // Construct PSBT without fee
        const psbt = new BitcoinJS.Psbt({ network: BitcoinJS.networks.testnet });

        // Add inputs
        psbt.addInputs(inputs);

        // Clone a PSBT to experiment on with size and fee
        const testPsbt = psbt.clone();

        // Construct outputs
        const outputs = [{
            address: to,
            value: amount,
        }, {
            address: changeAddress,
            value: estimatedChange,
        }];
        testPsbt.addOutputs(outputs.slice(0).sort((output1, output2) => {
            if (output1.value !== output2.value) return output1.value - output2.value;
            return output1.address < output2.address ? -1 : 1;
        }));

        // Sign + finalize to allow transaction extraction
        testPsbt.signAllInputs(key).finalizeAllInputs();

        // Extract transaction and check virtual size
        const testTx = testPsbt.extractTransaction();
        const actualVSize = testTx.virtualSize();
        console.log("Sizes:", estimatedVSize, actualVSize);

        // Calculate fee from virtual size and feePerByte argument
        const actualFee = actualVSize * feePerByte;
        console.log("Fee:", estimatedFee, actualFee);

        if (actualFee !== estimatedFee) {
            const actualChange = inputValue - amount - actualFee;
            console.log("Change:", estimatedChange, actualChange);
            // Check if input sum still fulfill amount + fee
            if (actualChange < 0) throw new Error('Value of inputs is lower than transaction amount + fee');

            // Update change output
            outputs[1].value = actualChange;
        }

        // Order outputs by value ASC, then address ASC
        outputs.sort((output1, output2) => {
            if (output1.value !== output2.value) return output1.value - output2.value;
            return output1.address < output2.address ? -1 : 1;
        })

        // Add outputs
        psbt.addOutputs(outputs);

        // Sign
        psbt.signAllInputs(key);

        // Finalize
        psbt.finalizeAllInputs();

        // Validate that fee rate is similar to feePerByte argument
        console.log("Fee rates:", psbt.getFeeRate(), feePerByte, psbt.getFee());

        // Extract tx
        const tx = psbt.extractTransaction();

        // Return tx
        return tx;
    }

    console.log("\nCreate transaction from external_0 to change_0");
    // Using this tx as input: https://blockstream.info/testnet/api/tx/1683f5639e614ccd11b6542a502eb31ed0a76a04809d56c2ecbca5335c67eb32
    const key = btc_ext_root.derive(0);
    const inputs = [{
        hash: '1683f5639e614ccd11b6542a502eb31ed0a76a04809d56c2ecbca5335c67eb32',
        index: 1, // Our output was the second in the input tx
        witnessUtxo: {
            script: NodeBuffer.Buffer.from('001484eb9bcbd90ce7d3360992259e4b9b818215a960', 'hex'),
            value: 1000000,
        },
    }, {
        hash: '18d7a602b06c9613412bc935c5fbe7a22ff4e670bc176f75fadbdf2fb9940b5d',
        index: 0, // Our output was the second in the input tx
        witnessUtxo: {
            script: NodeBuffer.Buffer.from('001484eb9bcbd90ce7d3360992259e4b9b818215a960', 'hex'),
            value: 4983992,
        },
    }, {
        hash: '550bce13e303ace1c45f5f2112a3098c62c08b132a7042f6b7b085102051c082',
        index: 1, // Our output was the second in the input tx
        witnessUtxo: {
            script: NodeBuffer.Buffer.from('001484eb9bcbd90ce7d3360992259e4b9b818215a960', 'hex'),
            value: 1000000,
        },
    }, {
        hash: '5fedaef5229799e18e351f76395bb7411e56da2291f99905e75dc72850ce2fdf',
        index: 0, // Our output was the second in the input tx
        witnessUtxo: {
            script: NodeBuffer.Buffer.from('001484eb9bcbd90ce7d3360992259e4b9b818215a960', 'hex'),
            value: 1000000,
        },
    }, {
        hash: '891adf338c070c5512fc28a9d77d648a8f25ad0d63e742b3fb0605eb9124aee8',
        index: 1, // Our output was the second in the input tx
        witnessUtxo: {
            script: NodeBuffer.Buffer.from('001484eb9bcbd90ce7d3360992259e4b9b818215a960', 'hex'),
            value: 22000,
        },
    }, {
        hash: '738b5c17758131b22d560ad6417defb830c3940bfc4074d0414b44798e880747',
        index: 25, // Our output was the second in the input tx
        witnessUtxo: {
            script: NodeBuffer.Buffer.from('001484eb9bcbd90ce7d3360992259e4b9b818215a960', 'hex'),
            value: 27738766,
        },
    }];
    const to = TEST_ext_addresses[1];
    const amount = Math.round(inputs.reduce((sum, input) => sum + input.witnessUtxo.value, 0) / 2);
    const changeAddress = TEST_chg_addresses[0];

    const tx = makeTransaction(key, inputs, to, amount, changeAddress);

    console.log("Tx:", tx);
    console.log("Tx vSize:", tx.virtualSize());
    console.log("Tx HEX:", tx.toHex()); // Use https://live.blockcypher.com/btc/decodetx/ to decode the transaction
}

main();

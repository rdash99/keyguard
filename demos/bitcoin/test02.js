async function main() {
    await Nimiq.WasmHelper.doImport();

    // Going from mnemonic to seed is standardized, equal to how it's done in Nimiq.
    //
    // To do it with BitcoinJS tools would require using an external bip39 module:
    // const seed = bip39.mnemonicToSeedSync(mnemonic);
    const seed = Nimiq.MnemonicUtils.mnemonicToSeed(TEST.mnemonic);

    const seed_hex = Nimiq.BufferUtils.toHex(seed);
    assert('Seed equals TEST', seed_hex === TEST.seed);

    // Going from seed to masterkey is different from Nimiq, as Bitcoin uses different parameters and cryptographic curve.
    const btc_master = BitcoinJS.bip32.fromSeed(NodeBuffer.Buffer.from(seed), BitcoinJS.networks.testnet);

    const btc_ext_root = btc_master.derivePath(DERIVATION_PATH_EXT); // Root for external addresses (receiving)

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
    const to = TEST.ext_addresses[1];
    const amount = Math.round(inputs.reduce((sum, input) => sum + input.witnessUtxo.value, 0) / 2);
    const changeAddress = TEST.chg_addresses[0];

    const tx = TxUtils.makeTransaction([key], inputs, to, amount, changeAddress);

    console.log("Tx:", tx);
    console.log("Tx vSize:", tx.virtualSize());
    console.log("Tx HEX:", tx.toHex()); // Use https://live.blockcypher.com/btc/decodetx/ to decode the transaction
    assert('Tx equals TEST', tx.toHex() === '0200000000010632eb675c33a5bcecc2569d80046aa7d01eb32e502a54b611cd4c619e63f583160100000000ffffffff5d0b94b92fdfdbfa756f17bc70e6f42fa2e7fbc535c92b4113966cb002a6d7180000000000ffffffff82c051201085b0b7f642702a138bc0628c09a312215f5fc4e1ac03e313ce0b550100000000ffffffffdf2fce5028c75de70599f99122da561e41b75b39761f358ee1999722f5aeed5f0000000000ffffffff4707888e79444b41d07440fc0b94c330b8ef7d41d60a562db2318175175c8b731900000000ffffffffe8ae2491eb0506fbb342e7630dad258f8a647dd7a928fc12550c078c33df1a890100000000ffffffff021ab4100100000000160014330791115ef254f8d2dd87e250fe15a549272d00fbb5100100000000160014dc7dd0c28519f48f1648a1ae7ce109026786154e0247304402204220932488f18220acff985ef6a58c63634327d2d794ed51325c1a01ac882f4b02204187151ade1bc52e2fa640b4ec097b4fa8fe9e6bbd1cc5b208e5429a4525b1df01210263324a046eb0c4a110488d6a61fcdfae2fcefa1ca6123ddc12c1fdb15380540002473044022100d325fd9d32dc06083afdb929ce4774fba8767065d7d51c7e4fcc9533cb2df129021f2f3f5a0e4241aacd6ac185f28dd9b96ee3f15b2e60eee129c477cccf6d86a401210263324a046eb0c4a110488d6a61fcdfae2fcefa1ca6123ddc12c1fdb153805400024830450221009531de6c2719863e6cd62c1c4d906e1e9a96a558911ed9fc0ca705c7112c9ce302203c0686c6ebaa286401676c826b8fe7d9f7d1038f07486c20d74ee91a75f110b301210263324a046eb0c4a110488d6a61fcdfae2fcefa1ca6123ddc12c1fdb1538054000247304402201855311c8ddb69d4d1f01066dd5b50383aec5bcd5bf6e5ed292fa01de2fda327022068ab1fe7023cfe9624fddfc11c1f48c63cb826786a6d1e992decc3ec2f81a13101210263324a046eb0c4a110488d6a61fcdfae2fcefa1ca6123ddc12c1fdb15380540002483045022100f615f597bfe84c41e9e64e0aa58c10e1046350795a788ba6582c7e64e98045e1022066c2f75b3c6e6a4becde4026a12fa2a94b8112671b7eecdf1240e995f355e31e01210263324a046eb0c4a110488d6a61fcdfae2fcefa1ca6123ddc12c1fdb1538054000247304402205b28f1cfe0be1212254148f251a8d42dd3031c1a6a51f3ea31d8f912c7d2057702205c7fa92aac1b36fe26688aa465b9a45f588b546438b9f2748298dbcd4520431101210263324a046eb0c4a110488d6a61fcdfae2fcefa1ca6123ddc12c1fdb15380540000000000');
}

main();

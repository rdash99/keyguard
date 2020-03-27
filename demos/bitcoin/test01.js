function getBech32Address(node, network) {
    return BitcoinJS.payments.p2wpkh({ pubkey: node.publicKey, network }).address;
}

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
    const btc_chg_root = btc_master.derivePath(DERIVATION_PATH_CHG); // Root for internal addresses (change)

    console.log("\nDerive receiving private keys");
    for (const i in Array(10).fill()) {
        const node = btc_ext_root.derive(parseInt(i, 10));

        const privkey_hex = Nimiq.BufferUtils.toHex(node.privateKey);
        assert(`Derived privkey ${i} equals TEST`, privkey_hex === TEST.ext_privatekeys_hex[i]);
    }

    console.log("\nDerive receiving addresses");
    for (const i in Array(10).fill()) {
        const node = btc_ext_root.derive(parseInt(i, 10));

        const address = getBech32Address(node, BitcoinJS.networks.testnet);
        assert(`Derived address ${i} equals TEST`, address === TEST.ext_addresses[i]);
    }

    console.log("\nDerive change private keys");
    for (const i in Array(10).fill()) {
        const node = btc_chg_root.derive(parseInt(i, 10));

        const privkey_hex = Nimiq.BufferUtils.toHex(node.privateKey);
        assert(`Derived privkey ${i} equals TEST`, privkey_hex === TEST.chg_privatekeys_hex[i]);
    }

    console.log("\nDerive change addresses");
    for (const i in Array(10).fill()) {
        const node = btc_chg_root.derive(parseInt(i, 10));

        const address = getBech32Address(node, BitcoinJS.networks.testnet);
        assert(`Derived address ${i} equals TEST`, address === TEST.chg_addresses[i]);
    }
}

main();

// Transaction Virtual Sizes
// Single input, single output: 110 bytes
// Single input, two outputs: 141 bytes
// Two inputs, single output: 178 bytes
// Two inputs, two outputs: 208 bytes

class TxUtils {
    /**
     * Constructs a transaction to a single recipient with a single amount,
     * from any inputs for which keyPairs are provided.
     *
     * @param {{privateKey: Uint8Array, publicKey: Uint8Array}[]} keyPairs
     * @param {{hash: string, index: number, witnessUtxo: {script: Buffer, value: number}}[]} inputs
     * @param {string} to
     * @param {number} amount
     * @param {string} changeAddress
     * @param {number} [feePerByte]
     */
    static makeTransaction(keyPairs, inputs, to, amount, changeAddress, feePerByte = 1) {
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
        for (const keyPair of keyPairs) testPsbt.signAllInputs(keyPair);
        testPsbt.finalizeAllInputs();

        // Extract transaction and check virtual size
        const testTx = testPsbt.extractTransaction();
        const actualVSize = testTx.virtualSize();
        console.debug("Sizes:", estimatedVSize, actualVSize);

        // Calculate fee from virtual size and feePerByte argument
        const actualFee = actualVSize * feePerByte;
        console.debug("Fee:", estimatedFee, actualFee);

        if (actualFee !== estimatedFee) {
            const actualChange = inputValue - amount - actualFee;
            console.debug("Change:", estimatedChange, actualChange);
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
        for (const keyPair of keyPairs) psbt.signAllInputs(keyPair);

        // Finalize
        psbt.finalizeAllInputs();

        // Validate that fee rate is similar to feePerByte argument
        console.debug("Fee rates:", psbt.getFeeRate(), feePerByte, psbt.getFee());

        // Extract tx
        const tx = psbt.extractTransaction();

        // Return tx
        return tx;
    }
}

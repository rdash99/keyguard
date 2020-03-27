function assert(msg, condition) {
    if (condition) console.debug(`ASSERT ${msg}:`, condition);
    else throw new Error(`ASSERT FAILED: ${msg}`);
}

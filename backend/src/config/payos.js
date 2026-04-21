const { PayOS } = require('@payos/node');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

module.exports = payos;

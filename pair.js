const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    version,
    delay,
    makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");

const router = express.Router();

// Helper function to remove files
function removeFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    fs.rmSync(filePath, { recursive: true, force: true });
}

// Route handler
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function JUNE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
      const supreme = makeWASocket({
        printQRInTerminal: false,
        version: [2, 3000, 1023223821],
        logger: pino({
          level: 'silent',
        }),
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        auth: state,
      })

            if (!supreme.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await supreme.requestPairingCode(num);

                 if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            supreme.ev.on('creds.update', saveCreds);
            supreme.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                await supreme.groupAcceptInvite('');
                await supreme.sendMessage(supreme.user.id, { text: `Generating your session_id, Wait. . .` });
                    await delay(6000);
                    
                    const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(8000);
                    const b64data = Buffer.from(data).toString('base64');
                    const session = await supreme.sendMessage(supreme.user.id, { text: 'JUNE-MD:~' + b64data });

                    // Send message after session
                    await supreme.sendMessage(supreme.user.id, {text: `┏━━━❑\n┃🔹 Owner: supreme\n┃🔹 Type: Base64\n┃🔹 Status: Active\n┗━━━❒` }, { quoted: session });
                    
                    await delay(100);
                    await supreme.ws.close();
                    removeFile('./temp/' + id);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    JUNE();
                }
            });
        } catch (err) {
            console.log('service restarted', err);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }

    await JUNE();
});

module.exports = router;

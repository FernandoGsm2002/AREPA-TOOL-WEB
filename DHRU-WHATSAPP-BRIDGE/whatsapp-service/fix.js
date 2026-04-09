const fs = require('fs');
const filepath = 'c:/Users/Fernando/Desktop/ArepaToolV2/AREPA-TOOL-PANEL/DHRU-WHATSAPP-BRIDGE/whatsapp-service/whatsapp-bot.js';
let content = fs.readFileSync(filepath, 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Gaela')) {
        lines[i] = "    'Moto Qcom Orders 🟢',";
    }
}
fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
console.log('Fixed whitelist');

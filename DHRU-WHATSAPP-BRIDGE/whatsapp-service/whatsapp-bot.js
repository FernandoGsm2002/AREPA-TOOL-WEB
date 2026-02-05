/**
 * DHRU WhatsApp Bot Service
 * Maneja mensajes de WhatsApp para el bridge DHRU
 * 
 * Funciones:
 * - Enviar notificaciones de pedidos a un grupo
 * - Recibir respuestas (DONE/REJECT) y notificar al servidor Python
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');  // Para generar QR como imagen
const express = require('express');
const http = require('http');

// ==================== CONFIGURACIÓN ====================
const PORT = 3001;  // Puerto del servicio HTTP
const PYTHON_SERVER = 'http://localhost:8095';  // Servidor DHRU Python

// ID del grupo de WhatsApp (se obtiene automáticamente al enviar primer mensaje)
let TARGET_GROUP_ID = '';  // Se configura después de escanear QR
let TARGET_GROUP_NAME = 'DHRU Pedidos';  // Nombre del grupo a buscar
let currentQR = '';  // Almacena el QR actual para mostrarlo en web

// ==================== CLIENTE WHATSAPP ====================
console.log('🔄 Iniciando cliente de WhatsApp...');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-session'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Mostrar QR en terminal (MEJORADO)
client.on('qr', (qr) => {
    console.log('\n' + '='.repeat(50));
    console.log('📱 ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP');
    console.log('='.repeat(50));
    console.log('');
    
    // Generar QR con tamaño normal (no small) para mejor visibilidad
    qrcode.generate(qr, { small: false }, (qrString) => {
        console.log(qrString);
    });
    
    console.log('');
    console.log('='.repeat(50));
    console.log('⏳ Esperando escaneo...');
    console.log('💡 Si no puedes escanear, abre: http://localhost:3001/qr');
    console.log('='.repeat(50));
    
    // También guardar el QR como texto para copiar
    currentQR = qr;
});

// Autenticación exitosa
client.on('authenticated', () => {
    console.log('✅ Autenticación exitosa!');
});

// Cliente listo
client.on('ready', async () => {
    console.log('🚀 WhatsApp Bot LISTO!');
    console.log(`📞 Conectado como: ${client.info.pushname}`);
    
    // Buscar el grupo objetivo
    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.isGroup);
    
    console.log(`\n📋 Grupos disponibles (${groups.length}):`);
    groups.forEach((g, i) => {
        console.log(`   ${i + 1}. ${g.name} (${g.id._serialized})`);
    });
    
    // Buscar grupo por nombre
    const targetGroup = groups.find(g => 
        g.name.toLowerCase().includes(TARGET_GROUP_NAME.toLowerCase())
    );
    
    if (targetGroup) {
        TARGET_GROUP_ID = targetGroup.id._serialized;
        console.log(`\n✅ Grupo encontrado: "${targetGroup.name}"`);
        console.log(`   ID: ${TARGET_GROUP_ID}`);
    } else {
        console.log(`\n⚠️ No se encontró grupo con nombre "${TARGET_GROUP_NAME}"`);
        console.log('   Usa el primer grupo de la lista o configura TARGET_GROUP_NAME');
        if (groups.length > 0) {
            TARGET_GROUP_ID = groups[0].id._serialized;
            console.log(`   Usando: ${groups[0].name}`);
        }
    }
});

// Recibir mensajes
client.on('message', async (msg) => {
    // Solo procesar mensajes de grupos
    const chat = await msg.getChat();
    if (!chat.isGroup) return;
    
    // Solo procesar del grupo objetivo
    if (chat.id._serialized !== TARGET_GROUP_ID) return;
    
    const text = msg.body.toUpperCase().trim();
    const contact = await msg.getContact();
    const senderName = contact.pushname || contact.number;
    
    console.log(`\n📩 Mensaje en grupo: "${msg.body}" de ${senderName}`);
    
    // Verificar si es respuesta a un mensaje
    if (msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        const originalText = quotedMsg.body;
        
        console.log(`   ↳ Es respuesta a: "${originalText.substring(0, 50)}..."`);
        
        if (['DONE', 'LISTO', 'OK', 'REJECT', 'RECHAZAR'].includes(text)) {
            // Extraer order ID del mensaje original (buscar Ref: XXXXXXXXXX)
            const match = originalText.match(/Ref:\s*(\d{10,})/);
            
            if (match) {
                const orderId = match[1];
                const action = ['DONE', 'LISTO', 'OK'].includes(text) ? 'complete' : 'reject';
                
                console.log(`   ✅ Order ID: ${orderId}, Acción: ${action}`);
                
                // Notificar al servidor Python
                try {
                    const response = await fetch(`${PYTHON_SERVER}/webhook`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            order_id: orderId,
                            action: action,
                            source: 'whatsapp',
                            user: senderName
                        })
                    });
                    
                    if (response.ok) {
                        const emoji = action === 'complete' ? '✅' : '🚫';
                        await msg.reply(`${emoji} Pedido ${orderId} ${action === 'complete' ? 'COMPLETADO' : 'RECHAZADO'}`);
                    } else {
                        await msg.reply('❌ Error al procesar. Intenta de nuevo.');
                    }
                } catch (error) {
                    console.log(`   ❌ Error notificando a Python: ${error.message}`);
                    await msg.reply('⚠️ Error de conexión con el servidor.');
                }
            } else {
                console.log('   ⚠️ No se encontró Order ID en el mensaje original');
            }
        }
    }
});

// Desconexión
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp desconectado:', reason);
    console.log('🔄 Reiniciando en 5 segundos...');
    setTimeout(() => client.initialize(), 5000);
});

// ==================== SERVIDOR HTTP (para recibir del Python) ====================
const app = express();
app.use(express.json());

// Endpoint para enviar mensajes
app.post('/send', async (req, res) => {
    try {
        const { message, groupId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message required' });
        }
        
        const targetId = groupId || TARGET_GROUP_ID;
        
        if (!targetId) {
            return res.status(400).json({ error: 'No group configured' });
        }
        
        console.log(`\n📤 Enviando mensaje a grupo...`);
        await client.sendMessage(targetId, message);
        console.log('✅ Mensaje enviado!');
        
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/status', (req, res) => {
    res.json({
        status: client.info ? 'connected' : 'disconnected',
        phone: client.info?.wid?.user || null,
        group: TARGET_GROUP_ID || null
    });
});

// Configurar grupo manualmente
app.post('/set-group', async (req, res) => {
    const { groupName, groupId } = req.body;
    
    if (groupId) {
        TARGET_GROUP_ID = groupId;
        return res.json({ success: true, groupId: TARGET_GROUP_ID });
    }
    
    if (groupName) {
        const chats = await client.getChats();
        const group = chats.find(c => c.isGroup && c.name.toLowerCase().includes(groupName.toLowerCase()));
        
        if (group) {
            TARGET_GROUP_ID = group.id._serialized;
            return res.json({ success: true, groupId: TARGET_GROUP_ID, groupName: group.name });
        }
        
        return res.status(404).json({ error: 'Group not found' });
    }
    
    res.status(400).json({ error: 'groupName or groupId required' });
});

// Listar grupos
app.get('/groups', async (req, res) => {
    try {
        const chats = await client.getChats();
        const groups = chats.filter(c => c.isGroup).map(g => ({
            id: g.id._serialized,
            name: g.name
        }));
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== MOSTRAR QR EN NAVEGADOR ==========
app.get('/qr', async (req, res) => {
    if (!currentQR) {
        return res.send(`
            <html>
            <head><title>WhatsApp QR</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px; background: #1a1a2e; color: white;">
                <h1>📱 WhatsApp Bot</h1>
                <p style="font-size: 24px;">
                    ${client.info ? '✅ Ya conectado!' : '⏳ Esperando QR... Recarga la página.'}
                </p>
                <p>Si ya estás conectado, no necesitas escanear QR.</p>
                <script>setTimeout(() => location.reload(), 3000);</script>
            </body>
            </html>
        `);
    }
    
    try {
        const qrImage = await QRCode.toDataURL(currentQR, { width: 400, margin: 2 });
        res.send(`
            <html>
            <head>
                <title>Escanea el QR - WhatsApp</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body style="font-family: Arial; text-align: center; padding: 20px; background: #1a1a2e; color: white;">
                <h1>📱 Escanea con WhatsApp</h1>
                <img src="${qrImage}" style="border: 10px solid white; border-radius: 20px; max-width: 90%;">
                <p style="margin-top: 20px; font-size: 18px;">
                    1. Abre WhatsApp en tu teléfono<br>
                    2. Ve a Configuración → Dispositivos vinculados<br>
                    3. Toca "Vincular un dispositivo"<br>
                    4. Escanea este código
                </p>
                <p style="color: #888;">Esta página se recargará automáticamente...</p>
                <script>setTimeout(() => location.reload(), 20000);</script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error generando QR: ' + error.message);
    }
});

// Iniciar servidor HTTP
app.listen(PORT, () => {
    console.log(`🌐 Servidor HTTP escuchando en puerto ${PORT}`);
    console.log(`   POST /send - Enviar mensaje`);
    console.log(`   GET /status - Estado del bot`);
    console.log(`   GET /groups - Listar grupos`);
    console.log(`   POST /set-group - Configurar grupo`);
});

// Iniciar cliente WhatsApp
client.initialize();

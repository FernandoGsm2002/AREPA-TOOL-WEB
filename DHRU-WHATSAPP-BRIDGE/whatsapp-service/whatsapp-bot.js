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
let TARGET_GROUP_NAME = 'Procesos LeoPe-Gsm';  // Nombre del grupo a buscar
let currentQR = '';  // Almacena el QR actual para mostrarlo en web

// ==================== GRUPOS PERMITIDOS (whitelist) ====================
// Solo se leen/procesan mensajes de ESTOS grupos. Ignoramos todo lo demás.
const ALLOWED_GROUPS = [
    'Procesos LeoPe-Gsm',
    'Moto Qcom Orders 🟢',
    'PREVENTIVO BITEL AQUI',
    'Leo Registro Claro & MOVISTAR Colombia',
    'Tigo Nuevo',
    'NUEVO SISTEMA CLARO',
    'Preventivo VIA IMEI Nuevo ✅',
    'Xiaomi Colombia Procesos 🇨🇴',
    'ENTEL POR LOTES 🔵',
    'Kurama Claro Procesos 🔴',
    'XIAOMI HOY ACA',
    'Octoplus Creditos 🐙',
    'SISTEMA ENTEL RECUPERADO ✅',
    'Sam FRP V5 BUG✅',   // ← Servicios 401, 402, 403
];

// Código de éxito especial para servicios Samsung FRP V5 (401, 402, 403)
const SAM_FRP_SUCCESS_CODE = 'Device Register Successfully On Level 5 (VIP Series), Reboot Your Device And Enjoy, Submit Your Next Order';
// Código para servicio de Verificar y Reembolsar (404)
const SAM_FRP_REFUND_CODE  = 'Refunded.';

/**
 * Verifica si un nombre de grupo está en la whitelist (coincidencia parcial).
 */
function isAllowedGroup(groupName) {
    if (!groupName) return false;
    const lower = groupName.toLowerCase();
    return ALLOWED_GROUPS.some(allowed => lower.includes(allowed.toLowerCase()));
}

// ==================== HELPER: OBTENER GRUPOS SIN CANALES ROTOS ====================
async function getSafeGroups() {
    const raw = await client.getChats();
    const groups = [];
    for (const chat of raw) {
        try {
            // Saltar canales de broadcast (causan crash si channelMetadata falta)
            if (chat.id && chat.id.server === 'newsletter') continue;
            if (!chat.isGroup) continue;
            groups.push(chat);
        } catch (e) {
            // Ignorar chats rotos silenciosamente
        }
    }
    return groups;
}

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
    console.log('✅ Autenticado correctamente');
});

// Cliente listo
client.on('ready', async () => {
    console.log('🚀 WhatsApp Bot LISTO!');
    console.log(`📞 Conectado como: ${client.info.pushname}`);
    
    // Buscar el grupo objetivo (usando helper seguro que evita canales rotos)
    const groups = await getSafeGroups();
    
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

// Recibir mensajes (message_create captura también los mensajes propios)
client.on('message_create', async (msg) => {
    // Solo procesar mensajes de grupos (con guard para canales/newsletters)
    let chat;
    try {
        chat = await msg.getChat();
    } catch (e) {
        return; // ignorar canales de broadcast rotos
    }
    if (!chat || !chat.isGroup) return;

    // ── FILTRO WHITELIST ──────────────────────────────────────────
    // Ignorar silenciosamente grupos que no son operativos
    if (!isAllowedGroup(chat.name)) return;
    // ─────────────────────────────────────────────────────────────
    
    const text = msg.body.toUpperCase().trim();
    
    // getContact() falla en mensajes propios (fromMe) porque author viene undefined
    let senderName = 'Admin (tú)';
    if (!msg.fromMe) {
        try {
            const contact = await msg.getContact();
            senderName = contact.pushname || contact.number || 'Desconocido';
        } catch (e) {
            senderName = 'Desconocido';
        }
    }
    
    console.log(`\n📩 Mensaje en grupo "${chat.name}": "${msg.body}" de ${senderName}`);
    
    const rawText = msg.body.trim();
    const upperRaw = rawText.toUpperCase();

    // ===== MAPEO DE KEYWORDS DE RECHAZO =====
    const rejectKeywords = {
        'por base':         { wa: '🚫 Rechazado — Base dañada',          dhru: 'Rechazado base dañada' },
        'no conecta':       { wa: '🚫 Rechazado — IP no encontrada',      dhru: 'Rechazado IP no encontrada' },
        'por no soportado': { wa: '🚫 Rechazado — Modelo no soportado',  dhru: 'Rechazado modelo no soportado' },
    };

    // ===== FUNCIÓN HELPER PARA PROCESAR COMANDO =====
    async function processCommand(orderId, isDone, isReject, reasonText, codeText = null) {
        const action = isDone ? 'complete' : 'reject';

        let waReply  = '🚫 Rechazado por Admin';
        let dhruCode = 'Rechazado por Admin 🚫';

        if (isReject && reasonText) {
            const rawReason = reasonText.trim().toLowerCase();
            const mapped = rejectKeywords[rawReason];
            if (mapped) {
                waReply  = mapped.wa;
                dhruCode = mapped.dhru + ' 🚫';
            } else {
                waReply  = `🚫 Rechazado — ${reasonText.trim()}`;
                dhruCode = `Rechazado — ${reasonText.trim()} 🚫`;
            }
        } else if (isDone && codeText) {
            dhruCode = codeText;
        }

        console.log(`   ✅ Order ID: ${orderId}, Acción: ${action}, Código: ${dhruCode}`);

        try {
            const payload = { order_id: orderId, action, source: 'whatsapp', user: senderName };
            if (action === 'reject') payload.reason = dhruCode;
            if (action === 'complete' && codeText) payload.code = codeText;

            const response = await fetch(`${PYTHON_SERVER}/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const replyMsg = action === 'complete' ? '✅ Servicio Completado Con Exito' : waReply;
                await msg.reply(replyMsg);
            } else {
                await msg.reply('❌ Error al procesar. Intenta de nuevo.');
            }
        } catch (error) {
            console.log(`   ❌ Error notificando a Python: ${error.message}`);
            await msg.reply('⚠️ Error de conexión con el servidor.');
        }
    }

    // Detectar si el mensaje viene del grupo Samsung FRP V5 (servicios 401/402/403)
    const isSamFRPGroup = chat.name.toLowerCase().includes('sam frp v5');

    // =================================================================
    // MODO 1: Comando directo sin reply → "DONE 1740670456"
    //         o "REJECT 1740670456 motivo"
    // Formato: <COMANDO> <REF_ID> [motivo opcional]
    // =================================================================
    const directMatch = rawText.match(/^(DONE|LISTO|OK|REJECT|RECHAZAR)\s+(\d{10,})(?:\s+(.+))?$/i);
    if (directMatch) {
        const cmd      = directMatch[1].toUpperCase();
        const orderId  = directMatch[2];
        const extra    = directMatch[3] || '';
        const isDone   = ['DONE', 'LISTO', 'OK'].includes(cmd);
        const isReject = ['REJECT', 'RECHAZAR'].includes(cmd);
        console.log(`   🎯 Comando directo detectado: ${cmd} → Ref ${orderId}`);
        
        const reasonText = isReject ? extra : '';
        // Para Sam FRP V5: siempre usar el código especial en DONE
        const codeText   = isDone ? (isSamFRPGroup ? SAM_FRP_SUCCESS_CODE : extra) : null;

        await processCommand(orderId, isDone, isReject, reasonText, codeText);
        return;
    }

    // =================================================================
    // MODO 2: Reply a mensaje del bot (comportamiento original)
    //         El Ref ID se extrae del mensaje citado
    // =================================================================
    if (msg.hasQuotedMsg) {
        let originalText = null;

        // PASO 1: leer del _data sincrónico (rápido, no falla con puppeteer)
        try {
            if (msg._data && msg._data.quotedMsg && msg._data.quotedMsg.body) {
                originalText = msg._data.quotedMsg.body;
            }
        } catch (e) { /* ignorar */ }

        // PASO 2: fallback async vía puppeteer si el paso 1 falló
        if (!originalText) {
            try {
                const quotedMsg = await msg.getQuotedMessage();
                if (quotedMsg && quotedMsg.body) originalText = quotedMsg.body;
            } catch (e) {
                console.log(`   ⚠️ No se pudo leer el mensaje citado: ${e.message}`);
            }
        }

        if (!originalText) {
            console.log('   ⚠️ Sin texto citado recuperable — usa: DONE <ref_id>');
            return;
        }

        console.log(`   ↳ Es respuesta a: "${originalText.substring(0, 50)}..."`);

        const isReject = upperRaw === 'REJECT' || upperRaw === 'RECHAZAR'
            || upperRaw.startsWith('REJECT ') || upperRaw.startsWith('RECHAZAR ');

        // Verificamos si es un servicio de Octoplus (según el msg citado)
        const isOctoplus = originalText.toLowerCase().includes('octoplus') || originalText.includes('🐙');
        let isDone = false;

        if (isOctoplus) {
            // Para Octoplus, cualquier respuesta q no sea REJECT es COMPLETADO
            isDone = !isReject;
        } else {
            // Para los demás, exige el comando explícito
            isDone = ['DONE', 'LISTO', 'OK'].some(w => upperRaw === w || upperRaw.startsWith(w + ' '));
        }

        if (isDone || isReject) {
            const match = originalText.match(/Ref:\s*(\d{10,})/);
            if (match) {
                const orderId = match[1];
                let reason = '';
                let successCode = null;

                if (isReject) {
                    const spaceIdx = rawText.indexOf(' ');
                    if (spaceIdx !== -1) reason = rawText.substring(spaceIdx + 1).trim();
                } else {
                    // Limpiamos los comandos DONE/LISTO si los puso
                    let cleanText = rawText.replace(/^(DONE|LISTO|OK)\s*/i, '').trim();
                    
                    if (isSamFRPGroup) {
                        // Para Sam FRP V5: detectar si es el servicio de Reembolso (404)
                        const isRefundService = originalText.includes('Refund');
                        cleanText = isRefundService ? SAM_FRP_REFUND_CODE : SAM_FRP_SUCCESS_CODE;
                    } else if (isOctoplus) {
                        // Para Octoplus, agregamos "success✅" si no lo tiene
                        if (!cleanText.toLowerCase().endsWith('success✅')) {
                            cleanText = cleanText ? `${cleanText} success✅` : 'Servicio Completado Con Exito success✅';
                        }
                    } else {
                        // Para los demás servicios, si está vacío enviamos un Default
                        if (!cleanText) cleanText = 'Servicio Completado Con Exito ✅';
                    }
                    successCode = cleanText;
                }

                await processCommand(orderId, isDone, isReject, reason, successCode);
            } else {
                console.log('   ⚠️ No se encontró Order ID — usa: DONE <ref_id>');
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
        const { message, groupId, groupName } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message required' });
        }
        
        let targetId = groupId || TARGET_GROUP_ID;
        
        // Si se envía groupName, buscar el grupo por nombre
        if (groupName && !groupId) {
            const groups = await getSafeGroups();
            const found = groups.find(c => 
                c.name.toLowerCase().includes(groupName.toLowerCase())
            );
            
            if (found) {
                targetId = found.id._serialized;
                console.log(`   🔍 Grupo encontrado: "${found.name}" para "${groupName}"`);
            } else {
                console.log(`   ⚠️ Grupo "${groupName}" no encontrado, usando grupo por defecto`);
            }
        }
        
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
        const groups = await getSafeGroups();
        const group = groups.find(c => c.name.toLowerCase().includes(groupName.toLowerCase()));
        
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
        const groups = await getSafeGroups();
        res.json(groups.map(g => ({
            id: g.id._serialized,
            name: g.name
        })));
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

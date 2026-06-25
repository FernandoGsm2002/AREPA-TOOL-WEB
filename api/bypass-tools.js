import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Solo expone arepatoolsapks — nunca otros buckets
const BUCKET = 'arepatoolsapks';

// Whitelist explícita — solo estos archivos son descargables
const TOOLS = [
    {
        key:         'A12+bypass.exe',
        title:       'A12+ Bypass',
        description: 'iCloud bypass tool for A12+ devices. iOS 16–26. Requires active ArepaTool license.',
        icon:        'bi-apple',
        tag:         'Official',
        tagClass:    'gold',
        size:        null
    },
    {
        key:         'HIDDENicloud.exe',
        title:       'HIDDEN iCloud',
        description: 'Hidden iCloud bypass method. Alternative approach for supported A12+ models.',
        icon:        'bi-eye-slash-fill',
        tag:         'Official',
        tagClass:    'gold',
        size:        null
    }
];

const s3 = new S3Client({
    region:   'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId:     process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

    try {
        const tools = await Promise.all(
            TOOLS.map(async (tool) => {
                const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: tool.key });
                const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
                return { ...tool, downloadUrl: url };
            })
        );

        // Cache 5 min en el browser — las URLs pre-firmadas duran 1 hora
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.status(200).json({ tools });

    } catch (err) {
        console.error('bypass-tools error:', err);
        return res.status(500).json({ error: 'Failed to generate download links' });
    }
}

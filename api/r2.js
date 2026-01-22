import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 Configuration (same as C# project)
const R2_CONFIG = {
    accountId: '8fc120a4cc06bc9a39d9555a416fa166',
    endpoint: 'https://8fc120a4cc06bc9a39d9555a416fa166.r2.cloudflarestorage.com',
    accessKeyId: 'ca1f0062efaa08d8af4e8f0be7fee5e3',
    secretAccessKey: 'b420796aee7bdd0e79117023f3bb638dc037fb70a00935f6836119f8059df57b',
    bucket: 'arepatoolfiles', // New bucket for panel files
    region: 'auto'
};

// Create S3 client for R2
const s3Client = new S3Client({
    region: R2_CONFIG.region,
    endpoint: R2_CONFIG.endpoint,
    credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
    },
    forcePathStyle: true, // Required for R2
});

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'list':
                return await listFiles(req, res);
            case 'upload-url':
                return await getUploadUrl(req, res);
            case 'download-url':
                return await getDownloadUrl(req, res);
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('R2 API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// List files in bucket
async function listFiles(req, res) {
    const { prefix = '' } = req.query;

    const command = new ListObjectsV2Command({
        Bucket: R2_CONFIG.bucket,
        Prefix: prefix,
    });

    const response = await s3Client.send(command);

    const files = (response.Contents || []).map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        etag: obj.ETag
    }));

    return res.status(200).json({ files });
}

// Get presigned URL for upload
async function getUploadUrl(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { fileName, contentType, category } = req.body;

    if (!fileName || !category) {
        return res.status(400).json({ error: 'fileName and category are required' });
    }

    // Build the key with category folder
    const key = `${category}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: key,
        ContentType: contentType || 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    return res.status(200).json({
        uploadUrl,
        key,
        expiresIn: 3600
    });
}

// Get presigned URL for download
async function getDownloadUrl(req, res) {
    const { key } = req.query;

    if (!key) {
        return res.status(400).json({ error: 'key is required' });
    }

    const command = new GetObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    return res.status(200).json({
        downloadUrl,
        expiresIn: 3600
    });
}

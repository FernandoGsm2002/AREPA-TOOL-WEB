// API Route for NextDNS proxy (to avoid CORS issues)
// Deploy on Vercel

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration (same as C# app)
const R2_CONFIG = {
    endpoint: 'https://8fc120a4cc06bc9a39d9555a416fa166.r2.cloudflarestorage.com',
    accessKeyId: 'ca1f0062efaa08d8af4e8f0be7fee5e3',
    secretAccessKey: 'b420796aee7bdd0e79117023f3bb638dc037fb70a00935f6836119f8059df57b',
    region: 'auto',
    bucketDnsConfig: 'arepatool-dnsconfig',
    dnsConfigFile: 'config/nextdns-profiles.json'
};

// NextDNS API Keys (rotation)
const NEXTDNS_API_KEYS = [
    'f3ff5d05f3ac58b3520fce543911b60780717ce1',
    '753857c8f7a93e2172f20b41c55e0b311760058b'
];

let currentApiKeyIndex = 0;
let cachedConfig = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getNextApiKey() {
    const key = NEXTDNS_API_KEYS[currentApiKeyIndex];
    currentApiKeyIndex = (currentApiKeyIndex + 1) % NEXTDNS_API_KEYS.length;
    return key;
}

// Get R2 client
function getR2Client() {
    return new S3Client({
        region: R2_CONFIG.region,
        endpoint: R2_CONFIG.endpoint,
        credentials: {
            accessKeyId: R2_CONFIG.accessKeyId,
            secretAccessKey: R2_CONFIG.secretAccessKey
        }
    });
}

// Fetch DNS config from R2
async function fetchDnsConfigFromR2() {
    // Check cache
    if (cachedConfig && Date.now() - cacheTime < CACHE_DURATION) {
        return cachedConfig;
    }

    try {
        const client = getR2Client();
        const command = new GetObjectCommand({
            Bucket: R2_CONFIG.bucketDnsConfig,
            Key: R2_CONFIG.dnsConfigFile
        });

        const response = await client.send(command);
        const bodyString = await response.Body.transformToString();
        const config = JSON.parse(bodyString);

        // Update cache
        cachedConfig = config;
        cacheTime = Date.now();

        return config;
    } catch (error) {
        console.error('Error fetching DNS config from R2:', error);
        return null;
    }
}

// Get domains for a profile type
async function getDomainsForProfile(profileType) {
    const config = await fetchDnsConfigFromR2();
    
    if (config?.Profiles?.[profileType]?.Domains) {
        return config.Profiles[profileType].Domains;
    }

    // Fallback domains (hardcoded)
    const FALLBACK_DOMAINS = {
        ClaroTelcelBypass: [
            'poemcl.com', 'ppmxfa.com', 'f2ppch.cl', 'www.inhab.claro.com.gt',
            'www.forcis.claro.com.co', 'www.ppecufa.com', 'www.pprdfa.com',
            'moto-cds.appspot.com', 'firebase-settings.crashlytics.com',
            'clientapi.appamx.com', 'download.appamx.com',
            'notification.sandclowd.com', 'authentication.sandclowd.com'
        ],
        SamsungKGOperations: [
            'vas.samsungapps.com', 'capi.samsungcloud.com', 'samsungcloud.com',
            'dc.dqa.samsung.com', 'diagmon-serviceapi.samsungdm.com',
            'samsungdm.com', 'api.account.samsung.com',
            'euprod-knoxpp.samsungknox.com', 'gsl.samsunggsl.com',
            'provisioning.samsung.com', 'mdm.samsungmobile.com',
            'kg.apac.sec.samsung.com', 'knoxguard.samsung.com',
            'lock.samsungknox.com', 'frp.samsung.com', 'samsungknox.com'
        ],
        HonorBloatware: [
            'devicelockcheckin-pa.googleapis.com', 'sla-intl.trustlook.com',
            'default.exp-tas.com', 'time.xtracloud.net',
            'afwprovisioning-pa.googleapis.com',
            'update.platform.hihonorcloud.com'
        ],
        MotorolaWhiteScreen: [
            'firebaseinstallations.googleapis.com',
            'firebase-settings.crashlytics.com', 'argo.svcmot.com',
            'remoteprovisioning.googleapis.com', 'motpaks.com'
        ]
    };

    return FALLBACK_DOMAINS[profileType] || [];
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    // Get remote DNS config
    if (action === 'get-config') {
        try {
            const config = await fetchDnsConfigFromR2();
            if (config) {
                return res.status(200).json({ success: true, config });
            } else {
                return res.status(500).json({ error: 'Could not fetch config from R2' });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Create DNS profile
    if (req.method === 'POST' && action === 'create-profile') {
        try {
            const { name, profileType } = req.body;
            
            if (!name || !profileType) {
                return res.status(400).json({ error: 'Missing name or profileType' });
            }

            const apiKey = getNextApiKey();

            // 1. Get domains from R2 config (or fallback)
            const domains = await getDomainsForProfile(profileType);

            // 2. Create profile in NextDNS
            const createRes = await fetch('https://api.nextdns.io/profiles', {
                method: 'POST',
                headers: {
                    'X-Api-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });

            if (!createRes.ok) {
                const error = await createRes.text();
                console.error('NextDNS create error:', error);
                return res.status(500).json({ error: `Failed to create profile: ${createRes.status}` });
            }

            const profile = await createRes.json();
            const profileId = profile.data?.id || profile.id;

            if (!profileId) {
                return res.status(500).json({ error: 'No profile ID returned from NextDNS' });
            }

            // 3. Add domains to denylist
            let domainsAdded = 0;
            for (const domain of domains) {
                try {
                    await fetch(`https://api.nextdns.io/profiles/${profileId}/denylist`, {
                        method: 'POST',
                        headers: {
                            'X-Api-Key': apiKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: domain, active: true })
                    });
                    domainsAdded++;
                } catch (e) {
                    console.error(`Error adding domain ${domain}:`, e);
                }
            }

            const dnsHostname = `${profileId}.dns.nextdns.io`;

            return res.status(200).json({
                success: true,
                profileId,
                dnsHostname,
                domainsAdded,
                configSource: cachedConfig ? 'r2' : 'fallback'
            });

        } catch (error) {
            console.error('NextDNS error:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(400).json({ error: 'Invalid action. Use: get-config or create-profile' });
}

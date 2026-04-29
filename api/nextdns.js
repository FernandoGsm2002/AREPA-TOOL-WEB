// API Route for NextDNS proxy (to avoid CORS issues)
// Deploy on Vercel

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

// R2 Configuration — credentials must be set as environment variables
const R2_CONFIG = {
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    region: 'auto',
    bucketDnsConfig: process.env.R2_DNS_BUCKET || 'arepatool-dnsconfig',
    dnsConfigFile: 'config/nextdns-profiles.json'
};

// NextDNS API Keys — set as environment variables (comma-separated)
const NEXTDNS_API_KEYS = (process.env.NEXTDNS_API_KEYS || '').split(',').filter(Boolean);

let currentApiKeyIndex = 0;
let cachedConfig = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getNextApiKey() {
    if (NEXTDNS_API_KEYS.length === 0) return null;
    const key = NEXTDNS_API_KEYS[currentApiKeyIndex];
    currentApiKeyIndex = (currentApiKeyIndex + 1) % NEXTDNS_API_KEYS.length;
    return key;
}

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

async function fetchDnsConfigFromR2() {
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

        cachedConfig = config;
        cacheTime = Date.now();

        return config;
    } catch (error) {
        console.error('Error fetching DNS config from R2:', error);
        return null;
    }
}

async function getDomainsForProfile(profileType) {
    const config = await fetchDnsConfigFromR2();

    if (config?.Profiles?.[profileType]?.Domains) {
        return config.Profiles[profileType].Domains;
    }

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

// Validate the Supabase session token from the Authorization header
async function validateSession(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.slice(7);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;

    // Verify the user has an active subscription in public.users
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('status')
        .eq('email', data.user.email)
        .maybeSingle();

    if (profileError || !profile) return null;
    if (profile.status !== 'active' && profile.status !== 'admin') return null;

    return data.user;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://arepatool.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    // All actions require a valid authenticated session
    const user = await validateSession(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized. Valid session required.' });
    }

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

    if (req.method === 'POST' && action === 'create-profile') {
        try {
            const { name, profileType } = req.body;

            if (!name || !profileType) {
                return res.status(400).json({ error: 'Missing name or profileType' });
            }

            const apiKey = getNextApiKey();
            if (!apiKey) {
                return res.status(500).json({ error: 'NextDNS API not configured' });
            }

            const domains = await getDomainsForProfile(profileType);

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

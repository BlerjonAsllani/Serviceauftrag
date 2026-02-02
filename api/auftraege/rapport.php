<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nicht authentifiziert']);
    exit;
}

require_once __DIR__ . '/../config/supabase.php';

$input = json_decode(file_get_contents('php://input'), true);

$auftragId = $input['auftragId'] ?? null;
$ausfuehrungsdatum = $input['ausfuehrungsdatum'] ?? null;
$arbeitszeitVon = $input['arbeitszeitVon'] ?? null;
$arbeitszeitBis = $input['arbeitszeitBis'] ?? null;
$arbeitsstunden = $input['arbeitsstunden'] ?? null;
$verwendetesMaterial = $input['verwendetesMaterial'] ?? '';
$bemerkungen = $input['bemerkungen'] ?? '';

if (!$auftragId || !$ausfuehrungsdatum || !$bemerkungen) {
    http_response_code(400);
    echo json_encode(['error' => 'Pflichtfelder fehlen']);
    exit;
}

if (strlen($bemerkungen) < 20) {
    http_response_code(400);
    echo json_encode(['error' => 'Bemerkungen müssen mindestens 20 Zeichen lang sein']);
    exit;
}

try {
    $supabase = new Supabase();
    
    // Prüfen ob Auftrag existiert und disponiert ist
    $auftraege = $supabase->select('auftrag', ['auftragid' => $auftragId]);
    
    if (empty($auftraege)) {
        http_response_code(404);
        echo json_encode(['error' => 'Auftrag nicht gefunden']);
        exit;
    }
    
    $auftrag = $auftraege[0];
    
    if ($auftrag['status'] !== 'disponiert') {
        http_response_code(400);
        echo json_encode(['error' => 'Nur disponierte Aufträge können rapportiert werden']);
        exit;
    }
    
    // Prüfen ob MA berechtigt
    if ($_SESSION['rolle'] === 'MA' && $auftrag['zugewiesenerma'] != $_SESSION['user_id']) {
        http_response_code(403);
        echo json_encode(['error' => 'Nicht berechtigt']);
        exit;
    }
    
    // Rapport erstellen
    $rapportData = [
        'auftragid' => $auftragId,
        'ausfuehrungsdatum' => $ausfuehrungsdatum,
        'arbeitszeitvon' => $arbeitszeitVon,
        'arbeitszeitbis' => $arbeitszeitBis,
        'arbeitsstunden' => $arbeitsstunden,
        'verwendetesmaterial' => $verwendetesMaterial,
        'bemerkungen' => $bemerkungen
    ];
    
    $supabase->insert('rapport', $rapportData);
    
    // Status auf ausgeführt setzen
    $supabase->update('auftrag', ['auftragid' => $auftragId], ['status' => 'ausgeführt']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Rapport erfolgreich erstellt'
    ]);
    
} catch (Exception $e) {
    error_log("Rapport Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Serverfehler']);
}
?>
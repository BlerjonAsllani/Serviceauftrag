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

if ($_SESSION['rolle'] !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(['error' => 'Keine Berechtigung']);
    exit;
}

require_once __DIR__ . '/../config/supabase.php';

$input = json_decode(file_get_contents('php://input'), true);

$auftragId = $input['auftragId'] ?? null;
$rechnungsnummer = $input['rechnungsnummer'] ?? null;
$betrag = $input['betrag'] ?? null;
$rechnungsdatum = $input['rechnungsdatum'] ?? null;

if (!$auftragId || !$rechnungsnummer || !$betrag || !$rechnungsdatum) {
    http_response_code(400);
    echo json_encode(['error' => 'Alle Felder sind erforderlich']);
    exit;
}

if ($betrag <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Betrag muss größer als 0 sein']);
    exit;
}

try {
    $supabase = new Supabase();
    
    // Prüfen ob Auftrag existiert und freigegeben ist
    $auftraege = $supabase->select('auftrag', ['auftragid' => $auftragId]);
    
    if (empty($auftraege)) {
        http_response_code(404);
        echo json_encode(['error' => 'Auftrag nicht gefunden']);
        exit;
    }
    
    if ($auftraege[0]['status'] !== 'freigegeben') {
        http_response_code(400);
        echo json_encode(['error' => 'Nur freigegebene Aufträge können verrechnet werden']);
        exit;
    }
    
    // Verrechnung erstellen
    $verrechnungData = [
        'auftragid' => $auftragId,
        'rechnungsnummer' => $rechnungsnummer,
        'betrag' => $betrag,
        'rechnungsdatum' => $rechnungsdatum
    ];
    
    $supabase->insert('verrechnung', $verrechnungData);
    
    // Status auf verrechnet setzen
    $supabase->update('auftrag', ['auftragid' => $auftragId], ['status' => 'verrechnet']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Auftrag erfolgreich verrechnet'
    ]);
    
} catch (Exception $e) {
    error_log("Verrechnen Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Serverfehler']);
}
?>
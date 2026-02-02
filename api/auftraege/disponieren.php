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

if ($_SESSION['rolle'] !== 'BL' && $_SESSION['rolle'] !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(['error' => 'Keine Berechtigung']);
    exit;
}

require_once __DIR__ . '/../config/supabase.php';

$input = json_decode(file_get_contents('php://input'), true);

$auftragId = $input['auftragId'] ?? null;
$zugewiesenerMA = $input['zugewiesenerMA'] ?? null;
$geplantesDatum = $input['geplantesDatum'] ?? null;
$interneNotizen = $input['interneNotizen'] ?? '';

if (!$auftragId || !$zugewiesenerMA || !$geplantesDatum) {
    http_response_code(400);
    echo json_encode(['error' => 'Pflichtfelder fehlen']);
    exit;
}

try {
    $supabase = new Supabase();
    
    // Prüfen ob Auftrag existiert und Status = erfasst
    $auftraege = $supabase->select('auftrag', ['auftragid' => $auftragId]);
    
    if (empty($auftraege)) {
        http_response_code(404);
        echo json_encode(['error' => 'Auftrag nicht gefunden']);
        exit;
    }
    
    if ($auftraege[0]['status'] !== 'erfasst') {
        http_response_code(400);
        echo json_encode(['error' => 'Nur erfasste Aufträge können disponiert werden']);
        exit;
    }
    
    // Auftrag disponieren
    $data = [
        'zugewiesenerma' => $zugewiesenerMA,
        'geplantesdatum' => $geplantesDatum,
        'internenotizen' => $interneNotizen,
        'status' => 'disponiert'
    ];
    
    $supabase->update('auftrag', ['auftragid' => $auftragId], $data);
    
    echo json_encode([
        'success' => true,
        'message' => 'Auftrag erfolgreich disponiert'
    ]);
    
} catch (Exception $e) {
    error_log("Disponieren Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Serverfehler']);
}
?>
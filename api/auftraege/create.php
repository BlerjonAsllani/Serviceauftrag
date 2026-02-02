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

$kundeName = $input['kundeName'] ?? '';
$kundeStrasse = $input['kundeStrasse'] ?? '';
$kundePlz = $input['kundePlz'] ?? '';
$kundeOrt = $input['kundeOrt'] ?? '';
$kundeTelefon = $input['kundeTelefon'] ?? '';
$kundeEmail = $input['kundeEmail'] ?? null;
$beschreibung = $input['beschreibung'] ?? '';
$prioritaet = $input['prioritaet'] ?? 'normal';
$gewuenschterTermin = $input['gewuenschterTermin'] ?? null;

if (empty($kundeName) || empty($kundeStrasse) || empty($kundePlz) || 
    empty($kundeOrt) || empty($kundeTelefon) || empty($beschreibung)) {
    http_response_code(400);
    echo json_encode(['error' => 'Pflichtfelder fehlen']);
    exit;
}

try {
    $supabase = new Supabase();
    
    $data = [
        'kundename' => $kundeName,
        'kundestrasse' => $kundeStrasse,
        'kundeplz' => $kundePlz,
        'kundeort' => $kundeOrt,
        'kundetelefon' => $kundeTelefon,
        'kundeemail' => $kundeEmail,
        'beschreibung' => $beschreibung,
        'prioritaet' => $prioritaet,
        'gewuenschtertermin' => $gewuenschterTermin,
        'erstelltvon' => $_SESSION['user_id']
    ];
    
    $result = $supabase->insert('auftrag', $data);
    
    echo json_encode([
        'success' => true,
        'message' => 'Auftrag erfolgreich erstellt',
        'auftragId' => $result[0]['auftragid'],
        'auftragsnummer' => $result[0]['auftragsnummer']
    ]);
    
} catch (Exception $e) {
    error_log("Create Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Serverfehler beim Erstellen']);
}
?>
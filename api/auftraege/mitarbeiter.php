<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nicht authentifiziert']);
    exit;
}

if ($_SESSION['rolle'] !== 'ADMIN' && $_SESSION['rolle'] !== 'BL') {
    http_response_code(403);
    echo json_encode(['error' => 'Keine Berechtigung']);
    exit;
}

require_once __DIR__ . '/../config/supabase.php';

try {
    $supabase = new Supabase();
    $mitarbeiter = $supabase->select('benutzer', ['aktiv' => 'true'], 'benutzerid,vorname,nachname,rolle');
    
    // Formatieren
    $result = array_map(function($ma) {
        return [
            'benutzerId' => $ma['benutzerid'],
            'name' => $ma['vorname'] . ' ' . $ma['nachname'],
            'rolle' => $ma['rolle']
        ];
    }, $mitarbeiter);
    
    echo json_encode([
        'success' => true,
        'data' => $result
    ]);
    
} catch (Exception $e) {
    error_log("Mitarbeiter Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Serverfehler']);
}
?>
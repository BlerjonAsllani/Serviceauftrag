<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');

// Session-Daten prüfen
if (!isset($_SESSION['user_id']) || 
    !isset($_SESSION['benutzername']) || 
    !isset($_SESSION['rolle']) ||
    empty($_SESSION['user_id'])) {
    
    http_response_code(401);
    echo json_encode([
        'authenticated' => false,
        'error' => 'Keine gültige Session'
    ]);
    exit;
}

// User-Daten zurückgeben
echo json_encode([
    'authenticated' => true,
    'user' => [
        'userId' => $_SESSION['user_id'],
        'benutzername' => $_SESSION['benutzername'],
        'vorname' => $_SESSION['vorname'] ?? '',
        'nachname' => $_SESSION['nachname'] ?? '',
        'rolle' => $_SESSION['rolle']
    ]
]);
?>
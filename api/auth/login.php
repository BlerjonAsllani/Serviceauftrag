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

require_once __DIR__ . '/../config/supabase.php';

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['benutzername'] ?? '';
$password = $input['passwort'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Benutzername und Passwort erforderlich']);
    exit;
}

try {
    $supabase = new Supabase();
    $users = $supabase->select('benutzer', ['benutzername' => $username]);
    
    if (empty($users)) {
        http_response_code(401);
        echo json_encode(['error' => 'Ungültige Anmeldedaten']);
        exit;
    }
    
    $user = $users[0];
    
    if (!password_verify($password, $user['passwordhash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Ungültige Anmeldedaten']);
        exit;
    }
    
    if (!$user['aktiv']) {
        http_response_code(401);
        echo json_encode(['error' => 'Benutzer ist deaktiviert']);
        exit;
    }
    
    $_SESSION['user_id'] = $user['benutzerid'];
    $_SESSION['benutzername'] = $user['benutzername'];
    $_SESSION['rolle'] = $user['rolle'];
    $_SESSION['vorname'] = $user['vorname'];
    $_SESSION['nachname'] = $user['nachname'];
    
    echo json_encode([
        'success' => true,
        'user' => [
            'userId' => $user['benutzerid'],
            'benutzername' => $user['benutzername'],
            'vorname' => $user['vorname'],
            'nachname' => $user['nachname'],
            'email' => $user['email'],
            'rolle' => $user['rolle']
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Login Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Serverfehler beim Login']);
}
?>
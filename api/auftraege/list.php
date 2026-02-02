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

require_once __DIR__ . '/../config/supabase.php';

try {
    $supabase = new Supabase();
    
    $userId = $_SESSION['user_id'];
    $rolle = $_SESSION['rolle'];
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';
    
    // Aufträge laden
    $filters = [];
    
    // Filter für Mitarbeiter
    if ($rolle === 'MA') {
        $filters['zugewiesenerma'] = $userId;
    }
    
    // Status-Filter
    if (!empty($status)) {
        $filters['status'] = $status;
    }
    
    $auftraege = $supabase->select('auftrag', $filters);
    
    // Suche anwenden (clientseitig da Supabase API eingeschränkt ist)
    if (!empty($search)) {
        $auftraege = array_filter($auftraege, function($a) use ($search) {
            $searchLower = strtolower($search);
            return stripos($a['auftragsnummer'], $search) !== false ||
                   stripos($a['kundename'], $search) !== false ||
                   stripos($a['kundeort'], $search) !== false ||
                   stripos($a['beschreibung'], $search) !== false;
        });
    }
    
    // Für jeden Auftrag Mitarbeiter-Name und Ersteller-Name laden
    $result = [];
    foreach ($auftraege as $auftrag) {
        $item = [
            'auftragId' => $auftrag['auftragid'],
            'auftragsnummer' => $auftrag['auftragsnummer'],
            'kundeName' => $auftrag['kundename'],
            'kundeStrasse' => $auftrag['kundestrasse'],
            'kundePlz' => $auftrag['kundeplz'],
            'kundeOrt' => $auftrag['kundeort'],
            'kundeTelefon' => $auftrag['kundetelefon'],
            'kundeEmail' => $auftrag['kundeemail'],
            'beschreibung' => $auftrag['beschreibung'],
            'prioritaet' => $auftrag['prioritaet'],
            'status' => $auftrag['status'],
            'gewuenschterTermin' => $auftrag['gewuenschtertermin'],
            'geplantesDatum' => $auftrag['geplantesdatum'],
            'interneNotizen' => $auftrag['internenotizen'],
            'zugewiesenerMA' => $auftrag['zugewiesenerma'],
            'erstelltVon' => $auftrag['erstelltvon'],
            'erstelltAm' => $auftrag['erstelltam'],
            'mitarbeiterName' => null,
            'erstelltVonName' => null
        ];
        
        // Mitarbeiter-Name laden falls zugewiesen
        if ($auftrag['zugewiesenerma']) {
            $mitarbeiter = $supabase->select('benutzer', ['benutzerid' => $auftrag['zugewiesenerma']]);
            if (!empty($mitarbeiter)) {
                $item['mitarbeiterName'] = $mitarbeiter[0]['vorname'] . ' ' . $mitarbeiter[0]['nachname'];
            }
        }
        
        // Ersteller-Name laden
        if ($auftrag['erstelltvon']) {
            $ersteller = $supabase->select('benutzer', ['benutzerid' => $auftrag['erstelltvon']]);
            if (!empty($ersteller)) {
                $item['erstelltVonName'] = $ersteller[0]['vorname'] . ' ' . $ersteller[0]['nachname'];
            }
        }
        
        $result[] = $item;
    }
    
    // Nach Erstelldatum sortieren (neueste zuerst)
    usort($result, function($a, $b) {
        return strtotime($b['erstelltAm']) - strtotime($a['erstelltAm']);
    });
    
    echo json_encode([
        'success' => true,
        'data' => $result
    ]);
    
} catch (Exception $e) {
    error_log("List Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Serverfehler']);
}
?>
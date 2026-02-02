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

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID fehlt']);
    exit;
}

require_once __DIR__ . '/../config/supabase.php';

try {
    $supabase = new Supabase();
    
    $userId = $_SESSION['user_id'];
    $rolle = $_SESSION['rolle'];
    
    // Auftrag laden
    $auftraege = $supabase->select('auftrag', ['auftragid' => $id]);
    
    if (empty($auftraege)) {
        http_response_code(404);
        echo json_encode(['error' => 'Auftrag nicht gefunden']);
        exit;
    }
    
    $auftrag = $auftraege[0];
    
    // Berechtigungsprüfung für MA
    if ($rolle === 'MA' && $auftrag['zugewiesenerma'] != $userId) {
        http_response_code(403);
        echo json_encode(['error' => 'Keine Berechtigung']);
        exit;
    }
    
    // Mitarbeiter-Name laden
    $mitarbeiterName = null;
    if ($auftrag['zugewiesenerma']) {
        $mitarbeiter = $supabase->select('benutzer', ['benutzerid' => $auftrag['zugewiesenerma']]);
        if (!empty($mitarbeiter)) {
            $mitarbeiterName = $mitarbeiter[0]['vorname'] . ' ' . $mitarbeiter[0]['nachname'];
        }
    }
    
    // Ersteller-Name laden
    $erstellerName = null;
    if ($auftrag['erstelltvon']) {
        $ersteller = $supabase->select('benutzer', ['benutzerid' => $auftrag['erstelltvon']]);
        if (!empty($ersteller)) {
            $erstellerName = $ersteller[0]['vorname'] . ' ' . $ersteller[0]['nachname'];
        }
    }
    
    // Rapport laden
    $rapportData = null;
    if (in_array($auftrag['status'], ['ausgeführt', 'freigegeben', 'verrechnet'])) {
        $rapporte = $supabase->select('rapport', ['auftragid' => $id]);
        if (!empty($rapporte)) {
            $rapportData = $rapporte[0];
        }
    }
    
    // Verrechnung laden
    $verrechnungData = null;
    if ($auftrag['status'] === 'verrechnet') {
        $verrechnungen = $supabase->select('verrechnung', ['auftragid' => $id]);
        if (!empty($verrechnungen)) {
            $verrechnungData = $verrechnungen[0];
        }
    }
    
    // Response zusammenstellen
    $result = [
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
        'aktualisiertAm' => $auftrag['aktualisiertam'],
        'mitarbeiterName' => $mitarbeiterName,
        'erstelltVonName' => $erstellerName,
    ];
    
    // Rapport-Daten hinzufügen
    if ($rapportData) {
        $result['rapportId'] = $rapportData['rapportid'];
        $result['ausfuehrungsdatum'] = $rapportData['ausfuehrungsdatum'];
        $result['arbeitszeitVon'] = $rapportData['arbeitszeitvon'];
        $result['arbeitszeitBis'] = $rapportData['arbeitszeitbis'];
        $result['arbeitsstunden'] = $rapportData['arbeitsstunden'];
        $result['verwendetesMaterial'] = $rapportData['verwendetesmaterial'];
        $result['rapportBemerkungen'] = $rapportData['bemerkungen'];
    }
    
    // Verrechnungs-Daten hinzufügen
    if ($verrechnungData) {
        $result['rechnungsnummer'] = $verrechnungData['rechnungsnummer'];
        $result['betrag'] = $verrechnungData['betrag'];
        $result['rechnungsdatum'] = $verrechnungData['rechnungsdatum'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $result
    ]);
    
} catch (Exception $e) {
    error_log("Get Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Serverfehler']);
}
?>
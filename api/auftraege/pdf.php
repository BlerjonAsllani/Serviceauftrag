<?php
session_start();
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    die('Nicht authentifiziert');
}

$auftragId = $_GET['id'] ?? null;

if (!$auftragId) {
    http_response_code(400);
    die('Auftrags-ID fehlt');
}

require_once __DIR__ . '/../config/supabase.php';
require_once __DIR__ . '/../classes/AuftragsblattPDF.php';

try {
    $supabase = new Supabase();
    
    // Auftrag laden mit JOINs
    $auftraege = $supabase->select('auftrag', ['auftragid' => $auftragId]);
    
    if (empty($auftraege)) {
        http_response_code(404);
        die('Auftrag nicht gefunden');
    }
    
    $auftrag = $auftraege[0];
    
    // Mitarbeiter-Name laden falls zugewiesen
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
    
    // Rapport laden falls vorhanden
    $rapport = null;
    if (in_array($auftrag['status'], ['ausgeführt', 'freigegeben', 'verrechnet'])) {
        $rapporte = $supabase->select('rapport', ['auftragid' => $auftragId]);
        if (!empty($rapporte)) {
            $rapport = $rapporte[0];
        }
    }
    
    // Verrechnung laden falls vorhanden
    $verrechnung = null;
    if ($auftrag['status'] === 'verrechnet') {
        $verrechnungen = $supabase->select('verrechnung', ['auftragid' => $auftragId]);
        if (!empty($verrechnungen)) {
            $verrechnung = $verrechnungen[0];
        }
    }
    
    // Daten für PDF vorbereiten
    $auftragData = [
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
        'erstelltAm' => $auftrag['erstelltam'],
        'mitarbeiterName' => $mitarbeiterName,
        'erstelltVonName' => $erstellerName,
        'rapport' => $rapport,
        'verrechnung' => $verrechnung
    ];
    
    // PDF erstellen
    $pdf = new AuftragsblattPDF();
    $pdf->createAuftragsblatt($auftragData);
    
} catch (Exception $e) {
    error_log("PDF Error: " . $e->getMessage());
    http_response_code(500);
    die('Fehler beim Erstellen des PDFs: ' . $e->getMessage());
}
?>
<?php
require_once __DIR__ . '/../../vendor/autoload.php';

class AuftragsblattPDF extends TCPDF {
    
    public function Header() {
        $this->SetFont('helvetica', 'B', 16);
        $this->Cell(0, 10, 'Glauser AG - Serviceauftrag', 0, 1, 'C');
        $this->SetFont('helvetica', '', 10);
        $this->Cell(0, 5, 'Sanitär & Heizung', 0, 1, 'C');
        $this->Ln(5);
    }
    
    public function Footer() {
        $this->SetY(-15);
        $this->SetFont('helvetica', 'I', 8);
        $this->Cell(0, 10, 'Seite ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, 0, 'C');
    }
    
    public function createAuftragsblatt($data) {
        $this->SetCreator('Glauser AG Serviceauftragsverwaltung');
        $this->SetAuthor('Glauser AG');
        $this->SetTitle('Auftrag ' . $data['auftragsnummer']);
        
        $this->AddPage();
        $this->SetFont('helvetica', '', 10);
        
        // Auftragsnummer & Status
        $this->SetFont('helvetica', 'B', 14);
        $this->Cell(0, 8, 'Auftrag: ' . $data['auftragsnummer'], 0, 1);
        $this->SetFont('helvetica', '', 10);
        $this->Cell(0, 6, 'Status: ' . strtoupper($data['status']), 0, 1);
        $this->Cell(0, 6, 'Erstellt am: ' . date('d.m.Y H:i', strtotime($data['erstelltAm'])), 0, 1);
        if ($data['erstelltVonName']) {
            $this->Cell(0, 6, 'Erfasst von: ' . $data['erstelltVonName'], 0, 1);
        }
        $this->Ln(5);
        
        // Kundendaten
        $this->SetFillColor(240, 240, 240);
        $this->SetFont('helvetica', 'B', 11);
        $this->Cell(0, 7, 'Kundendaten', 0, 1, 'L', true);
        $this->SetFont('helvetica', '', 10);
        $this->Ln(2);
        
        $this->Cell(45, 6, 'Name/Firma:', 0, 0);
        $this->SetFont('helvetica', 'B', 10);
        $this->Cell(0, 6, $data['kundeName'], 0, 1);
        $this->SetFont('helvetica', '', 10);
        
        $this->Cell(45, 6, 'Adresse:', 0, 0);
        $this->Cell(0, 6, $data['kundeStrasse'], 0, 1);
        
        $this->Cell(45, 6, '', 0, 0);
        $this->Cell(0, 6, $data['kundePlz'] . ' ' . $data['kundeOrt'], 0, 1);
        
        $this->Cell(45, 6, 'Telefon:', 0, 0);
        $this->Cell(0, 6, $data['kundeTelefon'], 0, 1);
        
        if ($data['kundeEmail']) {
            $this->Cell(45, 6, 'E-Mail:', 0, 0);
            $this->Cell(0, 6, $data['kundeEmail'], 0, 1);
        }
        $this->Ln(5);
        
        // Auftragsdaten
        $this->SetFont('helvetica', 'B', 11);
        $this->Cell(0, 7, 'Auftragsbeschreibung', 0, 1, 'L', true);
        $this->SetFont('helvetica', '', 10);
        $this->Ln(2);
        
        $this->MultiCell(0, 5, $data['beschreibung'], 0, 'L');
        $this->Ln(3);
        
        $this->Cell(45, 6, 'Priorität:', 0, 0);
        $this->SetFont('helvetica', 'B', 10);
        $this->Cell(0, 6, strtoupper($data['prioritaet']), 0, 1);
        $this->SetFont('helvetica', '', 10);
        
        if ($data['gewuenschterTermin']) {
            $this->Cell(45, 6, 'Gewünschter Termin:', 0, 0);
            $this->Cell(0, 6, date('d.m.Y', strtotime($data['gewuenschterTermin'])), 0, 1);
        }
        
        if ($data['geplantesDatum']) {
            $this->Cell(45, 6, 'Geplantes Datum:', 0, 0);
            $this->SetFont('helvetica', 'B', 10);
            $this->Cell(0, 6, date('d.m.Y', strtotime($data['geplantesDatum'])), 0, 1);
            $this->SetFont('helvetica', '', 10);
        }
        
        if ($data['mitarbeiterName']) {
            $this->Cell(45, 6, 'Zugewiesen an:', 0, 0);
            $this->SetFont('helvetica', 'B', 10);
            $this->Cell(0, 6, $data['mitarbeiterName'], 0, 1);
            $this->SetFont('helvetica', '', 10);
        }
        
        if ($data['interneNotizen']) {
            $this->Ln(3);
            $this->SetFont('helvetica', 'I', 9);
            $this->Cell(0, 5, 'Interne Notizen:', 0, 1);
            $this->MultiCell(0, 5, $data['interneNotizen'], 0, 'L');
            $this->SetFont('helvetica', '', 10);
        }
        
        // Rapport
        if ($data['rapport']) {
            $this->Ln(5);
            $this->SetFont('helvetica', 'B', 11);
            $this->Cell(0, 7, 'Arbeitsrapport', 0, 1, 'L', true);
            $this->SetFont('helvetica', '', 10);
            $this->Ln(2);
            
            $rapport = $data['rapport'];
            $this->Cell(45, 6, 'Ausführungsdatum:', 0, 0);
            $this->Cell(0, 6, date('d.m.Y', strtotime($rapport['ausfuehrungsdatum'])), 0, 1);
            
            if ($rapport['arbeitszeitvon'] && $rapport['arbeitszeitbis']) {
                $this->Cell(45, 6, 'Arbeitszeit:', 0, 0);
                $this->Cell(0, 6, substr($rapport['arbeitszeitvon'], 0, 5) . ' - ' . substr($rapport['arbeitszeitbis'], 0, 5) . ' Uhr', 0, 1);
            } elseif ($rapport['arbeitsstunden']) {
                $this->Cell(45, 6, 'Arbeitsstunden:', 0, 0);
                $this->Cell(0, 6, $rapport['arbeitsstunden'] . ' Stunden', 0, 1);
            }
            
            if ($rapport['verwendetesmaterial']) {
                $this->Ln(2);
                $this->Cell(0, 5, 'Verwendetes Material:', 0, 1);
                $this->MultiCell(0, 5, $rapport['verwendetesmaterial'], 0, 'L');
            }
            
            $this->Ln(2);
            $this->Cell(0, 5, 'Bemerkungen:', 0, 1);
            $this->MultiCell(0, 5, $rapport['bemerkungen'], 0, 'L');
        }
        
        // Verrechnung
        if ($data['verrechnung']) {
            $this->Ln(5);
            $this->SetFont('helvetica', 'B', 11);
            $this->Cell(0, 7, 'Verrechnung', 0, 1, 'L', true);
            $this->SetFont('helvetica', '', 10);
            $this->Ln(2);
            
            $verr = $data['verrechnung'];
            $this->Cell(45, 6, 'Rechnungsnummer:', 0, 0);
            $this->SetFont('helvetica', 'B', 10);
            $this->Cell(0, 6, $verr['rechnungsnummer'], 0, 1);
            $this->SetFont('helvetica', '', 10);
            
            $this->Cell(45, 6, 'Betrag:', 0, 0);
            $this->SetFont('helvetica', 'B', 11);
            $this->Cell(0, 6, 'CHF ' . number_format($verr['betrag'], 2, '.', '\''), 0, 1);
            $this->SetFont('helvetica', '', 10);
            
            $this->Cell(45, 6, 'Rechnungsdatum:', 0, 0);
            $this->Cell(0, 6, date('d.m.Y', strtotime($verr['rechnungsdatum'])), 0, 1);
        }
        
        // Ausgabe
        $filename = 'Auftrag_' . $data['auftragsnummer'] . '.pdf';
        $this->Output($filename, 'D');
    }
}
?>
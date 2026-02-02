<?php
class Supabase {
    private $url = "https://lulwlerveoeyqawgcxeb.supabase.co";
    private $key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bHdsZXJ2ZW9leXFhd2djeGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4OTkwNzgsImV4cCI6MjA4NTQ3NTA3OH0.eO5N_BHXPyXCGtI8YnNKZh5xsqoL9zSEzC6j6aeNtV0";
    
    public function query($method, $table, $params = [], $body = null) {
        $url = $this->url . '/rest/v1/' . $table;
        
        // Query-Parameter
        if (!empty($params)) {
            $queryString = [];
            foreach ($params as $key => $value) {
                if ($key === 'select') {
                    $queryString[] = 'select=' . $value;
                } else {
                    $queryString[] = $key . '=eq.' . urlencode($value);
                }
            }
            $url .= '?' . implode('&', $queryString);
        }
        
        $headers = [
            'apikey: ' . $this->key,
            'Authorization: Bearer ' . $this->key,
            'Content-Type: application/json',
            'Prefer: return=representation'
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            error_log("Supabase Error [$httpCode]: " . $response);
            throw new Exception("API Error: " . $response);
        }
        
        return json_decode($response, true);
    }
    
    public function select($table, $filters = [], $select = '*') {
        $params = array_merge(['select' => $select], $filters);
        return $this->query('GET', $table, $params);
    }
    
    public function insert($table, $data) {
        return $this->query('POST', $table, [], $data);
    }
    
    public function update($table, $filters, $data) {
        return $this->query('PATCH', $table, $filters, $data);
    }
    
    public function delete($table, $filters) {
        return $this->query('DELETE', $table, $filters);
    }
}
?>
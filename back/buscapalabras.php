<?php
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Origin: *");
header('content-type: application/json; charset=utf-8');
try {
    if (isset($_POST['cargar'])) {
        $bd = 'sqlite:palabras.db';
        $pdo = new PDO($bd);
        $query = $pdo->query("SELECT palabra FROM palabras ORDER BY palabra ASC");
        $array = $query->fetchAll(PDO::FETCH_COLUMN, 0);
        echo(json_encode($array, JSON_UNESCAPED_UNICODE));
    }
} catch (\Throwable $th) {
    throw $th;
}
<?php
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Allow: GET, POST, OPTIONS, PUT, DELETE");
if (isset($_POST['cargar'])) {
    $bd = 'sqlite:../../wordzee/back/palabras.db';
    $pdo = new PDO($bd);
    $query = $pdo->query("SELECT palabra FROM palabras");
    $array = $query->fetchAll(PDO::FETCH_COLUMN, 0);
    echo(json_encode($array, JSON_UNESCAPED_UNICODE));
}
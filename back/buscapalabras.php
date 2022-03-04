<?php
header('Access-Control-Allow-Origin: *');
if (isset($_POST['cargar'])) {
    $bd = 'sqlite:palabras.db';
    $pdo = new PDO($bd);
    $query = $pdo->query("SELECT palabra FROM palabras");
    $array = $query->fetchAll(PDO::FETCH_COLUMN, 0);
    echo(json_encode($array, JSON_UNESCAPED_UNICODE));
}
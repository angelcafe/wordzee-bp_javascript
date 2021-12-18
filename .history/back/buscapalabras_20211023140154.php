<?php
class BuscaPalabras
{
    private $aPuntosExtra = array();
    private $aLetrasDisponibles = array();
    private $aPalabrasResultantes = array();
    private $aPuntosResultantes = array();
    private $aPalabrasTodas = array();
    private $aPalabrasTodasSugeridas = array();
    private $aPalabrasSugeridas = array();
    private $aPuntos = array('A' => 1, 'B' => 3, 'C' => 3, 'D' => 2, 'E' => 1, 'F' => 4, 'G' => 2, 'H' => 4, 'I' => 1, 'J' => 8, 'L' => 1, 'M' => 3, 'N' => 1, 'Ñ' => 8, 'O' => 1, 'P' => 3, 'Q' => 5, 'R' => 1, 'S' => 1, 'T' => 1, 'U' => 1, 'V' => 4, 'X' => 8, 'Y' => 4, 'Z' => 10);
    private $oBd;
    private $ronda = 1;
    private $bd;
    private const DIC = 'back/sp.json';

    public function __construct()
    {
        $this->insertAvailableLetters();
        $this->insertExtraPoints();
        if (!empty($_POST)) {
            if (file_exists('../wordzee/back/palabras.db')) {
                $this->bd = 'sqlite:../wordzee/back/palabras.db';
            } else {
                $this->bd = 'sqlite:../../wordzee/back/palabras.db';
            }
            if (!isset($_POST['borrar']) && !isset($_POST['guardar']) && !isset($_POST['exportar']) && empty($_FILES)) {
                $this->insertRonda();
                $this->insertResultWords();
                $this->palabrasSugeridas();
            }
        }
    }

    public function getAvailableLetters()
    {
        return $this->aLetrasDisponibles;
    }

    public function getExtraPoints()
    {
        return $this->aPuntosExtra;
    }

    public function getPalabrasSugeridas()
    {
        return $this->aPalabrasSugeridas;
    }

    public function getResultPoints()
    {
        return $this->aPuntosResultantes;
    }

    public function getResultWords()
    {
        return $this->aPalabrasResultantes;
    }

    private function getWords()
    {
        return json_encode($this->aPalabrasTodas, JSON_UNESCAPED_UNICODE);;
    }

    public function setResultPoints()
    {
        for ($x = 0; $x < 5; $x++) {
            if (!isset($this->aPalabrasResultantes[$x])) {
                $this->aPalabrasResultantes[$x] = array();
                $this->aPuntosResultantes[$x] = array();
                continue;
            }
            $b = count($this->aPalabrasResultantes[$x]);
            for ($y = 0; $y < $b; $y++) {
                $iDoblePalabra = 1;
                $iTriplePalabra = 1;
                $total = 0;
                $aLetrasPalabra = mb_str_split($this->aPalabrasResultantes[$x][$y]);
                foreach ($aLetrasPalabra as $key => $value) {
                    $iDobleLetra = 1;
                    $iTripleLetra = 1;
                    if (!empty($this->aPuntosExtra)) {
                        switch ($this->aPuntosExtra[count($aLetrasPalabra) - 3][$key]) {
                            case 'DL':
                                $iDobleLetra = 2;
                                break;
                            case 'TL':
                                $iTripleLetra = 3;
                                break;
                            default:
                                break;
                        }
                    }
                    $total += intval($this->aPuntos[$value] * $this->ronda * $iDobleLetra * $iTripleLetra);
                }
                if (!empty($this->aPuntosExtra) && in_array('DP', $this->aPuntosExtra[count($aLetrasPalabra) - 3])) {
                    $iDoblePalabra = 2;
                } elseif (!empty($this->aPuntosExtra) && in_array('TP', $this->aPuntosExtra[count($aLetrasPalabra) - 3])) {
                    $iTriplePalabra = 3;
                }
                $this->aPuntosResultantes[$x][$y] = $total * $iDoblePalabra * $iTriplePalabra;
            }
        }
    }

    public function setResultWords()
    {
        if (!empty($this->aLetrasDisponibles)) {
            foreach ($this->aPalabrasTodas as $palabraDiccionario) {
                $palabraDiccionario = mb_strtoupper($palabraDiccionario);
                $aLetrasPalabra = mb_str_split($palabraDiccionario);
                $sLetrasDisponibles = implode($this->aLetrasDisponibles);
                $a = mb_strlen($palabraDiccionario) - 3;
                foreach ($aLetrasPalabra as $value) {
                    if (!in_array($value, $this->aLetrasDisponibles) || substr_count($sLetrasDisponibles, $value) < substr_count($palabraDiccionario, $value)) {
                        continue 2;
                    }
                }
                $this->aPalabrasResultantes[$a][] = $palabraDiccionario;
            }
        }
    }

    private function data()
    {
        $this->oBd = new PDO($this->bd);
        $this->oBd->exec('CREATE TABLE IF NOT EXISTS palabras (palabra STRING PRIMARY KEY)');
        $this->oBd->sqliteCreateFunction('regexp_like', 'preg_match', 2);
    }

    public function deleteWord(string $palabra)
    {
        if (empty($this->oBd)) {
            $this->data();
        }
        $palabra = mb_strtoupper(filter_var($palabra, FILTER_SANITIZE_STRING));
        $this->oBd->exec("DELETE FROM palabras WHERE palabra = '$palabra'");
    }

    public function exportWords()
    {
        if (empty($this->oBd)) {
            $this->data();
        }
        $array = $this->oBd->query('SELECT palabra FROM palabras ORDER BY palabra ASC');
        $palabras = $array->fetchAll(PDO::FETCH_COLUMN, 0);
        $palabrasJson = json_encode($palabras, JSON_UNESCAPED_UNICODE);
        $fp = fopen(self::DIC, 'w');
        fwrite($fp, $palabrasJson);
        fclose($fp);
        return $palabrasJson;
    }

    public function importWords()
    {
        $palabras = file_get_contents(self::DIC);
        $palabras = json_decode($palabras, false, 1024000000);
        $this->insertWords($palabras);
    }

    private function insertAvailableLetters()
    {
        for ($i = 0; $i < 7; $i++) {
            $tmp = 'letra' . ($i + 1);
            if (isset($_POST[$tmp])) {
                $aLetrasDisponibles[$i] = mb_strtoupper(filter_var($_POST[$tmp], FILTER_SANITIZE_STRING));
            } else {
                $aLetrasDisponibles[$i] = '';
            }
        }
        $this->aLetrasDisponibles = $aLetrasDisponibles;
    }

    private function insertExtraPoints()
    {
        for ($x = 0; $x < 5; $x++) {
            for ($y = 0; $y < 3 + $x; $y++) {
                $tmp = 'pal' . ($x + 3) . 'let' . ($y + 1);
                if (isset($_POST[$tmp])) {
                    $aPuntosExtra[$x][$y] = filter_var($_POST[$tmp], FILTER_SANITIZE_STRING);
                } else {
                    $aPuntosExtra[$x][$y] = '';
                }
            }
        }
        $this->aPuntosExtra = $aPuntosExtra;
    }

    /**
     * Crear las palabras resultantes
     *
     * @return void
     */
    private function insertResultWords()
    {
        $this->readWords();
        $this->setResultWords();
        $this->setResultPoints();
        $this->orderWords();
    }

    private function insertRonda()
    {
        if (isset($_POST['ronda'])) {
            $this->ronda = intval(filter_var($_POST['ronda'], FILTER_SANITIZE_NUMBER_INT));
        }
    }

    public function insertWords(array $palabrasTodas)
    {
        $palabrasTodas = array_unique($palabrasTodas);
        $palabras = array_filter($palabrasTodas, function ($palabra) {
            if (mb_strlen($palabra) > 7 || mb_strlen($palabra) < 3 || mb_stripos($palabra, 'K') !== false || mb_stripos($palabra, 'W') !== false) {
                return false;
            }
            return true;
        });
        if (!empty($palabras)) {
            if (empty($this->oBd)) {
                $this->data();
            }
            $sen = $this->oBd->prepare('INSERT OR IGNORE INTO palabras (palabra) VALUES (?)');
            $this->oBd->beginTransaction();
            foreach ($palabras as $value) {
                $sen->execute([mb_strtoupper($value)]);
            }
            $this->oBd->commit();
        }
    }

    private function orderWords()
    {
        for ($i = 0; $i < 5; $i++) {
            if (!isset($this->aPuntosResultantes[$i])) continue;
            uasort($this->aPuntosResultantes[$i], function ($a, $b) {
                if ($a == $b) {
                    return 0;
                }
                return ($a < $b) ? -1 : 1;
            });
            arsort($this->aPuntosResultantes[$i]);
            $keys = array_keys($this->aPuntosResultantes[$i]);
            $values = array_values($this->aPalabrasResultantes[$i]);
            foreach ($keys as $key => $value) {
                $this->aPalabrasResultantes[$i][$key] = $values[$value];
            }
            rsort($this->aPuntosResultantes[$i]);
        }
    }

    private function readWords()
    {
        if (empty($this->oBd)) {
            $this->data();
        }
        $aLetras = implode('', array_unique($this->aLetrasDisponibles));
        $array = $this->oBd->query("SELECT palabra FROM palabras WHERE regexp_like('/^[$aLetras]+$/', palabra)");
        $this->aPalabrasTodas = $array->fetchAll(PDO::FETCH_COLUMN, 0);
        $array = $this->oBd->query("SELECT palabra FROM palabras WHERE palabra LIKE '%Z%'");
        $this->aPalabrasTodasSugeridas = $array->fetchAll(PDO::FETCH_COLUMN, 0);
    }

    public function palabrasSugeridas()
    {
        for ($x=0; $x < 5; $x++) { 
            $palabras[$x] = array_filter($this->aPalabrasTodasSugeridas, function($a) use ($x) { return mb_strlen($a) === $x + 3; });
            foreach ($palabras[$x] as $clave => $val) {
                $iDoblePalabra = 1;
                $iTriplePalabra = 1;
                $total = 0;
                $aLetrasPalabra = mb_str_split($val);
                foreach ($aLetrasPalabra as $key => $value) {
                    $iDobleLetra = 1;
                    $iTripleLetra = 1;
                    if (!empty($this->aPuntosExtra)) {
                        switch ($this->aPuntosExtra[count($aLetrasPalabra) - 3][$key]) {
                            case 'DL':
                                $iDobleLetra = 2;
                                break;
                            case 'TL':
                                $iTripleLetra = 3;
                                break;
                            default:
                                break;
                        }
                    }
                    $total += intval($this->aPuntos[$value] * $this->ronda * $iDobleLetra * $iTripleLetra);
                }
                if (!empty($this->aPuntosExtra) && in_array('DP', $this->aPuntosExtra[count($aLetrasPalabra) - 3])) {
                    $iDoblePalabra = 2;
                } elseif (!empty($this->aPuntosExtra) && in_array('TP', $this->aPuntosExtra[count($aLetrasPalabra) - 3])) {
                    $iTriplePalabra = 3;
                }
                $puntos[$x][$clave] = $total * $iDoblePalabra * $iTriplePalabra;
            }
        }

        for ($x=0; $x < 5; $x++) { 
            $tmp[1] = array_filter($puntos[$x], function($a) use ($puntos, $x) { return array_key_exists($a, $puntos[$x]); }, ARRAY_FILTER_USE_KEY);
            $maxpal = array_keys($tmp[1], max($tmp[1]));
            foreach ($maxpal as $key) {
                $this->aPalabrasSugeridas[0][$x][] = $palabras[$x][$key];
                $this->aPalabrasSugeridas[1][$x][] = $puntos[$x][$key];
            }
        }
    }

    /**
     * 
     */

    private function proteccion()
    {
        session_start();
        if (isset($_SESSION['cache'])) {
            if (time() - $_SESSION['cache'] < 2) {
                echo ('No se permite hacer flood.');
                exit();
            } else {
                $_SESSION['cache'] = time();
            }
        } else {
            $_SESSION['cache'] = time();
        }
    }
}
/**
 * Código extra para admin
 */
if (isset($_POST['cargar'])) {
    $bd = 'sqlite:../../wordzee/back/palabras.db';
    $pdo = new PDO($bd);
    $array = $pdo->query("SELECT palabra FROM palabras WHERE palabra");
    echo(json_encode($array->fetchAll(PDO::FETCH_COLUMN, 0)));
} elseif (isset($_POST['borrar'])) {
    $p = new BuscaPalabras();
    $p->deleteWord($_POST['borrar']);
} elseif (isset($_POST['guardar'])) {
    $p = new BuscaPalabras();
    $p->insertWords(explode(',', $_POST['guardar']));
} elseif (isset($_POST['exportar'])) {
    $p = new BuscaPalabras();
    echo ($p->exportWords());
}
if (!empty($_FILES)) {
    $p = new BuscaPalabras();
    move_uploaded_file($_FILES['archivo']['tmp_name'], getcwd() . DIRECTORY_SEPARATOR . 'sp.json');
    $p->importWords();
}

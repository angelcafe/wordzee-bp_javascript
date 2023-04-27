let puntosExtra = new Array();
let letrasDisponibles = new Array();
let ronda;
let vPalabras = new Object();
let palabrasSugeridas = new Array();
const puntos = { A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, L: 1, M: 3, N: 1, Ñ: 8, O: 1, P: 3, Q: 5, R: 1, S: 1, T: 1, U: 1, V: 4, X: 8, Y: 4, Z: 10 };

(function () {
    'use strict';

    if (!window.localStorage)
        window.alert("Su navegador es incompatilbe con esta aplicación. Utilice un navegador éstandar.");
    if ('serviceWorker' in navigator)
        // navigator.serviceWorker.register('./sw.js');
        cargarPalabras();
    inicio();
})();

function ajax() {
    const reqHeader = new Headers();
    reqHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    const initObject = {
        method: 'POST', headers: reqHeader, body: 'cargar=todo', cache: 'no-cache'
    };
    const userRequest = new Request('back/buscapalabras.php', initObject);
    fetch(userRequest)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw "Respuesta incorrecta del servidor";
            }
        })
        .then(function (data) {
            cargarPalabras(JSON.stringify(data));
        })
        .catch(function (err) {
            console.log(err);
        });
}

function alerta(message, type) {
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
    alertPlaceholder.append(wrapper);
}

function buscarPalabras() {
    if (Array.from(document.querySelectorAll('input[required]')).every(e => e.value != '')) {
        const form = document.forms[0];
        fPuntosExtra(form);
        fLetrasDisponibles(form);
        fRonda(form);
        fPalabrasValor();
        fPalabrasEncontradas();
        document.querySelectorAll("td.palenc").forEach(e => e.addEventListener("click", copiarEncontradaDisponibles));
        if (document.querySelector('.alert')) {
            const alert = bootstrap.Alert.getOrCreateInstance('#liveAlertPlaceholder');
            alert.close();
        }
    } else {
        if (!document.querySelector('.alert')) {
            alerta('Hay que rellenar todas las Letras disponibles', 'danger');
        }
    }
}

function cambiarValorBotones(e) {
    const element = e.srcElement;
    switch (element.value) {
        case '':
            element.value = 'DL';
            element.className = 'btn btn-secondary rosa';
            break;
        case 'DL':
            element.value = 'TL';
            element.className = 'btn btn-secondary bg-success';
            break;
        case 'TL':
            element.value = '';
            element.className = 'btn btn-secondary info';
            break;
        default:
            break;
    }
}

function cargarPalabras(datos = null) {
    if (datos) {
        localStorage.removeItem('palabras');
        localStorage.setItem('palabras', datos);
    } else {
        datos = localStorage.getItem('palabras');
        if (!datos) {
            ajax();
            return;
        }
    }
    palabrasCargadas(JSON.parse(datos));
}

function copiarEncontradaDisponibles(e) {
    const palabra = e.target.innerText.split(' ')[0];
    if (palabra.length > 0) {
        document.querySelectorAll('#letras input').forEach((e, i) => e.value = palabra[i] || '');
        document.getElementById('letras').scrollIntoView();
    }
}

function inicio() {
    document.getElementsByName("pal6let6")[0].value = "DP";
    document.getElementsByName("pal6let6")[0].className = 'btn btn-secondary bg-primary';
    document.getElementsByName("pal7let7")[0].value = "TP";
    document.getElementsByName("pal7let7")[0].className = 'btn btn-secondary bg-danger';
    document.querySelectorAll('#idPuntosExtra input').forEach(element => element.addEventListener("click", cambiarValorBotones));
    document.querySelectorAll("#letras > input").forEach(element => {
        element.addEventListener("keyup", e => fLetrasInput(e, element));
        element.addEventListener("click", e => e.currentTarget.select());
    });
}

function fLetrasDisponibles(form) {
    let contador = 25;
    for (let x = 0; x < 7; x++) {
        letrasDisponibles[x] = form[contador].value.toUpperCase();
        contador++;
    }
}

function fLetrasInput(e, element) {
    const texto = /^[a-jl-vx-zA-JL-VX-ZñÑ]$/;
    if (texto.test(element.value) === true) {
        if (e.currentTarget.nextElementSibling) {
            e.currentTarget.nextElementSibling.focus();
            e.currentTarget.nextElementSibling.select();
        }
    } else {
        e.currentTarget.value = '';
    }
}

function palabrasCargadas(dat) {
    vPalabras = dat.map(function (palabra) {
        return { nombre: palabra, longitud: palabra.length };
    });
}

function fPalabrasEncontradas() {
    const cadenaLetrasDisponibles = letrasDisponibles.join('');
    let vPalabrasEncontradas = vPalabras.filter(function (obj) {
        let letrasPalabra = obj.nombre.split('');
        for (let y = 0; y < letrasPalabra.length; y++) {
            if (letrasDisponibles.includes(letrasPalabra[y]) === false ||
                (obj.nombre.split(letrasPalabra[y]).length > cadenaLetrasDisponibles.split(letrasPalabra[y]).length)) {
                return false;
            }
        }
        return true;
    });

    fPalabrasMostrar(vPalabrasEncontradas, 'idPalabrasEncontradas', 'palenc noselect');
}

function fPalabrasMostrar(palabras, id, clase) {
    let palabrasEncontradas = new Array();
    let puntosEncontrados = new Array();

    palabras.forEach(function (palabra) {
        try {
            palabrasEncontradas[palabra.longitud].push(palabra.nombre);
            puntosEncontrados[palabra.longitud].push(palabra.puntos);
        } catch (error) {
            palabrasEncontradas[palabra.longitud] = new Array();
            puntosEncontrados[palabra.longitud] = new Array();
            palabrasEncontradas[palabra.longitud].push(palabra.nombre);
            puntosEncontrados[palabra.longitud].push(palabra.puntos);
        }
    });

    const destino = document.getElementById(id);
    while (destino.firstChild) {
        destino.removeChild(destino.firstChild);
    }

    let txt;
    for (let y = 0; y < 10; y++) {
        let tr = document.createElement("tr");
        for (let x = 3; x < 8; x++) {
            let td = document.createElement("td");
            if (Array.isArray(palabrasEncontradas[x]) && palabrasEncontradas[x][y]) {
                td.className = clase;
                txt = document.createTextNode(palabrasEncontradas[x][y] + ' - ' + puntosEncontrados[x][y]);
                td.appendChild(txt);
            }
            tr.appendChild(td);
        }
        destino.appendChild(tr);
    }
}

function fPalabrasValor() {
    vPalabras.map(function (obj) {
        let letrasPalabra = obj.nombre.split('');
        let total = 0;
        for (let y = 0; y < letrasPalabra.length; y++) {
            let valor = puntos[letrasPalabra[y]] * puntosExtra[obj.longitud][y] * ronda;
            if (obj.longitud === 6) {
                valor *= 2;
            } else if (obj.longitud === 7) {
                valor *= 3;
            }
            total += valor;
        }
        obj.puntos = total;
    });
    const palabras_ordenadas = newObject(vPalabras).sort(function (a, b) {
        if (a.puntos < b.puntos) {
            return 1;
        } else if (a.puntos > b.puntos) {
            return -1;
        } else {
            return 0;
        }
    });

    vPalabras = palabras_ordenadas;

    fPalabrasMostrar(vPalabras, 'idPalabrasGanadoras', 'noselect');
}

function fPuntosExtra(form) {
    let contador = 0;
    let valor;
    for (let x = 3; x < 8; x++) {
        puntosExtra[x] = new Array();
        for (let y = 0; y < x; y++) {
            if (form[contador].value === 'DL') {
                valor = 2;
            } else if (form[contador].value === 'TL') {
                valor = 3;
            } else {
                valor = 1;
            }
            puntosExtra[x][y] = valor;
            contador++;
        }
    }
}

function restablecer() {
    window.location.href = window.location.href;
}

function fRonda(form) {
    let contador = 32;
    for (let x = 0; x < 5; x++) {
        if (form[contador].checked) {
            ronda = contador - 31;
            break;
        }
        contador++;
    }
}

function newObject(obj) {
    let newObj = JSON.stringify(obj);
    return JSON.parse(newObj);
}
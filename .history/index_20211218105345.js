var puntosExtra = new Array();
var letrasDisponibles = new Array();
var ronda;
var vPalabras = new Array();
var palabrasSugeridas = new Array();
var puntos = new Array();
puntos = { A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, L: 1, M: 3, N: 1, Ñ: 8, O: 1, P: 3, Q: 5, R: 1, S: 1, T: 1, U: 1, V: 4, X: 8, Y: 4, Z: 10 };

(function () {
    'use strict'

    ajax('cargar=todo');
    inicio();
})()

function activarHerramientas(e) {
    const h = document.getElementsByClassName('herramientas')[0];
    if (e.currentTarget.checked) {
        h.style.display = 'block';
        localStorage.setItem('ActivarHerramientas', 'block');
    } else {
        h.style.display = 'none';
        localStorage.setItem('ActivarHerramientas', 'none');
    }
}

function ajax(enviar = null, alerta = false) {
    let reqHeader = new Headers();
    reqHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    let initObject = {
        method: 'POST', headers: reqHeader, body: enviar, cache: 'no-cache',
    };
    var userRequest = new Request('back/buscapalabras.php', initObject);
    fetch(userRequest)
        .then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                throw "Respuesta incorrecta del servidor";
            }
        })
        .then(function (data) {
            if (alerta) {
                alerta(alerta);
            } else if (enviar.indexOf('borrar') !== -1 || enviar.indexOf('guardar') !== -1) {
                document.getElementById('principal').submit();
            } else if (enviar.indexOf('cargar') !== -1) {
                palabrasCargadas(data);
            }
        })
        .catch(function (err) {
            console.log(err);
        });

}

function buscarPalabras() {
    if (Array.from(document.querySelectorAll('input[required]')).every(e => e.value == '')) {
        
    } else {
        
    }

    var form = document.forms[0];
    Array.from(document.querySelectorAll('input[required]')).every(e => {
        if (e.value == '') {
            var alertPlaceholder = document.getElementById('liveAlertPlaceholder');
            function alert(message, type) {
                var wrapper = document.createElement('div');
                wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                alertPlaceholder.append(wrapper);
            }
            alert('Hay que rellenar todas las Letras disponibles', 'danger');
            form = null;
            return false;
        } else {
            return true;
        }
    });
    if (form !== null) {
        fPuntosExtra(form);
        fLetrasDisponibles(form);
        fRonda(form);
        fPalabrasEncontradas();
    }
}

function cambiarClaseBotones(e) {
    switch (e.value) {
        case 'DL':
            e.className = 'btn rosa';
            break;
        case 'TL':
            e.className = 'btn btn-success';
            break;
        case 'DP':
            e.className = 'btn btn-primary';
            break;
        case 'TP':
            e.className = 'btn btn-danger';
            break;
        case '':
            e.className = 'btn btn-info';
            break;
        default:
            break;
    }
}

function cambiarValorBotones(e) {
    switch (e.srcElement.value) {
        case '':
            e.srcElement.value = 'DL';
            e.srcElement.className = 'btn rosa';
            break;
        case 'DL':
            e.srcElement.value = 'TL';
            e.srcElement.className = 'btn btn-success';
            break;
        case 'TL':
            e.srcElement.value = '';
            e.srcElement.className = 'btn btn-info';
            break;
        default:
            break;
    }
}

function inicio() {
    document.getElementsByName("pal6let6")[0].value = "DP";
    document.getElementsByName("pal7let7")[0].value = "TP";
    for (let x = 3; x < 8; x++) {
        for (let y = 1; y < (x + 1); y++) {
            document.getElementsByName("pal" + x + "let" + y)[0].addEventListener("click", cambiarValorBotones);
            cambiarClaseBotones(document.getElementsByName("pal" + x + "let" + y)[0]);
        }
    }
    if (localStorage.getItem('ActivarHerramientas')) {
        document.getElementsByClassName('herramientas')[0].style.display = localStorage.getItem('ActivarHerramientas');
        document.getElementById('idActivarHerramientas').checked = (localStorage.getItem('ActivarHerramientas').indexOf('none') < 0) ? (true) : (false);
    }
    document.getElementById('idActivarHerramientas').addEventListener("change", activarHerramientas);
    Array.from(document.getElementsByClassName("palenc")).forEach(element => {
        element.addEventListener("click", function (e) {
            let palabra = e.target.innerText.split(' ')[0];
            if (palabra.length > 0) {
                for (let x = 0; x < 7; x++) {
                    document.getElementsByName('letra' + (x + 1))[0].value = palabra[x];
                }
            }
        });
    });
    var texto = /^[a-jl-vx-zA-JL-VX-ZñÑ]$/;
    document.querySelectorAll("#letras > input").forEach(element => {
        element.addEventListener("keyup", e => {
            if (texto.test(element.value) === true) {
                if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.focus();
                    e.currentTarget.nextElementSibling.select();
                }
            } else {
                e.currentTarget.value = '';
            }
        });
        element.addEventListener("click", e => {
            e.currentTarget.select();
        });
    });
    document.getElementById('idBorrar').addEventListener('click', function () {
        palabras.borrar(document.getElementById('palabraBorrar').value);
    });
    document.getElementById('idGuardar').addEventListener("click", function () {
        ajax("guardar=" + document.getElementById('palabraGuardar').value);
    });
    document.onclick = function () {
        document.getElementById('menu').style.display = 'none';
    }
    document.oncontextmenu = function (e) {
        document.getElementById('menu').style.display = 'none';
        if (e.target.className.includes("menu")) {
            e.preventDefault();
            let menu = document.getElementById('menu');
            menu.style.left = e.pageX - 100 + 'px';
            menu.style.top = e.pageY + 'px';
            menu.style.display = 'block';
            let borrarPalabra = document.getElementById('idBorrarPalabra');
            borrarPalabra.innerText = e.target.innerText.split(' ')[0];
            borrarPalabra.addEventListener('click', function (e) {
                palabras.borrar(e.innerText);
            });
        }
    }
}

function fLetrasDisponibles(form) {
    let contador = 25;
    for (let x = 0; x < 7; x++) {
        letrasDisponibles[x] = form[contador].value.toUpperCase();
        contador++;
    }
}

function palabrasCargadas(dat) {
    dat.forEach(function (palabra) {
        vPalabras.push({ nombre: palabra, longitud: palabra.length });
    });
}

function fPalabrasEncontradas() {
    let palabrasEncontradas = new Array();
    let puntosEncontrados = new Array();
    let vPalabrasEncontradas = vPalabras.filter(function (obj) {
        let letrasPalabra = obj.nombre.split('');
        let total = 0;
        for (let y = 0; y < letrasPalabra.length; y++) {
            if (letrasDisponibles.indexOf(letrasPalabra[y]) === -1 || (obj.nombre.split(letrasPalabra[y]).length - 1 > letrasDisponibles.join('').split(letrasPalabra[y]).length - 1)) {
                return false;
            }
            let valor = puntos[letrasPalabra[y]] * puntosExtra[obj.longitud][y] * ronda;
            if (obj.longitud == 6) {
                valor *= 2;
            } else if (obj.longitud == 7) {
                valor *= 3;
            }
            total += valor;
        }
        obj.puntos = total;
        return true;
    });

    vPalabrasEncontradas.sort(function (a, b) {
        if (a.puntos < b.puntos) {
            return 1;
        }
        if (a.puntos > b.puntos) {
            return -1;
        }
        return 0;
    });

    vPalabrasEncontradas.forEach(function (palabra) {
        if (!Array.isArray(palabrasEncontradas[palabra.longitud]) || !Array.isArray(puntosEncontrados[palabra.longitud])) {
            palabrasEncontradas[palabra.longitud] = new Array();
            puntosEncontrados[palabra.longitud] = new Array();
        }
        palabrasEncontradas[palabra.longitud].push(palabra.nombre);
        puntosEncontrados[palabra.longitud].push(palabra.puntos);
    });

    const destino = document.getElementById("idPalabrasEncontradas");
    while (destino.firstChild) {
        destino.removeChild(destino.firstChild);
    }

    for (let y = 0; y < 10; y++) {
        let tr = document.createElement("tr");
        for (let x = 3; x < 8; x++) {
            let td = document.createElement("td");
            if (palabrasEncontradas[x][y]) {
                td.className = 'menu palenc noselect';
                let txt = document.createTextNode(palabrasEncontradas[x][y] + ' - ' + puntosEncontrados[x][y]);
                td.appendChild(txt);
            }
            tr.appendChild(td);
        }
        destino.appendChild(tr);
    }
}

function fPuntosExtra(form) {
    let contador = 0;
    let valor;
    for (let x = 3; x < 8; x++) {
        puntosExtra[x] = new Array();
        for (let y = 0; y < x; y++) {
            if (form[contador].value == 'DL') {
                valor = 2;
            } else if (form[contador].value == 'TL') {
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
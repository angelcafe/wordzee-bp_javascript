var ajax = function (enviar = null, alerta = false) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (x) {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                if (alerta) {
                    alerta(alerta);
                } else if (enviar.indexOf('borrar') !== -1 || enviar.indexOf('guardar') !== -1) {
                    document.getElementById('principal').submit();
                } else if (enviar.indexOf('cargar') !== -1) {
                    palabrasCargadas(xhr.response);
                }
            }
        }
    };
    xhr.open('POST', 'back/buscapalabras.php');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send(enviar);
};
/*
var palabras = {
    alerta: function () {
        let myModal = new bootstrap.Modal(document.getElementById('modalAlert'));
        document.querySelector('#modalAlert .modal-title').innerText = palabras.alertaTitulo;
        document.querySelector('#modalAlert .modal-body p').innerText = palabras.alertaTexto;
        myModal.show();
        if (palabras.alertaDescargar) {
            palabras.descargar();
        }
    },
    alertaDescargar: false,
    alertaTexto: '',
    alertaTitulo: '',
    ajax: function (alerta = false) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (x) {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (alerta) {
                        palabras.alerta();
                    } else if (palabras.ajaxEnviar.indexOf('borrar') !== -1 || palabras.ajaxEnviar.indexOf('guardar') !== -1) {
                        document.getElementById('principal').submit();
                    } else if (palabras.ajaxEnviar.indexOf('cargar') !== -1) {
                        palabrasCargadas(xhr.response);
                    }
                } else {
                    palabras.ajaxContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
                    palabras.ajaxEnviar = '';
                }
            }
        };
        xhr.open('POST', 'back/buscapalabras.php');
        xhr.setRequestHeader('Content-Type', palabras.ajaxContentType);
        xhr.send(palabras.ajaxEnviar);
    },
    ajaxContentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    ajaxEnviar: '',
    ajaxProcessData: true,
    borrar: function (palabra) {
        palabras.ajaxEnviar = 'borrar=' + palabra;
        palabras.ajax();
    },
    cargar: function (datos) {
        palabras.ajaxEnviar = 'cargar=' + datos;
        palabras.ajax();
    },
    descargar: function () {
        let blob = palabras.responde;
        let fileName = 'sp.json';
        let link = document.createElement('a');
        let binaryData = [];
        binaryData.push(blob);
        link.href = window.URL.createObjectURL(new Blob(binaryData, { type: "application/json" }));
        link.download = fileName;
        link.click();
    },
    exportar: function () {
        palabras.alertaTitulo = 'Exportar JSON';
        palabras.alertaTexto = 'Exportación finalizada.';
        palabras.alertaDescargar = true;
        palabras.ajaxEnviar = "exportar=" + true;
        palabras.ajax(true);
    },
    guardar: function () {
        let palabra = document.getElementById('palabraGuardar').value;
        palabras.ajaxEnviar = "guardar=" + palabra;
        palabras.ajax();
    },
    importar: function () {
        const file = document.getElementById('formFile').files[0];
        var formd = new FormData();
        formd.append('archivo', file);
        palabras.alertaTitulo = 'Importar JSON';
        palabras.alertaTexto = 'Importación finalizada.';
        palabras.alertaDescargar = false;
        palabras.ajaxContentType = false;
        palabras.ajaxProcessData = false;
        palabras.ajaxEnviar = formd;
        palabras.ajax(true);
        return false;
    },
};
*/
(function () {
    'use strict'

    inicio();
    ajax('cargar=todo');
})()

function activarHerramientas(e) {
    let h = document.getElementsByClassName('herramientas')[0];
    if (e.currentTarget.checked) {
        h.style.display = 'block';
        localStorage.setItem('ActivarHerramientas', 'block');
    } else {
        h.style.display = 'none';
        localStorage.setItem('ActivarHerramientas', 'none');
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
    document.querySelector("#pal6let6[value='']").value = "DP";
    document.querySelector("#pal7let7[value='']").value = "TP";
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
    document.getElementById('idGuardar').addEventListener("click", function() {
        ajax("guardar=" + document.getElementById('palabraGuardar').value);
    });
    document.onclick = function (e) {
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
            borrarPalabra.addEventListener('click', function(e) {
                palabras.borrar(e.innerText);
            });
        }
    }
}

function palabrasCargadas(dat) {
    let datos = JSON.parse(dat);
    let palabras = Array();
    for (let x = 3; x < 8; x++) {
        palabras[x] = datos.filter(function(d) {
            return d.length === x;
        });
    }
    console.log(palabras[7]);
}

function restablecer() {
    window.location.href = window.location.href;
}
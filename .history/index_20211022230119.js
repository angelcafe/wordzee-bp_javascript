(function () {
    'use strict'

    document.querySelector("#pal6let6[value='']").value = "DP";
    document.querySelector("#pal7let7[value='']").value = "TP";
    for (let x = 3; x < 8; x++) {
        for (let y = 1; y < (x + 1); y++) {
            document.getElementsByName("pal" + x + "let" + y)[0].addEventListener("click", cambiarValorBotones);
            cambiarClaseBotones(document.getElementsByName("pal" + x + "let" + y)[0]);
        }
    }
    Array.from(document.getElementsByClassName("palenc")).forEach(element => {
        element.addEventListener("click", function (e) {
            let palabra = e.target.innerText.split(' ')[0];
            for (let x = 0; x < 7; x++) {
                $('#idLetra' + (x + 1)).val(palabra[x]);
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
})()

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
        $.ajax({
            contentType: palabras.ajaxContentType,
            data: palabras.ajaxEnviar,
            processData: palabras.ajaxProcessData,
            type: palabras.ajaxMetodo,
            url: palabras.ajaxFichero,
            success: function (datos) {
                if (alerta) {
                    palabras.responde = datos;
                    palabras.alerta();
                }
                if (palabras.ajaxEnviar.borrar || palabras.ajaxEnviar.guardar) {
                    document.getElementById('principal').submit();
                }
            },
            complete: function () {
                palabras.ajaxContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
                palabras.ajaxEnviar = '';
                palabras.ajaxFichero = 'back/buscapalabras.php';
                palabras.ajaxMetodo = 'POST';
                palabras.ajaxProcessData = true;
            }
        });
    },
    ajaxContentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    ajaxEnviar: '',
    ajaxFichero: "back/buscapalabras.php",
    ajaxMetodo: "POST",
    ajaxProcessData: true,
    borrar: function (palabra) {
        palabras.ajaxEnviar = { "borrar": palabra };
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
        palabras.ajaxEnviar = { "exportar": true };
        palabras.ajax(true);
    },
    guardar: function () {
        let palabra = document.getElementById('palabraGuardar').value;
        palabras.ajaxEnviar = { "guardar": palabra };
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
    responde: '',
};
window.onload = function() {
    if (localStorage.getItem('ActivarHerramientas')) {
        document.getElementById('idHerramientas').className = localStorage.getItem('ActivarHerramientas');
        document.getElementById('idActivarHerramientas').checked = (localStorage.getItem('ActivarHerramientas').indexOf('d-none') < 0) ? (true) : (false);
    }
    document.getElementById('idActivarHerramientas').addEventListener("change", activarHerramientas);
    document.getElementById('idBorrar').addEventListener('click', function () {
        palabras.borrar($('#palabraBorrar').val());
    });
    document.getElementById('idGuardar').addEventListener("click", palabras.guardar);
    document.onclick = function (e) {
        document.getElementById('menu').style.display = 'none';
    }
    document.oncontextmenu = function (e) {
        document.getElementById('menu').style.display = 'none';
        if (e.target.className.includes("menu")) {
            e.preventDefault();
            $('#menu').css({'left': e.pageX - 100 + 'px', 'top': e.pageY + 'px', 'display': 'block'});
            $('#idBorrarPalabra')
                .text(e.target.innerText.split(' ')[0])
                .on('click', function () {
                    palabras.borrar($(this).text());
                });
        }
    }
};

function activarHerramientas(e) {
    let h = document.getElementById('idHerramientas');
    if (e.currentTarget.checked) {
        h.className = h.className.replace('d-none ', '');
        localStorage.setItem('ActivarHerramientas', h.className);
    } else {
        h.className = 'd-none ' + h.className;
        localStorage.setItem('ActivarHerramientas', h.className);
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

function restablecer() {
    window.location.href = window.location.href;
}
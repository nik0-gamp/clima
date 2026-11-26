
const API_KEY = "RKM233EE4TJ57AP2E9GRJHTNJ";

const ciudad = document.getElementById("ciudad");
const buscar = document.getElementById("buscar");
const actualizar = document.getElementById("actualizar");

const mensaje = document.getElementById("mensaje");
const clima = document.getElementById("clima");

let ultimaCiudad = "";

// Buscar ciudad
buscar.addEventListener("click", function() {

    let nombre = ciudad.value.trim();

    if (nombre === "") {
        mensaje.textContent = "Escribe una ciudad";
        return;
    }

    consultarClima(nombre);
});

// Buscar también con Enter
ciudad.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        buscar.click();
    }

});

// Actualizar pronóstico
actualizar.addEventListener("click", function() {

    if (ultimaCiudad !== "") {
        consultarClima(ultimaCiudad);
    }

});

// Consultar API
async function consultarClima(nombre) {

    mensaje.textContent = "Cargando clima...";
    clima.style.display = "none";

    ultimaCiudad = nombre;

    try {

        // Fechas de ayer y mañana
        let hoy = new Date();

        let ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);

        let manana = new Date(hoy);
        manana.setDate(hoy.getDate() + 1);

        let fechaInicio = obtenerFecha(ayer);
        let fechaFinal = obtenerFecha(manana);

        let url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(nombre)}/${fechaInicio}/${fechaFinal}?unitGroup=metric&include=current,hours&lang=es&key=${API_KEY}&contentType=json`;

        let respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error("No se encontró la ciudad");
        }

        let datos = await respuesta.json();

        mostrarClima(datos);

        mensaje.textContent = "";
        clima.style.display = "block";

    } catch (error) {

        mensaje.textContent = "Error: no se pudo consultar el clima. Revisa la ciudad y tu API Key.";

        clima.style.display = "none";

        console.log(error);

    }

}

// Obtener fecha en formato YYYY-MM-DD
function obtenerFecha(fecha) {

    let anio = fecha.getFullYear();
    let mes = String(fecha.getMonth() + 1).padStart(2, "0");
    let dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;

}

// Mostrar información del clima
function mostrarClima(datos) {

    let actual = datos.currentConditions;

    document.getElementById("nombreCiudad").textContent = datos.resolvedAddress;

    document.getElementById("condicion").textContent = actual.conditions;

    document.getElementById("temperatura").textContent = Math.round(actual.temp) + "°C";

    document.getElementById("viento").textContent = actual.windspeed + " km/h";

    document.getElementById("lluvia").textContent = actual.precipprob + "%";

    mostrarHoras(datos.days);

}

// Mostrar las últimas y próximas 24 horas
function mostrarHoras(dias) {

    let contenedorHoras = document.getElementById("horas");

    contenedorHoras.innerHTML = "";

    let ahora = Date.now() / 1000;

    let horas = [];

    // Recorrer los días y sus horas
    dias.forEach(function(dia) {

        dia.hours.forEach(function(hora) {

            if (hora.datetimeEpoch >= ahora - 86400 &&
                hora.datetimeEpoch <= ahora + 86400) {

                horas.push(hora);

            }

        });

    });

    // Ordenar las horas
    horas.sort(function(a, b) {
        return a.datetimeEpoch - b.datetimeEpoch;
    });

    // Crear tarjetas
    horas.forEach(function(hora) {

        let tarjeta = document.createElement("div");

        tarjeta.classList.add("hora");

        let fecha = new Date(hora.datetimeEpoch * 1000);

        let horaTexto = fecha.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit"
        });

        let fechaTexto = fecha.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short"
        });

        tarjeta.innerHTML = `
            <p>${fechaTexto}</p>
            <p>${horaTexto}</p>
            <h3>${Math.round(hora.temp)}°C</h3>
            <p>${hora.conditions}</p>
            <span>Lluvia: ${hora.precipprob}%</span>
        `;

        contenedorHoras.appendChild(tarjeta);

    });

}

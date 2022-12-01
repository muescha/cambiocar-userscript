// ==UserScript==
// @name         Cambio Carsharing PriceInfo
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Display Price Information at Cambio Carsharing
// @author       Muescha
// @match        https://www.cambio-carsharing.de/cms/mycambio/de/cms_f2_32/fahrten.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cambio-carsharing.de
// @grant        GM_log
// ==/UserScript==


function displayPopup(cell, url) {
    var form = document.createElement('FORM');
    form.name = 'myForm';
    form.method = 'POST';
    form.action = url;
    form.target = 'print_popup';
    var btn = document.createElement("button");

    btn.innerHTML = 'Preis in Popup anzeigen';
    btn.onclick = async function () {
        var win = window.open('about:blank', 'print_popup', 'width=1000,height=800');
    }
    form.appendChild(btn);
    cell.appendChild(form);
}

function displayInline(cell, url) {
    var btn = document.createElement("button");
    btn.innerHTML = 'Preis berechnen';
    btn.type = 'button'
    btn.onclick = async function () {

        var res = await fetch(url, {method: "POST"})
        console.log(res)
        var resText = await res.text();
        //console.log(resText)
        var parser = new DOMParser();
        var doc = parser.parseFromString(resText, "text/html");
        console.log(doc)

        var priceItemsRaw = doc.querySelectorAll(".kosten")
        console.log(priceItemsRaw)
        var priceItems = Array.from(priceItemsRaw).map(
            i => i.innerText.replace(/\t/g, '').replace(/\n/g, '').trim() + '€')
        var info = "Schätzung: " + priceItems[0] + " + " + priceItems[1] + " = " + priceItems[2]
        var infoDisclaimer = "(nicht beachtet wurden zb eine frühzeitige Rückgabe)"

        var priceTable = doc.querySelectorAll("table")[0]

        priceTable.style.display = 'none'


        var viewTable = document.createElement("button");
        viewTable.innerHTML = 'Preis Details anzeigen';
        viewTable.type = 'button'
        viewTable.onclick = async function () {
            viewTable.innerHTML = priceTable.style.display == 'none' ? 'Preis Details ausblenden' : 'Preis Details anzeigen'
            priceTable.style.display = priceTable.style.display == 'none' ? 'block' : 'none'
        }
        cell.appendChild(viewTable)
        cell.appendChild(document.createElement("br"))
        cell.appendChild(document.createTextNode(info))
        cell.appendChild(document.createElement("br"))
        var smallEl = document.createElement("small")
        smallEl.appendChild(document.createTextNode(infoDisclaimer))
        cell.appendChild(smallEl)

        cell.appendChild(priceTable)

        cell.removeChild(btn)

    }

    cell.appendChild(document.createElement("br"))
    cell.appendChild(btn)
}


(function () {
    'use strict';

    var rows = document.querySelectorAll('#fahrtenoffen tr:not(.hidden):not(:first-child)');

    var wagenIds = {
        "XS": 516, // Toyota Aygo

        "S": 393, // S Fiesta oder Corsa
        // "S": 493, // eMobil ZOE

        "M": 455, // Ford Focus Kombi
        // "M": 514, // Citroen Berlingo
        //"M": 588, // Renault Kangoo ZE

        "L": 54, // Ford Transporter
        //"L": 53, // Ford 9sitzer
        //"L": 365, // Volvo S60
    }

    var indexCar = 1
    var indexStart = 3
    var indexEnd = 4
    var indexDistance = 5

    console.log(wagenIds);
    const regCarClass = /(.) \d+/

    rows.forEach(
        function (currentValue, currentIndex, listObj) {
            var rideCell = currentValue.querySelectorAll("td")[1]
            var rideInfo = rideCell.textContent.split("\n").map((s) => s.trim().replace(/\t/g, '').replace(" -", ''));
            console.log("rideInfo[indexCar]")
            var carClass = rideInfo[indexCar].match(regCarClass)[1]
            var start = rideInfo[indexStart].split(" ")
            var end = rideInfo[indexEnd].split(" ")
            var distance = rideInfo[indexDistance].replace("km", "")

            var url = "https://www.cambio-carsharing.de/cms/buchen?"
            url += "&kostenberechner=true"
            url += "&kmgeschaetzt=" + distance
            url += "&WagenID=" + wagenIds[carClass]
            url += "&DatumVon=" + start[0]
            url += "&ZeitVon=" + start[1]
            url += "&DatumBis=" + end[0]
            url += "&ZeitBis=" + end[1]

            // displayPopup(rideCell,url)
            displayInline(rideCell, url)
        }
    )

})();

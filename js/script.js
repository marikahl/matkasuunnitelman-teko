'use strict'

// Käyttäjän nimen testaaminen
function testName() {
    if (nameInput.value.length >= 2) {                           
        setNameButton.disabled = false;
    }
    else {
        setNameButton.disabled = true;
    }
}
// Käyttäjän nimen asettaminen matkasuunnitelmaan
function setName() {
    nameOutput.textContent = nameInput.value + "'s";

}
// Haetaan REST-tiedot taulukkoon
function fetchRESTdata() {
    let dataSource = "http://restcountries.eu/rest/v2/all";
    fetch (dataSource)
    .then (
        function(response) {
            if (response.status !== 200) {
                console.log('Could not get the data. Status Code: ' + response.status);
                return;
            }
            return response.json();
        }
    )    
    .then (
        function(data) {
            RESTdata = data;
            // Kutsutaan aloitusmaiden arpojaa
            pickSampleCountries();
        }
    )    
    .catch(
        function(err) {
            console.log('Fetch Error :', err);
        }
    )
}

function addInfo(div, text1, text2) {
    let p = document.createElement("p");
    div.appendChild(p);
    let span1 = document.createElement("span");
    span1.setAttribute("class", "bold");
    p.appendChild(span1);
    let span2 = document.createElement("span");
    p.appendChild(span2);

    span1.textContent = text1;
    span2.textContent = text2;
}

// Maiden tiedon tulostus
function printCountryInfo(groupDiv, country) {
    // Luodaan maalle div
    let div = document.createElement("div");
    div.setAttribute("id",country.name);
    groupDiv.appendChild(div);
    div.setAttribute("class", "countryCard");
    // Liitetään event listener diviin
    div.addEventListener('click', selectC);
    div.addEventListener('click', enableEndTravelButton);

    // Lippu
    let img = document.createElement("img");
    img.setAttribute("src", country.flag);
    div.appendChild(img);

    // Nimi ja pääkaupunki
    let name = country.name + ": ";
    let capital = country.capital;
    addInfo(div, name, capital);

    // Valuutta
    let currency = country.currencies[0].name + " (" + country.currencies[0].code + ")";
    addInfo(div, "Currency: ", currency);

    // Naapurimaat
    let borders = "Borders: ";
    let countryNames = "";
    for (let j = 0; j < country.borders.length; j++) {
        if (j == country.borders.length -1) {
            countryNames += country.borders[j] + ".";
        }
        else {
            countryNames += country.borders[j] + ", ";
        } 
    }
    addInfo(div, borders, countryNames);
}
// Arvotaan kolma aloitusmaata, joilla on ainakin kaksi naapurimaata
function pickSampleCountries() {

    let sample = new Array();
    while (sample.length <= 2) {
        let sampleC = _.sample(RESTdata);
        if (sampleC.borders.length > 1 && !_.contains(sample,sampleC)) {
            sample[sample.length] = sampleC;
        }
    }
    
    let tier1 = document.createElement("div");
    tier1.setAttribute("id",tier);
    tier++;
    output.appendChild(tier1);

    let h3 = document.createElement("h3");
    h3.textContent = "Select initial starting country:";
    tier1.appendChild(h3);

    let h4 = document.createElement("h4");
    h4.textContent = "Tier " + tier1.getAttribute("id") + ":";
    tier1.appendChild(h4);

    let groupDiv = document.createElement("div");
    groupDiv.setAttribute("class", "group");
    tier1.appendChild(groupDiv);

    for (let i = 0; i < sample.length; i++) {
        let country = sample[i];
        printCountryInfo(groupDiv, country);
        
    }
}
// Lisätään maa vierailtujen maiden listaan
function addToList(country) {
    visitedCountries[visitedCountries.length] = country;
    
    let newSpan = document.createElement("span");
    newSpan.setAttribute("id", country.name + "Span");
    route.appendChild(newSpan);
    newSpan.innerHTML = country.alpha3Code + "<br>";
    neighbours(country);
}
// Poistetaan maa vierailtujen maiden listalta
function removeFromList(country) {
    let countryDiv = document.getElementById(country.name);
    countryDiv.classList.remove("selected");

    let tierID = countryDiv.parentNode.parentNode.getAttribute("id");
    countryDiv.classList.remove(tierID);

    let removeSpan = document.getElementById(country.name + "Span");
    route.removeChild(removeSpan);
    visitedCountries = _.without(visitedCountries, country);
}

// Poistetaan naapurimaiden tiedot
function removeNeighbourTier(tierDiv) {

    let parentEl = tierDiv.parentNode;

    // Poistetaan naapurimaa-listat
    while(!(tierDiv.nextSibling === null)) {

        // Poistetaan poistettavan tierin valittu maa vierailtujen maiden listalta.
        let groupDiv = tierDiv.nextSibling.lastElementChild;
        for (let c = groupDiv.firstElementChild; !(c === null); c = c.nextSibling ) {
            if (c.classList.contains(tierDiv.nextSibling.getAttribute("id"))) {
                let country = _.findWhere(RESTdata ,{name: c.getAttribute("id")});
                removeFromList(country);
            }
        }
        
        parentEl.removeChild(tierDiv.nextSibling);
        tier--;
    }
}

// Käydään läpi annetun maan naapurit, joissa ei ole vierailtu, ja tehdään niistä seuraava taso 
function neighbours(country) {
    let neighbours = country.borders;

    let newTier = document.createElement("div");
    newTier.setAttribute("id",tier);
    tier++;
    output.appendChild(newTier);
    let h4 = document.createElement("h4");
    h4.textContent = "Tier " + newTier.getAttribute("id") + ":";
    newTier.appendChild(h4);
    // Luodaan naapureille div
    let newDiv = document.createElement("div");
    newDiv.setAttribute("class", "group");
    newTier.appendChild(newDiv);

    let unvisited = new Array();

    for (let i = 0; i < neighbours.length; i++) {
        let nCountry = _.findWhere(RESTdata, {alpha3Code: neighbours[i]});
        if (!_.contains(visitedCountries, nCountry)) {
            printCountryInfo(newDiv, nCountry);
            unvisited[i] = nCountry;
        }
    }
    if (unvisited.length === 0) {
        h4.textContent = "No more tiers possible.";
    }
}
// Maan valinta
function selectC() {
    let countryDiv = this;
    let country = _.findWhere(RESTdata, {name: countryDiv.getAttribute("id")});

    let groupDiv = countryDiv.parentNode;
    let tierDiv = groupDiv.parentNode;
    let tierDivID = tierDiv.getAttribute("id");

    for (let n = groupDiv.firstElementChild; n !== groupDiv.lastElementChild.nextSibling ;
         n = n.nextSibling) {
            if (n.classList.contains(tierDivID)) {
                
                n.classList.remove(tierDivID);
                n.classList.remove("selected");
                let countryN = _.findWhere(RESTdata, {name: n.getAttribute("id")});
                removeNeighbourTier(tierDiv);
                removeFromList(countryN);

            }
    }
    countryDiv.classList.add("selected");
    countryDiv.classList.add(tierDivID);
    addToList(country);
}

function enableEndTravelButton() {
    if (visitedCountries.length > 1) {
        endTravel.appendChild(endTravelButton);
        endTravelButton.addEventListener('click', printTravelInfo);
    }
    else {
        if (!(endTravel.firstElementChild === null)) {
            endTravel.removeChild(endTravelButton);
        }
    }
}

function removeEndTravelButton() {
    this.parentNode.removeChild(this);
}

function printTravelInfo() {
    this.parentNode.removeChild(this);
    while (!(output.firstElementChild === null)) {
        output.removeChild(output.firstElementChild);
    }
    let travelInfo = document.createElement("div");
    travelInfo.setAttribute("id", "info");
    output.appendChild(travelInfo);
    let heading = document.createElement("h3");
    heading.setAttribute("id", "heading");

    let name = document.createElement("span");
    heading.appendChild(name);
    name.textContent = nameInput.value + "'s ";

    heading.textContent += "Travel Info";
    travelInfo.appendChild(heading);

    travelInfo.appendChild(document.createElement("hr"));
    for (let i = 0; i < visitedCountries.length; i++) {
        printTravelingCountryInfo(travelInfo, visitedCountries[i]);
    }
    
}

function printTravelingCountryInfo(div, country) {
    let tier = document.createElement("span");
    tier.setAttribute("class","tier");
    div.appendChild(tier);
    tier.textContent = _.indexOf(visitedCountries,country) +1 + ". country:";

    let countryInfo = document.createElement("div");
    countryInfo.setAttribute("class", "countryInfo");
    div.appendChild(countryInfo);

    // Lippu
    let img = document.createElement("img");
    img.setAttribute("src", country.flag);
    countryInfo.appendChild(img);

    let text = document.createElement("div");
    text.setAttribute("id", "infotext");
    countryInfo.appendChild(text);

    //Maan nimi
    let name = document.createElement("h4");
    name.textContent = country.name + " (" + country.alpha3Code + ")";
    text.appendChild(name);
    
    // Pääkaupunki
    addInfo(text, "Capital: ", country.capital);

    // Valuutta
    addInfo(text, "Currency: ", country.currencies[0].name + " (" + country.currencies[0].code + ")");

    // Kielet
    let languages = "";
    for (let j = 0; j < country.languages.length; j++) {
        if (j == country.languages.length -1) {
            languages += country.languages[j].name;
        }
        else {
            languages += country.languages[j].name + ", ";
        } 
    }
    addInfo(text, "Languages: ", languages);

    // Aikavyöhykkeet
    let timezones = "";
    for (let i = 0; i < country.timezones.length; i++) {
        if (i == country.timezones.length -1) {
            timezones += country.timezones[i];
        }
        else {
            timezones += country.timezones[i] + ", ";
        } 
    } 
    addInfo(text, "Timezones: ", timezones);
}

let nameInput = document.getElementById("name");
let setNameButton = document.getElementById("setName");
nameInput.addEventListener('input', testName);
let nameOutput = document.getElementById("nameOutput");
setNameButton.addEventListener('click', setName);

let RESTdata;
// Laskuri kierroksille
let tier = 1;

let output = document.getElementById("output");
window.addEventListener('load', fetchRESTdata);

let visitedCountries = new Array();
let route = document.getElementById("routeInput");

let endTravel = document.getElementById("endTravel");
let endTravelButton = document.createElement("button");
endTravelButton.innerHTML = "End Travel";
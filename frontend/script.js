//bouton delete

const deleteBtn = document.querySelector("#deleteBtn"); //refaire ce qu'il y a entre parentheses

deleteBtn.addEventListener("click", () => {

    fetch("http://localhost:3000/carts/ID_DU_PANIER", {
        method: "DELETE"
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });

});

//le search
//<input id="departure" type="text">
//<input id="arrival" type="text">
//<input id="date" type="date">

//<button id="searchBtn">Rechercher</button>
const departureInput = document.querySelector("#departure");
const arrivalInput = document.querySelector("#arrival");
const dateInput = document.querySelector("#date");
const searchBtn = document.querySelector("#searchBtn");

searchBtn.addEventListener("click", () => {

    const departure = departureInput.value;
    const arrival = arrivalInput.value;
    const date = dateInput.value;

    fetch("http://localhost:3000/trips/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            departure: departure,
            arrival: arrival,
            date: date
            //voir si rajout price: nb ou string?
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });

});
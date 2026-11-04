document.querySelector("#btn-purchase").addEventListener("click", () => {
  fetch("http://localhost:3000/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.result) {
        const container = document.querySelector("#bookings-container");
        container.innerHTML = ""; // on vide les booking si il y'en avais

        // pour chaque objet ajouter dans le cart on fais une div
        data.cart.forEach((booking) => {
          const tempsrestant = Math.round(
            (new Date(booking.date) - new Date()) / 3600000,
          );

          container.innerHTML += `
            <div class="booking-card">
              <p>${booking.departure} > ${booking.arrival}</p>
              <p>${booking.price} €</p>
              <p>Departure in ${tempsrestant} hours</p>
            </div>
          `;
        });
      }
    });
});



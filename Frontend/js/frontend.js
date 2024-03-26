document.addEventListener("DOMContentLoaded", () => {
  const homesList = document.getElementById("homesList");

  fetch("http://13.49.159.9:1337/api/homes")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      data.forEach((home) => {
        const li = document.createElement("li");

        // Check if the home has an image URL
        if (home.imageurl) {
          const img = document.createElement("img");
          img.src = home.imageurl;
          li.appendChild(img);
        } else {
          // Use a default image if no image URL is provided
          const defaultImg = document.createElement("img");
          defaultImg.src = "file:///C:/code/DefaultHomeImage.png";
          li.appendChild(defaultImg);
        }

        // Display other data
        const address = document.createElement("p");
        address.textContent = `Address: ${home.address}`;
        li.appendChild(address);

        const municipality = document.createElement("p");
        municipality.textContent = `Municipality: ${home.municipality}`;
        li.appendChild(municipality);

        const price = document.createElement("p");
        price.textContent = `Price: ${home.price.toLocaleString("da-DK")} Dkk`;
        li.appendChild(price);

        const squaremeters = document.createElement("p");
        squaremeters.textContent = `Square meters: ${home.squaremeters}`;
        li.appendChild(squaremeters);

        homesList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

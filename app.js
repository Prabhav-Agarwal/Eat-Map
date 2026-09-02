"use strict";
/* https://github.com/pointhi/leaflet-color-markers */

/* api key for geoapify */
const apiKey = "7eaf8c66f4a941cd838b1cda3d00c44e";
//selecting dom elements
const modalSection = document.querySelector(".form-map-modal");
const modalMap = document.querySelector(".modal-map");
const modalForm = document.querySelector(".modal-form");
const countryInput = document.querySelector(".country-input");
const cityInput = document.querySelector(".city-input");
const locationInput = document.querySelector(".location-input");
const categoryInput = document.querySelector(".category-input");
const loaderOverlay = document.querySelector(".loader-overlay");

const mainContentContainer = document.querySelector(".main-content");
const cardsContainer = document.querySelector(".places-cards");
const navCategoryBtns = document.querySelectorAll(".category-nav-btn");
const navCategoryBtnsContainer = document.querySelector(".category-nav");
const changeLocationBtn = document.querySelector(".change-location-btn");
const currentCityName = document.querySelector(".current-city-name");
const numPlaces = document.querySelector(".num-places");

const iconsObj = {
  currentLocationIcon: new L.Icon({
    iconUrl: "svgs/current-location.svg",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),

  restaurantIcon: new L.Icon({
    iconUrl: "svgs/restaurant.svg",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  cafeIcon: new L.Icon({
    iconUrl: "svgs/cafe.svg",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  fast_foodIcon: new L.Icon({
    iconUrl: "svgs/fast-food.svg",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  barIcon: new L.Icon({
    iconUrl: "svgs/bar.svg",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

//helper fucntion : to get random num b/w 1 to 2
function getRandomNum() {
  return Math.trunc(Math.random() * 3) + 1;
}

class ModalWindow {
  #modalMap;
  #myLocationMarker;
  currentLocationLatLng;

  constructor() {
    this.showModalWindow();
    (async () => {
      try {
        const position = await this.#getClientCoordinates();
        const { latitude, longitude } = position.coords;
        this.currentLocationLatLng = [latitude, longitude];
        const locationInfo = await this.#getLocationInfo(latitude, longitude);
        this.#renderModalMap([latitude, longitude]);
        this.#updateForm(locationInfo);

        //event for updating form when location is updated by dropping pin on map
        this.#modalMap.on("click", async (e) => {
          const { lat, lng } = e.latlng;
          this.currentLocationLatLng = [lat, lng];
          this.#myLocationMarker.setLatLng([lat, lng]);
          this.#modalMap.setView([lat, lng], 13, {
            animate: true,
            duration: 1,
          });
          const newLocationInfo = await this.#getLocationInfo(lat, lng);
          this.#updateForm(newLocationInfo);
        });

        //event for updating form when country is changed
        countryInput.addEventListener("change", async (e) => {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/search?country=${e.target.value}&lang=en&format=geojson&apiKey=${apiKey}`,
          );
          const data = await response.json();

          countryInput.value = data.features[0].properties.country;
          cityInput.value = "";
          locationInput.value = data.features[0].properties.formatted;

          let { lat, lon: lng } = data.features[0].properties;
          this.currentLocationLatLng = [lat, lng];
          this.#myLocationMarker.setLatLng([lat, lng]);
          this.#modalMap.setView([lat, lng], 13, {
            animate: true,
            duration: 1,
          });
        });

        //event for updating form when country is changed
        cityInput.addEventListener("change", async (e) => {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/search?city=${e.target.value}&lang=en&format=geojson&apiKey=${apiKey}`,
          );
          const data = await response.json();

          countryInput.value = data.features[0].properties.country;
          cityInput.value = data.features[0].properties.city;
          locationInput.value = data.features[0].properties.formatted;

          let { lat, lon: lng } = data.features[0].properties;
          this.currentLocationLatLng = [lat, lng];
          this.#myLocationMarker.setLatLng([lat, lng]);
          this.#modalMap.setView([lat, lng], 13, {
            animate: true,
            duration: 1,
          });
        });
      } catch (e) {
        console.error(`Something Went Wrong : ${e}`);
      }
    })();
  }

  //Function for getting client coordinates
  #getClientCoordinates() {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, (e) =>
        reject(e.message),
      ),
    );
  }

  //Function for rendering modal map (this --> modalWindow class itself)
  #renderModalMap(latLng) {
    return new Promise((resolve) => {
      this.#modalMap = L.map("modal-map").setView(latLng, 13);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.#modalMap);
      this.#myLocationMarker = L.marker(latLng, {
        icon: iconsObj.currentLocationIcon,
      }).addTo(this.#modalMap);

      resolve();
    });
  }

  //Function for getting location info using reverse geocoding api of geoApify
  async #getLocationInfo(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=7eaf8c66f4a941cd838b1cda3d00c44e`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location");
      }
      return await response.json();
    } catch (e) {
      throw new Error("Something Went Wrong");
    }
  }

  //Function nfor updating form inputs
  #updateForm(locationInfo) {
    countryInput.value = locationInfo.results[0].country;
    cityInput.value = locationInfo.results[0].city;
    locationInput.value = locationInfo.results[0].formatted;
  }
  //functin for hiding and showing modal window and loaderoverlay
  showLoaderOverlay() {
    loaderOverlay.classList.remove("hidden");
  }
  hideLoaderOverlay() {
    loaderOverlay.classList.add("hidden");
  }

  //functin for hiding and showing modal window
  hideModalWindow() {
    modalSection.classList.add("hidden");
  }
  showModalWindow() {
    modalSection.classList.remove("hidden");
  }
}

class Place {
  #placeHtmlStr;
  constructor(placeObj) {
    this.latlng = [placeObj.properties.lat, placeObj.properties.lon];
    this.placeCategory = placeObj.properties.datasource.raw.amenity;
    this.placeName = placeObj.properties.datasource.raw.name || "Dining Place";
    this.placeCuisine = placeObj.properties.datasource.raw.cuisine || "General";
    this.placeWebsiteLink = placeObj.properties.website || "#";
    this.placeDistance = placeObj.properties.distance / 1000;
    this.placeAddress = placeObj.properties.formatted;
    this.isVegetarian = placeObj.properties.catering?.diet?.vegetarian;
    this.placeImageSrc = `images/${this.placeCategory}/img${getRandomNum()}.jpg`;

    this.#placeHtmlStr = `
    <div class="places-card" data-lat = "${this.latlng[0]}" data-lng = "${this.latlng[1]}" data-address="${this.placeAddress}">
      <img src="${this.placeImageSrc}" alt="${this.placeCategory} Image" class="places-img" />
      <div class="places-info">
        <div class="card-title">
        <h4 class="place-name">${this.placeName}</h4>
        <span><div style="display: inline-block; border: 2px solid ${this.isVegetarian ? "#008000" : "#A52A2A"}; padding: 2px; background: #fff;">
        <div style="width: 12px; height: 12px; background: ${this.isVegetarian ? "#008000" : "#A52A2A"}; border-radius: 50%;"></div>
        </div></span>
        </div>
        <div class="place-category-cuisine">${this.placeCategory} : ${this.placeCuisine}</div>
        <div>&bull; ${this.placeDistance}&thinsp;km away</div>
        <div class="website-link">
          <a class="hyper-link" href="${this.placeWebsiteLink}">Go to Website</a>
        </div>
      </div>
    </div>
  `;
  }

  placeMarker;

  //function for rendering place marker (this --> Place Class instance)
  renderPlaceCard() {
    cardsContainer.insertAdjacentHTML("beforeend", this.#placeHtmlStr);
  }

  //function for rendering place marker (this --> Place Class instance)
  renderPlaceMarker(mainMap) {
    this.placeMarker = L.marker(this.latlng, {
      icon: iconsObj[`${this.placeCategory}Icon`],
    }).addTo(mainMap);

    this.placeMarker.bindPopup(`${this.placeName}`);

    this.placeMarker.on("click", () => {
      console.log(" i was clicked", this);
      mainMap.setView(this.latlng, 12, { animate: true, duration: 1 });
    });
  }
}

class App {
  #modalWindow;
  #mainMap;
  #places = [];
  #myLocationMarker;
  #selectedCategoryPlaces = [];

  #formData = {};

  constructor() {
    //Initializing modal window class

    this.#modalWindow = new ModalWindow();

    //adding form submit event listener to from
    modalForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      //guard clause
      if (locationInput.value === "") return;

      //showing loader overlay
      this.#modalWindow.showLoaderOverlay();

      //saving form data
      this.#formData.selectedCategory = categoryInput.value;
      this.#formData.currentCityName = cityInput.value;

      document
        .querySelector(`.${this.#formData.selectedCategory}-btn`)
        .classList.add("selected"); //setting nav bar btn
      this.#formData.currentLocationLatLng =
        this.#modalWindow.currentLocationLatLng;

      //getting places
      const placesObject = await this.#getPlaces();

      //creating class instance for each place
      placesObject.features.forEach((placeObject) => {
        this.#places.push(new Place(placeObject));
      });

      //filtering out unwanted categories
      this.#places = this.#places.filter((place) => {
        return ["restaurant", "cafe", "bar", "fast_food"].some(
          (category) => category === place.placeCategory,
        );
      });

      //rendering MainMap

      await this.#renderMainMap(this.#formData.currentLocationLatLng);

      //emptying cards container and removing old  markers from map
      cardsContainer.innerHTML = "";
      this.#selectedCategoryPlaces.forEach((place) =>
        this.#mainMap.removeLayer(place.placeMarker),
      );

      //creating marker and card for each of the places
      this.#renderSelectedCategoryPlaces();

      //updating current city name
      currentCityName.textContent = this.#formData.currentCityName;

      //hiding loader overlay and modal window
      this.#modalWindow.hideLoaderOverlay();
      this.#modalWindow.hideModalWindow();

      //rendering main content;
      this.#showMainContent();
      this.#mainMap.invalidateSize();
    });

    //adding event listener to nav category btns

    navCategoryBtnsContainer.addEventListener("click", (e) => {
      console.log(e.target);
      //guard clause
      if (
        !e.target
          .closest(".category-nav-btn")
          .classList.contains("category-nav-btn")
      ) {
        console.log("i have returned");
        return;
      }
      console.log(e.target.closest(".category-nav-btn"));

      //changing btn color
      navCategoryBtns.forEach((btn) => btn.classList.remove("selected"));
      e.target.closest(".category-nav-btn").classList.add("selected");

      //emptying cards container and removing markers from map
      cardsContainer.innerHTML = "";
      this.#selectedCategoryPlaces.forEach((place) =>
        this.#mainMap.removeLayer(place.placeMarker),
      );

      //updating form fields and form data
      this.#formData.selectedCategory = categoryInput.value =
        e.target.dataset.category;

      //rerendering new selected category places cards and markers

      this.#renderSelectedCategoryPlaces();
    });

    //Adding event listener to change location btn
    changeLocationBtn.addEventListener("click", () => {
      //completely removing map
      this.#mainMap.remove();

      //emptying
      this.#selectedCategoryPlaces = [];
      this.#places = [];

      this.#hideMainContent();
      this.#modalWindow.showModalWindow();
    });

    //Adding event listener for setting map view to specific card marker
    cardsContainer.addEventListener("click", (e) => {
      console.log("hello");
      //guard clause
      if (!e.target.closest(".places-card").classList.contains("places-card")) {
        return;
      }

      console.log("I am here");
      this.#mainMap.setView(
        [
          +e.target.closest(".places-card").dataset.lat,
          +e.target.closest(".places-card").dataset.lng,
        ],
        15,
        { animate: true, duration: 1 },
      );

      this.#selectedCategoryPlaces
        .find(
          (placeObj) =>
            placeObj.placeAddress ===
            e.target.closest(".places-card").dataset.address,
        )
        .placeMarker.openPopup();
    });
  }

  //function for rendering main map

  #renderMainMap(latLng) {
    return new Promise((resolve) => {
      this.#mainMap = L.map("main-map").setView(latLng, 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.#mainMap);

      this.#myLocationMarker = L.marker(latLng, {
        icon: iconsObj.currentLocationIcon,
      }).addTo(this.#mainMap);

      resolve();
    });
  }

  //function for making api request
  async #getPlaces() {
    try {
      console.log(this.#formData.currentLocationLatLng);
      const response = await fetch(
        `https://api.geoapify.com/v2/places?apiKey=7eaf8c66f4a941cd838b1cda3d00c44e&categories=catering&bias=proximity:${this.#formData.currentLocationLatLng[1]},${this.#formData.currentLocationLatLng[0]}&lang=en`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch places");
      }
      return await response.json();
    } catch (e) {
      console.log(e);
      throw new Error("Something Went Wrong");
    }
  }

  //function for rendering selected category places
  #renderSelectedCategoryPlaces() {
    if (this.#formData.selectedCategory === "all")
      this.#selectedCategoryPlaces = [...this.#places];
    else {
      this.#selectedCategoryPlaces = this.#places.filter(
        (place) => place.placeCategory === this.#formData.selectedCategory,
      );
    }

    this.#selectedCategoryPlaces.forEach((place) => {
      place.renderPlaceMarker(this.#mainMap);
      place.renderPlaceCard();
    });

    numPlaces.textContent = `${this.#selectedCategoryPlaces.length} places`;
  }

  //functions for rendering and hiding main content window
  #showMainContent() {
    mainContentContainer.classList.remove("hidden");
  }

  #hideMainContent() {
    mainContentContainer.classList.add("hidden");
  }
}

const foodMap = new App();

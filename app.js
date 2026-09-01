"use strict";
/* https://github.com/pointhi/leaflet-color-markers */

//selecting dom elements
const modalSection = document.querySelector(".form-map-modal");
const modalMap = document.querySelector(".modal-map");
const modalForm = document.querySelector(".modal-form");
const countryInput = document.querySelector(".country-input");
const cityInput = document.querySelector(".city-input");
const locationInput = document.querySelector(".location-input");
const categoryInput = document.querySelector(".category-input");

const mainContentContainer = document.querySelector(".main-content");
const cardsContainer = document.querySelector(".places-cards");

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
          const newLocationInfo = await this.#getLocationInfo(lat, lng);
          this.#updateForm(newLocationInfo);
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
    this.placeName = placeObj.properties.datasource.raw.name;
    this.placeCuisine = placeObj.properties.datasource.raw.cuisine;
    this.placeWebsiteLink = placeObj.properties.datasource.website;
    this.placeDistance = placeObj.properties.datasource.distance;
    this.placeId = placeObj.properties.datasource.place_id;
    this.placeAddress = placeObj.properties.formatted;
    this.isVegetarian = placeObj.properties.catering?.diet?.vegetarian;
    this.placeImageSrc = `images/${this.placeCategory}/img${getRandomNum()}`;

    this.#placeHtmlStr = `
    <div class="places-card">
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

  #placeMarker;

  //function for rendering place marker (this --> Place Class instance)
  renderPlaceCard() {
    cardsContainer.insertAdjacentHTML("beforeend", this.#placeHtmlStr);
  }

  //function for rendering place marker (this --> Place Class instance)
  renderPlaceMarker(mainMap) {
    this.#placeMarker = L.marker(this.latlng, {
      icon: iconsObj[`${this.placeCategory}Icon`],
    }).addTo(mainMap);

    this.#placeMarker.bindPopup(`${this.placeName}`).openPopup();
  }
}

class App {
  #modalWindow;
  #mainMap;
  #places = [];
  #myLocationMarker;

  #formData = {};

  constructor() {
    //Initializing modal window class

    this.#modalWindow = new ModalWindow();

    //adding form submit event listener to from
    modalForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      //hiding modal window
      this.#modalWindow.hideModalWindow();

      //saving form data
      this.#formData.selectedCategory = categoryInput.value;
      this.#formData.currentLocationLatLng =
        this.#modalWindow.currentLocationLatLng;

      //getting places
      const placesObject = await this.#getPlaces();

      //creating class instance for each place
      placesObject.features.forEach((placeObject) => {
        this.#places.push(new Place(placeObject));
      });

      //rendering MainMap
      await this.#renderMainMap(this.#formData.currentLocationLatLng);

      //creating marker and card for each of the places
      let selectedCategoryPlaces = this.#places.filter(
        (place) => place.placeCategory === this.#formData.selectedCategory,
      );

      if (!selectedCategoryPlaces.length) selectedCategoryPlaces = this.#places;

      selectedCategoryPlaces.forEach((place) => {
        place.renderPlaceMarker(this.#mainMap);
        place.renderPlaceCard();
      });

      //rendering main content;
      this.#showMainContent();

      //get Restaurants using api
    });
  }

  //function for rendering main map

  #renderMainMap(latLng) {
    return new Promise((resolve) => {
      this.#mainMap = L.map("main-map").setView(latLng, 13);
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

  //function for rendering main content window
  #showMainContent() {
    mainContentContainer.classList.remove("hidden");
  }
}

const foodMap = new App();

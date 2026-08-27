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


var redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

class ModalWindow {
  #modalMap;
  #myLocationMarker;

  constructor() {
    (async () => {
      try {
        const position = await this.#getClientCoordinates();
		const { latitude, longitude } = position.coords;
		const locationInfo = await this.#getLocationInfo(latitude , longitude)
		this.#renderModalMap([latitude, longitude]);
		this.#updateForm(locationInfo)

		//event for updating form when location is updated by dropping pin on map
		this.#modalMap.on('click' , async (e)=> {
			const {lat , lng} = e.latlng

			this.#myLocationMarker.setLatLng([lat , lng])
			const newLocationInfo = await this.#getLocationInfo(lat , lng)
			this.#updateForm(newLocationInfo)

		})

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
        icon: redIcon,
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
  #updateForm(locationInfo){
	countryInput.value = locationInfo.results[0].country
	cityInput.value = locationInfo.results[0].city
	locationInput.value = locationInfo.results[0].formatted
  }

  hideModalWindow(){
	modalSection.classList.add('hidden')
  }
}

class App{

	#modalWindow
	constructor(){
		//Initializing modal window class

		this.#modalWindow = new ModalWindow()

		//adding form submit event listener to from
		modalForm.addEventListener('submit' , (e)=>{
			e.preventDefault()
			//hiding modal window
			this.#modalWindow.hideModalWindow()
		})
	}
}

const foodMap = new App()








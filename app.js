'use strict'


function getCoordinates(){
	navigator.geolocation.getCurrentPosition((position)=> {
		const {latitude , longitude} = position.coords

		const modalMap = L.map('modal-map').setView([latitude, longitude], 13);
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(modalMap);
		
	} , (e)=> console.error(`Something went wrong : ${e.message}`))
}
getCoordinates()

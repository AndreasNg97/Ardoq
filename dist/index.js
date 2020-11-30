const circles = document.getElementsByClassName('circles')
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kcmVhc25nOTciLCJhIjoiY2tmNW1ybW1yMG84MzJybnlyNnB5Z253NiJ9.z3WrfLTdcCFgWUZvP391cw';
let currentMarkers = []
const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/andreasng97/ckf725qta00qa19nv9ueayy32',
        center: [10.730034556850455, 59.92318372188379],
        zoom: 11.9,
    })

map.addControl(new mapboxgl.NavigationControl());

// Fetches and returns Station Status
async function getStationStatus(){
    const response = await fetch('https://gbfs.urbansharing.com/oslobysykkel.no/station_status.json')
    const results = await response.json()
    return results.data.stations
}
// Fetches and returns Station Information
async function getStationInformation(){
    const response = await fetch('https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json')
    const results = await response.json()
    return results.data.stations
}
//Creates an array with both status and information, and returns that array
const getStatusAndInfo = (status, info) => {
    let statusAndInfo = []
    status.map( s => {
        info.map( i => {
            if(i.station_id === s.station_id){
                s = {
                    id : s.station_id,
                    is_installed : s.is_installed,
                    is_renting : s.is_renting,
                    is_returning : s.is_returning,
                    last_reported : s.last_reported,
                    bikes_available : s.num_bikes_available,
                    docks_available : s.num_docks_available,
                    address : i.address,
                    lat : i.lat,
                    lon : i.lon,
                    name : i.name
                }
                statusAndInfo.push(s)
            }
        })
    })
    return statusAndInfo
}

//Resolves promises and returns Status and Information as an array
async function outputStation(){
    let status = await getStationStatus()
    let info = await getStationInformation()
    return await getStatusAndInfo(status, info)
}

//Draw markers and sets diffrent configs based on if the toggle-param is either 'bikes' or 'docks'
//Pushes marker obj to an array (currentMarkers), to remove and draw new markers.
const drawMarkers = async (data, toggle) => {
    const dataResovled = await data
    const zoomLevel = map.getZoom()
    let toggleVal

    deleteCurrentMarkers(currentMarkers)

    dataResovled.forEach((station) => {
        toggle === 'bikes' 
            ? toggleVal = station.bikes_available 
            : toggleVal = station.docks_available

        const el = document.createElement('div')
        toggleVal === 0 
            ? el.classList.add("circles", "red-circles") 
            : el.className = 'circles' 

        el.value = toggle === 'bikes' 
                    ? station.bikes_available 
                    : station.docks_available

        el.innerHTML = `<p class='circletext'>${el.value}</p>`

        const marker = new mapboxgl.Marker(el)
            .setLngLat([station.lon, station.lat])
            .setPopup(new mapboxgl.Popup()
                .setHTML(htmlPopup(station))
                .setMaxWidth('325px'))
                
            .addTo(map)

        currentMarkers.push(marker)
        }
    )
    resizeMarkers(zoomLevel)
}

//Returns HTML for mapbox popup
function htmlPopup(station){
    return `<ul>
                <li class='addressAndName border-bottom'><h3>${station.name}</h3></li>
                <li class='addressAndName mt-2 mb-3' >${station.address}</li>
                <li>
                    <img class='popup-icon' src="./img/bike.png"/>
                    <p class='number'>
                        ${station.bikes_available} 
                        ${station.bikes_available === 1 ? 'bike' : 'bikes'} available
                    </p>
                </li>
                <li class='mt-2'>
                    <img class='popup-icon' src="./img/parking.png"/>
                    <p class='number'>
                        ${station.docks_available}
                        ${station.docs_available === 1 ? 'dock' : 'docks'} available
                    </p>
                </li>
            </ul>`
}

//Draw new markers with either bikes or docks value.
//Toggle effect for buttons
async function toggle(event) {
    let e = event.target

    await drawMarkers(outputStation(), e.value)

    e.parentElement.className = 'btn btn-info active'
    !e.parentElement.nextElementSibling
        ?e.parentElement.previousElementSibling.className = 'btn btn-info'
        :e.parentElement.nextElementSibling.className = 'btn btn-info'
}

//Iterates through currentMarkers array and removes each marker from the map.
//Sets currentMarker to nothing after
function deleteCurrentMarkers(markers){
    markers.forEach(marker =>{
        console.log(marker)
        marker.remove()
    })
    currentMarkers = []
}


map.on('zoomend', () => {
    let zoomLevel = map.getZoom()
    resizeMarkers(zoomLevel)
})

//Resizes markers and removes/add text based on zoomLevel
function resizeMarkers(zoomLevel){
    let arr = Array.from(circles) 
    if(zoomLevel <= 11.5){
        arr.map(circle => {
            circle.innerText = ''
            circle.style.width = zoomLevel / 17 + 'rem'
            circle.style.height = zoomLevel / 17 + 'rem'
        })
    }if(zoomLevel > 11.5){
        arr.map(circle => {
            circle.innerHTML = `<p class='circletext'>${circle.value}</p>`
            circle.style.width = '1rem'
            circle.style.height = '1rem'
        })
    }
}

//Draw markers on load
map.on('load', () => {
    drawMarkers(outputStation(),'bikes' )
})
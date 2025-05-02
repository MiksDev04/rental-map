document.addEventListener('DOMContentLoaded', function() {

    const map = L.map('map').setView([12.8797, 121.7740], 6);
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    

    const availableIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    const rentedIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    

    const markers = [];
    properties.forEach(property => {
        const icon = property.available ? availableIcon : rentedIcon;
        
        const marker = L.marker([property.lat, property.lng], { icon: icon })
            .addTo(map)
            .bindPopup(`
                <h3>${property.title}</h3>
                <p><strong>₱${property.price.toLocaleString()}</strong> per month</p>
                <p>${property.bedrooms} bed, ${property.bathrooms} bath</p>
                <p>${property.location}</p>
                <p>Status: <span class="${property.available ? 'status-available' : 'status-rented'}">${property.available ? 'Available' : 'Rented'}</span></p>
                <a href="#" class="view-btn" data-id="${property.id}">View Details</a>
            `);
        
        marker.propertyId = property.id;
        markers.push(marker);
    });
    

    function displayProperties(filteredProperties = properties) {
        const propertiesContainer = document.getElementById('properties-container');
        propertiesContainer.innerHTML = '';
        
        if (filteredProperties.length === 0) {
            propertiesContainer.innerHTML = '<p class="no-results">No properties match your search criteria.</p>';
            return;
        }
        
        filteredProperties.forEach(property => {
            const propertyCard = document.createElement('div');
            propertyCard.className = 'property-card';
            propertyCard.innerHTML = `
                <div class="property-image">
                    <img src="${property.image}" alt="${property.title}">
                </div>
                <div class="property-info">
                    <h3>${property.title}</h3>
                    <div class="property-price">₱${property.price.toLocaleString()}/month</div>
                    <div class="property-location">
                        <i class="fas fa-map-marker-alt"></i> ${property.location}
                    </div>
                    <div class="property-features">
                        <span class="feature"><i class="fas fa-bed"></i> ${property.bedrooms} beds</span>
                        <span class="feature"><i class="fas fa-bath"></i> ${property.bathrooms} baths</span>
                        <span class="feature"><i class="fas fa-ruler-combined"></i> ${property.area} sqm</span>
                    </div>
                    <div>
                        Status: <span class="property-status ${property.available ? 'status-available' : 'status-rented'}">
                            ${property.available ? 'Available' : 'Rented'}
                        </span>
                    </div>
                    <a href="#" class="view-btn" data-id="${property.id}">View Details</a>
                </div>
            `;
            propertiesContainer.appendChild(propertyCard);
        });
        

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const propertyId = parseInt(this.getAttribute('data-id'));
                const property = properties.find(p => p.id === propertyId);
                
                if (property) {

                    map.flyTo([property.lat, property.lng], 14);
                    

                    const marker = markers.find(m => m.propertyId === propertyId);
                    if (marker) {
                        marker.openPopup();
                    }
                }
            });
        });
    }

    displayProperties();
    

    document.getElementById('search-btn').addEventListener('click', searchProperties);
    document.getElementById('search-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchProperties();
        }
    });
    

    document.getElementById('price-filter').addEventListener('change', searchProperties);
    document.getElementById('type-filter').addEventListener('change', searchProperties);
    document.getElementById('bedrooms-filter').addEventListener('change', searchProperties);
    
    function searchProperties() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const priceFilter = document.getElementById('price-filter').value;
        const typeFilter = document.getElementById('type-filter').value;
        const bedroomsFilter = document.getElementById('bedrooms-filter').value;
        
        const filtered = properties.filter(property => {

            const matchesSearch = 
                property.title.toLowerCase().includes(searchTerm) ||
                property.location.toLowerCase().includes(searchTerm) ||
                property.description.toLowerCase().includes(searchTerm) ||
                property.features.some(f => f.toLowerCase().includes(searchTerm));

            let matchesPrice = true;
            if (priceFilter) {
                const priceValue = parseInt(priceFilter);
                if (priceValue === 5000) {
                    matchesPrice = property.price <= 5000;
                } else if (priceValue === 10000) {
                    matchesPrice = property.price > 5000 && property.price <= 10000;
                } else if (priceValue === 20000) {
                    matchesPrice = property.price > 10000 && property.price <= 20000;
                } else if (priceValue === 20001) {
                    matchesPrice = property.price > 20000;
                }
            }
            

            const matchesType = typeFilter ? property.type === typeFilter : true;
            

            let matchesBedrooms = true;
            if (bedroomsFilter) {
                const beds = parseInt(bedroomsFilter);
                if (beds === 3) {
                    matchesBedrooms = property.bedrooms >= 3;
                } else {
                    matchesBedrooms = property.bedrooms === beds;
                }
            }
            
            return matchesSearch && matchesPrice && matchesType && matchesBedrooms;
        });
        
        displayProperties(filtered);
        

        markers.forEach(marker => {
            const property = filtered.find(p => p.id === marker.propertyId);
            if (property) {
                marker.addTo(map);
            } else {
                marker.remove();
            }
        });
    }
});
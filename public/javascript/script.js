document.addEventListener('DOMContentLoaded', function() {
    const restaurantGrid = document.getElementById('restaurantGrid');
    const loadingElement = document.getElementById('loading');
    const loadMoreButton = document.getElementById('loadMore');
    const applyFiltersButton = document.getElementById('applyFilters');
    const resetFiltersButton = document.getElementById('resetFilters');
    const restaurantCountElement = document.getElementById('restaurantCount');
    
    let allRestaurants = [];
    let displayedRestaurants = [];
    let currentOffset = 0;
    const limit = 30;
    let activeFilters = {
      boroughs: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
      outdoorSeating: false,
      alcohol: false,
      sortBy: 'name'
    };
  
    init();
  
    function init() {
      loadRestaurants();
      setupEventListeners();
    }
  
    function setupEventListeners() {
      loadMoreButton.addEventListener('click', loadMoreRestaurants);
    
      applyFiltersButton.addEventListener('click', applyFilters);
      
      resetFiltersButton.addEventListener('click', resetFilters);
    }
  
    async function loadRestaurants() {
      try {
        showLoading();
        
        const response = await fetch('https://data.cityofnewyork.us/resource/pitm-atqc.json?$limit=1000');
        const data = await response.json();
        
        allRestaurants = data.map(restaurant => ({
        id: restaurant.camis || restaurant.id || Math.random().toString(36).substr(2, 9),
        name: restaurant.dba || restaurant.restaurant_name || 'Unnamed Restaurant',
        borough: (restaurant.boro || restaurant.borough || 'Unknown Borough').trim(),

        address: `${restaurant.building || ''} ${restaurant.street || ''}, ${restaurant.zipcode || ''}`.trim(),
        outdoorSeating: (restaurant.approved_for_sidewalk_seating === 'yes' || 
                    restaurant.approved_for_roadway_seating === 'yes'),
        alcohol: (restaurant.qualify_alcohol === 'yes')
        }));
        
        applyFilters();
        hideLoading();
      } catch (error) {
        console.error('Error loading restaurants:', error);
        hideLoading();
        restaurantGrid.innerHTML = '<p class="error">Failed to load restaurant data. Please try again later.</p>';
      }
    }
  
    function applyFilters() {
      const boroughCheckboxes = document.querySelectorAll('input[name="borough"]:checked');
      activeFilters.boroughs = Array.from(boroughCheckboxes).map(cb => cb.value);
      
      activeFilters.outdoorSeating = document.querySelector('input[name="outdoorSeating"]').checked;
      activeFilters.alcohol = document.querySelector('input[name="alcohol"]').checked;
      activeFilters.sortBy = document.getElementById('sortBy').value;

      displayedRestaurants = allRestaurants.filter(restaurant => {
        const boroughMatch = activeFilters.boroughs.includes(restaurant.borough);
        const outdoorMatch = !activeFilters.outdoorSeating || restaurant.outdoorSeating;
        const alcoholMatch = !activeFilters.alcohol || restaurant.alcohol;
        
        return boroughMatch && outdoorMatch && alcoholMatch;
      });
      
      sortRestaurants();
   
      currentOffset = 0;
      restaurantGrid.innerHTML = '';
      

      displayRestaurants();
    }
  
    function sortRestaurants() {
      const sortField = activeFilters.sortBy.startsWith('-') ? 
                       activeFilters.sortBy.substring(1) : 
                       activeFilters.sortBy;
      const sortDirection = activeFilters.sortBy.startsWith('-') ? -1 : 1;
      
      displayedRestaurants.sort((a, b) => {
        const valueA = a[sortField] || '';
        const valueB = b[sortField] || '';
        
        if (valueA < valueB) return -1 * sortDirection;
        if (valueA > valueB) return 1 * sortDirection;
        return 0;
      });
    }
  
    function displayRestaurants() {
      const endIndex = Math.min(currentOffset + limit, displayedRestaurants.length);
      const restaurantsToShow = displayedRestaurants.slice(currentOffset, endIndex);
      
      if (restaurantsToShow.length === 0 && currentOffset === 0) {
        restaurantGrid.innerHTML = '<p class="no-results">No restaurants match your filters.</p>';
        loadMoreButton.style.display = 'none';
        return;
      }
      
      restaurantsToShow.forEach(restaurant => {
        const card = createRestaurantCard(restaurant);
        restaurantGrid.appendChild(card);
      });
      
      restaurantCountElement.textContent = Math.min(endIndex, displayedRestaurants.length);
      
      loadMoreButton.style.display = endIndex < displayedRestaurants.length ? 'block' : 'none';
    }
  
    function createRestaurantCard(restaurant) {
      const card = document.createElement('div');
      card.className = 'restaurant-card';
      
      const infoDiv = document.createElement('div');
      infoDiv.className = 'restaurant-info';
      
      const name = document.createElement('h3');
      name.textContent = restaurant.name;
      
      const borough = document.createElement('p');
      borough.innerHTML = `<strong>Borough:</strong> ${restaurant.borough}`;
      
      const address = document.createElement('p');
      address.innerHTML = `<strong>Address:</strong> ${restaurant.address}`;
      
      infoDiv.appendChild(name);
      infoDiv.appendChild(borough);
      infoDiv.appendChild(address);
      
      const featuresDiv = document.createElement('div');
      if (restaurant.outdoorSeating) {
        const outdoorBadge = document.createElement('span');
        outdoorBadge.className = 'feature-badge';
        outdoorBadge.textContent = 'Outdoor Seating';
        featuresDiv.appendChild(outdoorBadge);
      }
      
      if (restaurant.alcohol) {
        const alcoholBadge = document.createElement('span');
        alcoholBadge.className = 'feature-badge';
        alcoholBadge.textContent = 'Alcohol Served';
        featuresDiv.appendChild(alcoholBadge);
      }
      
      infoDiv.appendChild(featuresDiv);
      card.appendChild(infoDiv);
      
      return card;
    }
  
    function loadMoreRestaurants() {
      currentOffset += limit;
      displayRestaurants();
      
      setTimeout(() => {
        restaurantGrid.lastElementChild.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 100);
    }
  
    function resetFilters() {
      document.querySelectorAll('input[name="borough"]').forEach(checkbox => {
        checkbox.checked = true;
      });
      
      document.querySelector('input[name="outdoorSeating"]').checked = false;
      document.querySelector('input[name="alcohol"]').checked = false;
      document.getElementById('sortBy').value = 'name';
      
      activeFilters = {
        boroughs: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
        outdoorSeating: false,
        alcohol: false,
        sortBy: 'name'
      };
      
      applyFilters();
    }
  
    function showLoading() {
      loadingElement.style.display = 'flex';
      loadMoreButton.style.display = 'none';
    }
  
    function hideLoading() {
      loadingElement.style.display = 'none';
    }
  });
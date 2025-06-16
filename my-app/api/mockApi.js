const API_BASE_URL = 'http://192.168.1.189:3001';

  export const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      return []; 
    }
  };
  
  // Simulate fetching a specific restaurant's menu
  export const fetchRestaurantMenu = async (restaurantId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch menu for restaurant ${restaurantId}:`, error);
      return [];
    }
  };

  export const fetchMenuItem = async (restaurantId, menuItemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu/${menuItemId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch menu item ${menuItemId} for restaurant ${restaurantId}:`, error);
      return null;
    }
  };

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
};
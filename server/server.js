const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
app.use(morgan('dev'));
app.use(express.json());

const MOCK_RESTAURANTS_DATA = [
  { id: '1', name: 'ร้านอร่อยยกนิ้ว', cuisine: 'อาหารตามสั่ง', rating: 4.5, deliveryTime: '25-35 min', image: 'https://via.placeholder.com/100?text=Restaurant1', menu: [{ id: 'm1', name: 'กะเพราหมูกรอบ', price: 60, image: 'https://via.placeholder.com/80?text=Kaprao' }, { id: 'm2', name: 'ข้าวผัด', price: 55, image: 'https://via.placeholder.com/80?text=FriedRice' }, { id: 'm13', name: 'ผัดซีอิ๊ว', price: 65, image: 'https://via.placeholder.com/80?text=PadSeeEw' }] },
  { id: '2', name: 'ส้มตำแซ่บนัว', cuisine: 'อาหารอีสาน', rating: 4.8, deliveryTime: '20-30 min', image: 'https://via.placeholder.com/100?text=Restaurant2', menu: [{ id: 'm3', name: 'ส้มตำไทย', price: 50, image: 'https://via.placeholder.com/80?text=Somtum' }, { id: 'm4', name: 'คอหมูย่าง', price: 80, image: 'https://via.placeholder.com/80?text=GrilledPork' }, { id: 'm14', name: 'ลาบหมู', price: 70, image: 'https://via.placeholder.com/80?text=LarbMoo' }] },
  { id: '3', name: 'พิซซ่าเตาถ่าน', cuisine: 'พิซซ่า', rating: 4.2, deliveryTime: '30-40 min', image: 'https://via.placeholder.com/100?text=Restaurant3', menu: [{ id: 'm5', name: 'พิซซ่าฮาวายเอี้ยน', price: 250, image: 'https://via.placeholder.com/80?text=Hawaiian' }, { id: 'm6', name: 'พิซซ่าเปปเปอโรนี', price: 230, image: 'https://via.placeholder.com/80?text=Pepperoni' }, { id: 'm15', name: 'พิซซ่ามาร์เกอริต้า', price: 200, image: 'https://via.placeholder.com/80?text=Margherita' }] },
  { id: '4', name: 'ก๋วยเตี๋ยวเรือรสเด็ด', cuisine: 'ก๋วยเตี๋ยว', rating: 4.6, deliveryTime: '15-25 min', image: 'https://via.placeholder.com/100?text=Restaurant4', menu: [{ id: 'm7', name: 'ก๋วยเตี๋ยวเรือหมู', price: 50, image: 'https://via.placeholder.com/80?text=NoodlePork' }, { id: 'm8', name: 'ก๋วยเตี๋ยวเรือเนื้อ', price: 60, image: 'https://via.placeholder.com/80?text=NoodleBeef' }, { id: 'm16', name: 'ลูกชิ้นลวกจิ้ม', price: 40, image: 'https://via.placeholder.com/80?text=Meatballs' }] },
  { id: '5', name: 'ข้าวขาหมูตรอกซุง', cuisine: 'ข้าวขาหมู', rating: 4.7, deliveryTime: '20-30 min', image: 'https://via.placeholder.com/100?text=KhaoKhaMoo', menu: [{ id: 'm9', name: 'ข้าวขาหมู พิเศษ', price: 70, image: 'https://via.placeholder.com/80?text=KhaMooSpecial' }, { id: 'm10', name: 'ข้าวคากิ', price: 80, image: 'https://via.placeholder.com/80?text=Kaki' }] },
  { id: '6', name: 'เจ๊โอว ข้าวต้มเป็ด', cuisine: 'ข้าวต้ม', rating: 4.9, deliveryTime: '30-45 min', image: 'https://via.placeholder.com/100?text=JayOh', menu: [{ id: 'm11', name: 'มาม่าโอ้โห', price: 150, image: 'https://via.placeholder.com/80?text=MamaOHO' }, { id: 'm12', name: 'ยำปูไข่ดอง', price: 300, image: 'https://via.placeholder.com/80?text=SpicyCrab' }] },
  { id: '7', name: 'ร้านอาหารทะเลสด', cuisine: 'อาหารทะเล', rating: 4.3, deliveryTime: '35-50 min', image: 'https://via.placeholder.com/100?text=Seafood', menu: [{ id: 'm17', name: 'กุ้งเผา', price: 400, image: 'https://via.placeholder.com/80?text=GrilledShrimp' }, { id: 'm18', name: 'ปลาหมึกย่าง', price: 250, image: 'https://via.placeholder.com/80?text=GrilledSquid' }] },
  { id: '8', name: 'เบอร์เกอร์อินดี้', cuisine: 'เบอร์เกอร์', rating: 4.4, deliveryTime: '20-30 min', image: 'https://via.placeholder.com/100?text=Burger', menu: [{ id: 'm19', name: 'เบอร์เกอร์เนื้อ', price: 120, image: 'https://via.placeholder.com/80?text=BeefBurger' }, { id: 'm20', name: 'เบอร์เกอร์ไก่กรอบ', price: 90, image: 'https://via.placeholder.com/80?text=ChickenBurger' }] },
];

app.get('/', (req, res) => {
  res.send('Welcome to FastFoodDelivery API!');
});

app.get('/restaurants', (req, res) => {
  const restaurantsList = MOCK_RESTAURANTS_DATA.map(({ menu, ...rest }) => rest);
  res.json(restaurantsList);
});

app.get('/restaurants/:id/menu', (req, res) => {
  const restaurantId = req.params.id;
  const restaurant = MOCK_RESTAURANTS_DATA.find(r => r.id === restaurantId);

  if (restaurant) {
    res.json(restaurant.menu || []);
  } else {
    res.status(404).json({ message: 'Restaurant not found' });
  }
});

app.post('/orders', (req, res) => {
  const { cartItems, totalPrice, deliveryOption, paymentMethod, deliveryLocation } = req.body;

  const mockRestaurantOrigin = {
    latitude: 13.7469,
    longitude: 100.5299,
  };

  const newOrder = {
    orderId: 'mock-' + Date.now(),
    status: 'pending',
    ...req.body,
    restaurantOriginLocation: mockRestaurantOrigin,
  };

  res.status(201).json(newOrder);
});

app.get('/calculate-route', async (req, res) => {
  const { origin, destination } = req.query;

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ message: 'Google API Key is not configured on the server.' });
  }
  if (!origin || !destination) {
    return res.status(400).json({ message: 'Origin and destination are required.' });
  }
  res.json({ message: 'Route calculation endpoint ready. Implement actual API call.', origin, destination, apiKeyPresent: !!GOOGLE_API_KEY });
});


app.get('/restaurants/:restaurantId/menu/:menuItemId', (req, res) => {
    const { restaurantId, menuItemId } = req.params;
    const restaurant = MOCK_RESTAURANTS_DATA.find(r => r.id === restaurantId);

    if (restaurant) {
        const menuItem = restaurant.menu.find(item => item.id === menuItemId);
        if (menuItem) {
            res.json(menuItem);
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } else {
        res.status(404).json({ message: 'Restaurant not found' });
    }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

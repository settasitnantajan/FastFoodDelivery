import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions } from 'react-native';
import {
  User,
  Utensils,
  Car,
  ShoppingCart,
  Package,
  Bike
} from 'lucide-react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import LoginModal from '../components/LoginModal';
import { fetchRestaurants } from '../api/mockApi';
import { useCart } from '../context/CartContext';

const SERVICE_MODES = [
  { id: 'food', name: 'Food', icon: Utensils }, // Default
  { id: 'transport', name: 'Transport', icon: Car },
  { id: 'mart', name: 'Mart', icon: ShoppingCart },
  { id: 'express', name: 'Express', icon: Package },
];

// Mock Data for Promotions
const MOCK_PROMOTIONS = [
  { id: 'p1', image: 'https://via.placeholder.com/300x150/FFD700/000000?Text=Promotion+1' },
  { id: 'p2', image: 'https://via.placeholder.com/300x150/ADD8E6/000000?Text=Promotion+2' },
  { id: 'p3', image: 'https://via.placeholder.com/300x150/90EE90/000000?Text=Promotion+3' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]); // Initialize with an empty array
  const [selectedMode, setSelectedMode] = useState(SERVICE_MODES[0].id);
  const navigation = useNavigation();
  const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0);
  const promotionScrollViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const { lastPlacedOrder, setLastPlacedOrder } = useCart();


  const [riderStatusMessage, setRiderStatusMessage] = useState('');
  const [riderCountdown, setRiderCountdown] = useState(0);
  const [isOrderComplete, setIsOrderComplete] = useState(false);


  const [userLocation, setUserLocation] = useState({
    latitude: 13.736717,
    longitude: 100.534847,
  });
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  // สมมติว่าร้านอาหารอยู่ที่ตำแหน่งเริ่มต้น (ควรมาจาก lastPlacedOrder.restaurant.location ในอนาคต)
  const MOCK_RESTAURANT_LOCATION = {
    latitude: 13.7469, // MBK Center (ตัวอย่าง)
    longitude: 100.5299,
  };

  useEffect(() => {
    const loadRestaurantsData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error("HomeScreen: Error fetching restaurants", error);
      }
      setIsLoading(false);
    };

    loadRestaurantsData();

    if (lastPlacedOrder && !lastPlacedOrder.completed) {
      setRiderStatusMessage('กำลังค้นหาไรเดอร์...');
      setRiderCountdown(60);
      setIsOrderComplete(false);

      if (lastPlacedOrder.restaurantOriginLocation) {
        setRestaurantLocation(lastPlacedOrder.restaurantOriginLocation);
        setRiderLocation(lastPlacedOrder.restaurantOriginLocation);
      } else {
        setRestaurantLocation(MOCK_RESTAURANT_LOCATION);
        setRiderLocation(MOCK_RESTAURANT_LOCATION);
      }

      // ตั้งค่า mapRegion เริ่มต้นให้เห็นทั้งผู้ใช้และร้าน
      // (Logic การคำนวณ region ที่ดีกว่านี้จะอยู่ใน useEffect ของ riderCountdown)

    }

    if (MOCK_PROMOTIONS.length > 0) {
      const interval = setInterval(() => {
        setCurrentPromotionIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % MOCK_PROMOTIONS.length;
          promotionScrollViewRef.current?.scrollTo({
            x: nextIndex * Dimensions.get('window').width * 0.8,
            animated: true,
          });
          return nextIndex;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [lastPlacedOrder]);

  useEffect(() => {
    if (!lastPlacedOrder || riderCountdown <= 0 || isOrderComplete) {
      if (lastPlacedOrder && riderCountdown <= 0 && !isOrderComplete) { // Delivery complete
        setRiderStatusMessage('ไรเดอร์มาถึงแล้ว! รับอาหารได้เลย');
        setIsOrderComplete(true);
      }
      return;
    }

    if (riderCountdown === 50) {
      setRiderStatusMessage('พบไรเดอร์แล้ว! กำลังไปรับอาหาร...');
    } else if (riderCountdown === 20) {
      setRiderStatusMessage('ไรเดอร์รับอาหารแล้ว กำลังมาส่ง...');
    }

    if (restaurantLocation && userLocation && riderLocation && riderCountdown > 0) {
      const totalDuration = 60;
      const timeElapsed = totalDuration - riderCountdown;      
      const progress = Math.min(timeElapsed / (totalDuration - 5), 1);

      const nextLat = restaurantLocation.latitude + (userLocation.latitude - restaurantLocation.latitude) * progress;
      const nextLng = restaurantLocation.longitude + (userLocation.longitude - restaurantLocation.longitude) * progress;
      const newRiderPosition = { latitude: nextLat, longitude: nextLng };
      
      if (riderLocation.latitude !== nextLat || riderLocation.longitude !== nextLng) {
        setRiderLocation(newRiderPosition);
      }

      const pointsForRegion = [userLocation, restaurantLocation, newRiderPosition];

      const latitudes = pointsForRegion.map(p => p.latitude);
      const longitudes = pointsForRegion.map(p => p.longitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      setMapRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.5),
        longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.5),
      });
    }

    const timer = setTimeout(() => {
      setRiderCountdown(prev => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [lastPlacedOrder, riderCountdown, isOrderComplete]);



  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
    >
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
        <View style={styles.restaurantDetails}>
          <Text>⭐ {item.rating}</Text>
          <Text>  •  {item.deliveryTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>FastApp</Text>
          <TouchableOpacity onPress={() => setIsLoginModalVisible(true)} style={styles.userIconContainer}>
            <User color="#333" size={28} />
          </TouchableOpacity>
        </View>

        {lastPlacedOrder && !isOrderComplete && restaurantLocation && riderLocation && (
          <View style={styles.mapViewContainer}>
            <MapView
              style={styles.map}
              region={mapRegion}
            >
              <Marker coordinate={userLocation} title="ตำแหน่งของคุณ" pinColor="blue" />
              <Marker coordinate={restaurantLocation} title="ร้านอาหาร" pinColor="orange" />
              {riderLocation && (
                <Marker coordinate={riderLocation} title="ไรเดอร์">
                  <Bike size={30} color="#006400" />
                </Marker>
              )}

              {riderLocation && <Polyline coordinates={[restaurantLocation, riderLocation]} strokeColor="rgba(255, 0, 0, 0.7)" strokeWidth={4} />}
              {riderLocation && <Polyline coordinates={[riderLocation, userLocation]} strokeColor="rgba(0, 200, 0, 0.8)" strokeWidth={5} lineDashPattern={[10, 5]}/>}

            </MapView>
          </View>
        )}



        <LoginModal visible={isLoginModalVisible} onClose={() => setIsLoginModalVisible(false)} />

        <View style={styles.modesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modesScrollContent}>
            {SERVICE_MODES.map((mode) => {
              const IconComponent = mode.icon;
              const isActive = selectedMode === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[styles.modeButton, isActive && styles.modeButtonActive]}
                  onPress={() => setSelectedMode(mode.id)}
                >
                  <IconComponent color={isActive ? '#fff' : '#333'} size={24} style={styles.modeIcon} />
                  <Text style={[styles.modeText, isActive && styles.modeTextActive]}>{mode.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.promotionContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            ref={promotionScrollViewRef}
            contentContainerStyle={styles.promotionScrollContent}
          >
            {MOCK_PROMOTIONS.map((promo) => (
              <TouchableOpacity key={promo.id} style={styles.promotionCard} onPress={() => console.log('Promotion pressed:', promo.id)}>
                <Image source={{ uri: promo.image }} style={styles.promotionImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>


        {selectedMode === 'food' && (
          <>
            <TextInput
              style={styles.searchBar}
              placeholder="ค้นหาร้านอาหารหรือเมนู..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text>กำลังโหลดร้านอาหาร...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>ร้านอาหารยอดนิยม</Text>
                <FlatList
                  data={restaurants}
                  renderItem={renderRestaurantItem}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </>
        )}
        {selectedMode !== 'food' && (
          <View style={styles.placeholderContent}>
            <Text>เนื้อหาสำหรับโหมด {SERVICE_MODES.find(m => m.id === selectedMode)?.name} จะแสดงที่นี่</Text>
          </View>
        )}

        {lastPlacedOrder && !isOrderComplete && (
          <View style={styles.homeRiderTrackingContainer}>
            <Bike size={24} color="#fff" />
            <View style={styles.homeRiderStatusTextContainer}>
              <Text style={styles.homeRiderStatusTitle}>{riderStatusMessage}</Text>
              {riderCountdown > 0 && (
                <Text style={styles.homeRiderCountdownText}>
                  Order #{lastPlacedOrder.orderId} - เหลือเวลาประมาณ: {Math.floor(riderCountdown / 60)}:{(riderCountdown % 60).toString().padStart(2, '0')}
                </Text>
              )}
            </View>
          </View>
        )}
        {lastPlacedOrder && isOrderComplete && (
          <View style={[styles.homeRiderTrackingContainer, styles.orderCompleteBackground]}>
            <Text style={styles.homeRiderStatusTitle}>Order #{lastPlacedOrder.orderId} - {riderStatusMessage}</Text>
            <TouchableOpacity onPress={() => setLastPlacedOrder(null)} style={styles.dismissButton}>
                <Text style={styles.dismissButtonText}>ปิด</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userIconContainer: {
    padding: 5,
  },
  modesContainer: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  modesScrollContent: {
    paddingHorizontal: 5,
  },
  modeButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    minWidth: 80,
  },
  modeButtonActive: {
    backgroundColor: '#007bff',
  },
  modeIcon: {
    marginBottom: 4,
  },
  modeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  modeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapViewContainer: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  promotionContainer: {
    height: 150,
    marginBottom: 20,
  },
  promotionScrollContent: {
  },
  promotionCard: {
    width: Dimensions.get('window').width * 0.8,
    height: '100%',
    borderRadius: 8,
    marginHorizontal: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  searchBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  promotionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 12,
    color: '#777',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeRiderTrackingContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  orderCompleteBackground: {
    backgroundColor: 'rgba(40, 167, 69, 0.9)', // Green for completed orders
    justifyContent: 'space-between',
  },
  homeRiderStatusTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  homeRiderStatusTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  homeRiderCountdownText: {
    color: '#e0e0e0',
    fontSize: 12,
  },
  dismissButton: {
    paddingHorizontal: 10,
  },
  dismissButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

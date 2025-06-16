import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useCart } from "../context/CartContext";
import { fetchRestaurantMenu } from "../api/mockApi";

const ImageWithPlaceholder = ({ source, style, placeholderStyle }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !source || !source.uri) {
    return <View style={[style, styles.imagePlaceholder, placeholderStyle]} />;
  }

  return (
    <Image
      source={source}
      style={style}
      onError={() => {
        setImageError(true);
      }}
    />
  );
};

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurant } = route.params;

  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { cartItems, totalItems, totalPrice } = useCart();

  useLayoutEffect(() => {
    navigation.setOptions({ title: restaurant.name });
  }, [navigation, restaurant.name]);
  useEffect(() => {
    const loadMenuData = async () => {
      if (restaurant && restaurant.id) {
        setIsLoading(true);
        const data = await fetchRestaurantMenu(restaurant.id);
        setMenuItems(data);
        setIsLoading(false);
      }
    };
    loadMenuData();
  }, [restaurant.id]);

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItemCard}
      onPress={() => navigation.navigate("MenuItemDetail", { menuItem: item })}
    >
      <ImageWithPlaceholder
        source={{ uri: item.image }}
        style={styles.menuItemImage}
      />
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemPrice}>
          {item.price.toLocaleString()} บาท
        </Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>กำลังโหลดเมนู...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <ImageWithPlaceholder
            source={{ uri: restaurant.image }}
            style={styles.restaurantImageBanner}
          />
          <Text style={styles.restaurantHeader}>{restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>

          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.menuTitle}>เมนูอาหาร</Text>
            }
            contentContainerStyle={{
              paddingBottom: cartItems.length > 0 ? 70 : 0,
            }}
          />
        </View>
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.miniCartContainer}
            onPress={() => navigation.navigate("Cart")}
          >
            <View style={styles.miniCartInfo}>
              <Text style={styles.miniCartText}>{totalItems} รายการ</Text>
              <Text style={styles.miniCartText}>
                รวม {totalPrice.toLocaleString()} บาท
              </Text>
            </View>
            <Text style={styles.miniCartViewButton}>ดูตะกร้า</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  restaurantImageBanner: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  restaurantHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  restaurantCuisine: { fontSize: 16, color: "#666", marginBottom: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#333",
  },
  menuItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  menuItemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 16, fontWeight: "600", color: "#444" },
  menuItemPrice: { fontSize: 14, color: "#007bff", marginTop: 4 },
  addButton: {
    backgroundColor: "#007bff",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  miniCartContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#0056b3",
  },
  miniCartInfo: {},
  miniCartText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  miniCartViewButton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

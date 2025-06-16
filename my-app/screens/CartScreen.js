import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useCart, DELIVERY_OPTIONS } from "../context/CartContext";
import {
  XCircle,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  CreditCard,
  DollarSign,
  QrCode,
  Bike,
} from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";

const ImageWithPlaceholder = ({ source, style, placeholderStyle }) => {
  const [imageError, setImageError] = React.useState(false);
  if (imageError || !source || !source.uri) {
    return <View style={[style, styles.imagePlaceholder, placeholderStyle]} />;
  }
  return (
    <Image source={source} style={style} onError={() => setImageError(true)} />
  );
};

const PAYMENT_OPTIONS = [
  { id: "cash", name: "เงินสดปลายทาง", icon: DollarSign },
  { id: "card", name: "บัตรเครดิต/เดบิต", icon: CreditCard },
  { id: "promptpay", name: "PromptPay/QR Code", icon: QrCode },
];

import { createOrder } from "../api/mockApi";
export default function CartScreen({ navigation }) {
  const {
    cartItems,
    totalItems,
    totalPrice,
    removeFromCart,
    updateItemQuantity,
    selectedDeliveryOption,
    updateDeliveryOption,
    deliveryFee,
    clearCart,
    setLastPlacedOrder,
  } = useCart();
  const [deliveryLocation, setDeliveryLocation] = React.useState({
    latitude: 13.736717,
    longitude: 100.534847,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [selectedPaymentOption, setSelectedPaymentOption] = React.useState(
    PAYMENT_OPTIONS[0].id
  ); // Default to cash

  useLayoutEffect(() => {
    navigation.setOptions({ title: `ตะกร้าสินค้า (${totalItems} รายการ)` });
  }, [navigation, totalItems]);

  const handleIncreaseQuantity = (item) => {
    updateItemQuantity(item.uniqueId, item.quantity + 1);
  };

  const handleDecreaseQuantity = (item) => {
    updateItemQuantity(item.uniqueId, item.quantity - 1);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemCard}>
      <ImageWithPlaceholder
        source={{ uri: item.image }}
        style={styles.cartItemImage}
      />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>
          {item.price.toLocaleString()} บาท
        </Text>
        {item.notes ? (
          <Text style={styles.cartItemNotes}>หมายเหตุ: {item.notes}</Text>
        ) : null}
      </View>
      <View style={styles.quantityControlContainer}>
        <TouchableOpacity
          onPress={() => handleDecreaseQuantity(item)}
          style={styles.quantityButton}
        >
          <MinusCircle color="#555" size={24} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => handleIncreaseQuantity(item)}
          style={styles.quantityButton}
        >
          <PlusCircle color="#555" size={24} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => removeFromCart(item.uniqueId)}
        style={styles.removeButton}
      >
        <XCircle color="red" size={24} />
      </TouchableOpacity>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>ตะกร้าสินค้าของคุณว่างเปล่า</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.replace("Home")}
          >
            <Text style={styles.shopButtonText}>เลือกซื้อสินค้า</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={deliveryLocation}
          onRegionChangeComplete={setDeliveryLocation} // Optional: allow user to change map region
        >
          <Marker
            coordinate={{
              latitude: deliveryLocation.latitude,
              longitude: deliveryLocation.longitude,
            }}
            title="ที่อยู่จัดส่ง (จำลอง)"
            description="แตะเพื่อแก้ไข"
          />
        </MapView>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.uniqueId}
          ListHeaderComponent={
            <View style={styles.deliveryOptionsContainer}>
              <Text style={styles.sectionHeader}>เลือกการจัดส่ง</Text>
              {Object.values(DELIVERY_OPTIONS).map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.deliveryOptionButton,
                    selectedDeliveryOption.id === option.id &&
                      styles.deliveryOptionButtonSelected,
                  ]}
                  onPress={() => updateDeliveryOption(option.id)}
                >
                  <Text
                    style={[
                      styles.deliveryOptionText,
                      selectedDeliveryOption.id === option.id &&
                        styles.deliveryOptionTextSelected,
                    ]}
                  >
                    {option.name}
                  </Text>
                  <Text
                    style={[
                      styles.deliveryOptionFee,
                      selectedDeliveryOption.id === option.id &&
                        styles.deliveryOptionTextSelected,
                    ]}
                  >
                    {option.fee} บาท
                  </Text>
                  {selectedDeliveryOption.id === option.id && (
                    <CheckCircle2
                      color="#fff"
                      size={20}
                      style={styles.selectedIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          }
          ListFooterComponent={
            <>
              {/* Payment Options Section */}
              <View style={styles.paymentOptionsContainer}>
                <Text style={styles.sectionHeader}>เลือกวิธีการชำระเงิน</Text>
                {PAYMENT_OPTIONS.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedPaymentOption === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.paymentOptionButton,
                        isSelected && styles.paymentOptionButtonSelected,
                      ]}
                      onPress={() => setSelectedPaymentOption(option.id)}
                    >
                      <IconComponent
                        color={isSelected ? "#fff" : "#007bff"}
                        size={22}
                        style={styles.paymentIcon}
                      />
                      <Text
                        style={[
                          styles.paymentOptionText,
                          isSelected && styles.paymentOptionTextSelected,
                        ]}
                      >
                        {option.name}
                      </Text>
                      {isSelected && (
                        <CheckCircle2
                          color="#fff"
                          size={20}
                          style={styles.selectedIcon}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.footerContainer}>
                <View style={styles.totalRow}>
                  <Text style={styles.summaryText}>ค่าสินค้า:</Text>
                  <Text style={styles.summaryText}>
                    {(totalPrice - deliveryFee).toLocaleString()} บาท
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.summaryText}>
                    ค่าจัดส่ง ({selectedDeliveryOption.name}):
                  </Text>
                  <Text style={styles.summaryText}>
                    {deliveryFee.toLocaleString()} บาท
                  </Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow]}>
                  <Text style={styles.totalText}>ยอดรวมสุทธิ:</Text>
                  <Text style={styles.totalPriceText}>
                    {totalPrice.toLocaleString()} บาท
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={async () => {
                    try {
                      const orderPayload = {
                        cartItems,
                        totalPrice,
                        deliveryOption: selectedDeliveryOption,
                        paymentMethod: selectedPaymentOption,
                        deliveryLocation,
                      };
                      const newOrder = await createOrder(orderPayload);
                      clearCart(); // เคลียร์ตะกร้า
                      setLastPlacedOrder(newOrder); // Set the order in context
                      navigation.navigate("Home"); // Navigate to Home screen
                    } catch (error) {
                      console.error("Error placing order:", error);
                      alert("เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
                    }
                  }}
                >
                  <Text style={styles.checkoutButtonText}>
                    ดำเนินการชำระเงิน
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  list: { paddingHorizontal: 10, paddingTop: 10 },
  mapContainer: {
    height: 200, // ความสูงของแผนที่
    margin: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  hidden: {
    display: "none",
  },
  imagePlaceholder: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: { flex: 1, paddingHorizontal: 10, paddingTop: 0 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 15,
  },
  deliveryOptionsContainer: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  deliveryOptionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  deliveryOptionButtonSelected: {
    backgroundColor: "#007bff",
    borderColor: "#0056b3",
  },
  deliveryOptionText: { fontSize: 15, color: "#333" },
  deliveryOptionFee: { fontSize: 15, color: "#555", fontWeight: "500" },
  deliveryOptionTextSelected: { color: "#fff", fontWeight: "bold" },
  selectedIcon: {
    marginLeft: 10,
  },
  paymentOptionsContainer: {
    marginTop: 15,
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  paymentOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  paymentOptionButtonSelected: {
    backgroundColor: "#007bff",
    borderColor: "#0056b3",
  },
  paymentIcon: {
    marginRight: 10,
  },
  paymentOptionText: { fontSize: 15, color: "#333", flex: 1 },
  paymentOptionTextSelected: { color: "#fff", fontWeight: "bold" },

  cartItemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartItemImage: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
  cartItemInfo: { flex: 1, marginRight: 5 },
  cartItemName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  cartItemPrice: { fontSize: 14, color: "#007bff", marginVertical: 3 },
  cartItemNotes: { fontSize: 12, color: "#666", fontStyle: "italic" },
  quantityControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  quantityButton: { padding: 5 },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
    color: "#333",
  },
  removeButton: { padding: 5, marginLeft: 5 },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: "#6c757d",
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
    marginTop: 10,
    paddingBottom: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryText: { fontSize: 16, color: "#555" },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginBottom: 15,
  },
  totalText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  totalPriceText: { fontSize: 18, fontWeight: "bold", color: "#28a745" },
  checkoutButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  riderTrackingContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1000,
  },
  riderStatusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  riderStatusTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  riderCountdownText: {
    color: "#e0e0e0",
    fontSize: 13,
  },
  finishButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  finishButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },
});

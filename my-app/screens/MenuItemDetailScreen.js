import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  ScrollView,
} from "react-native";
import { useCart } from "../context/CartContext";

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

export default function MenuItemDetailScreen({ route, navigation }) {
  const { menuItem } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const { addToCart } = useCart();
  useLayoutEffect(() => {
    navigation.setOptions({ title: menuItem.name });
  }, [navigation, menuItem.name]);

  const handleIncreaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const handleAddToCart = () => {
    addToCart(menuItem, quantity, notes);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <ImageWithPlaceholder
          source={{ uri: menuItem.image }}
          style={styles.menuItemImageLarge}
        />

        <Text style={styles.itemName}>{menuItem.name}</Text>
        <Text style={styles.itemPrice}>
          {menuItem.price.toLocaleString()} บาท
        </Text>

        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>จำนวน</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>หมายเหตุ (ถ้ามี)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย"
            value={notes}
            onChangeText={setNotes}
            multiline={true} // อนุญาตให้ขึ้นบรรทัดใหม่ได้
            numberOfLines={4}
          />
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={handleAddToCart}
      >
        <Text style={styles.addToCartButtonText}>
          เพิ่มลงตะกร้า ({quantity * menuItem.price} บาท)
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  imagePlaceholder: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemImageLarge: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: "cover",
  },
  itemName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  itemPrice: { fontSize: 20, color: "#007bff", marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#444",
  },
  quantityContainer: { marginBottom: 20 },
  quantityControl: { flexDirection: "row", alignItems: "center" },
  quantityButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  quantityButtonText: { fontSize: 24, color: "#333" },
  quantityText: { fontSize: 20, fontWeight: "bold", color: "#333" },
  notesContainer: { marginBottom: 20 },
  notesInput: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addToCartButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    alignItems: "center",
  },
  addToCartButtonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
});

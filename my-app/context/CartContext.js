import React, { createContext, useState, useContext, useMemo } from "react";

export const DELIVERY_OPTIONS = {
  PRIORITY: { id: "priority", name: "Priority (< 20 min)", fee: 50 },
  STANDARD: { id: "standard", name: "Standard (20 min)", fee: 30 },
  SAVER: { id: "saver", name: "Saver (30 min)", fee: 15 },
};

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(
    DELIVERY_OPTIONS.STANDARD
  );
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  const addToCart = (item, quantity, notes) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.notes === notes
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [
          ...prevItems,
          { ...item, quantity, notes, uniqueId: Date.now().toString() },
        ];
      }
    });
  };

  const removeFromCart = (itemUniqueId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.uniqueId !== itemUniqueId)
    );
  };

  const updateItemQuantity = (itemUniqueId, newQuantity) => {
    setCartItems(
      (prevItems) =>
        prevItems
          .map((item) =>
            item.uniqueId === itemUniqueId
              ? { ...item, quantity: newQuantity }
              : item
          )
          .filter((item) => item.quantity > 0)
    );
  };

  const updateDeliveryOption = (optionId) => {
    const newOption =
      Object.values(DELIVERY_OPTIONS).find((opt) => opt.id === optionId) ||
      DELIVERY_OPTIONS.STANDARD;
    setSelectedDeliveryOption(newOption);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    const itemsTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return itemsTotal + selectedDeliveryOption.fee;
  }, [cartItems, selectedDeliveryOption]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    selectedDeliveryOption,
    updateDeliveryOption,
    totalItems,
    totalPrice,
    deliveryFee: selectedDeliveryOption.fee,
    lastPlacedOrder,
    setLastPlacedOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import RestaurantDetailScreen from "./screens/RestaurantDetailScreen";
import MenuItemDetailScreen from "./screens/MenuItemDetailScreen";
import CartScreen from "./screens/CartScreen";
import { CartProvider } from "./context/CartContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RestaurantDetail"
            component={RestaurantDetailScreen}
          />
          <Stack.Screen
            name="MenuItemDetail"
            component={MenuItemDetailScreen}
          />
          <Stack.Screen name="Cart" component={CartScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </CartProvider>
  );
}

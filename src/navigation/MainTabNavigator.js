import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Browse" component={HomeScreen} />
      <HomeStack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing' }} />
    </HomeStack.Navigator>
  );
}

function MessagesStackScreen() {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen name="MessagesList" component={MessagesScreen} options={{ title: 'Messages' }} />
      <MessagesStack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
    </MessagesStack.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: 'Browse' }} />
      <Tab.Screen name="SellTab" component={CreateListingScreen} options={{ title: 'Sell' }} />
      <Tab.Screen name="MessagesTab" component={MessagesStackScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

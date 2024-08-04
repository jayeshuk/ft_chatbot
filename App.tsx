import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatBot from './src/screens/Chatbot';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Chatbot') {
              iconName = 'chatbubbles-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          headerShown:false,
        })}
      >
        <Tab.Screen name="Chatbot" component={ChatBot} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

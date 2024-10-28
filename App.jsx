import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { useTheme } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginPets from './src/components/screens/LoginPets';
import GlobalProvider from './src/context/GlobalContext';
import FormUser from './src/components/screens/FormUser.jsx';
import UpdateProfile from './src/components/screens/UpdateProfile';
/* Usuario */
import ListsPetsU from './src/components/screens/ListsPets';
import UserProfile from './src/components/screens/UserProfile';
import MySolicitudPet from './src/components/screens/MySolicitudPet';
import MyAdopts from './src/components/screens/MyAdopts';

/* Administrador */
import ListsPetsA from './src/components/screens/ListsPetsA';

/* Super Usuario */
import SolicitudPets from './src/components/screens/SolicitudPets.jsx';

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const UserTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="ListsPetsU"
      shifting={true}
      activeColor={colors.primary}
      inactiveColor={colors.text}
      barStyle={{ backgroundColor: colors.background }}
    >
      <Tab.Screen
        name="ListsPetsU"
        component={ListsPetsU}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="developer-board" size={25} color={color} />
          ),
          tabBarLabel: 'Lista mascotas',
          tabBarColor: 'black',
        }}
      />
      <Tab.Screen
        name="MySolicitudPet"
        component={MySolicitudPet}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="pets" size={25} color={color} />
          ),
          tabBarLabel: 'Mis solicitudes de adopcion',
          tabBarColor: 'black',
        }}
      />
      <Tab.Screen
        name="MyAdopts"
        component={MyAdopts}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="pets" size={25} color={color} />
          ),
          tabBarLabel: 'Mis adopciones',
          tabBarColor: 'black',
        }}
      />
      <Tab.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user-circle" size={25} color={color} />
          ),
          tabBarLabel: 'Perfil',
          tabBarColor: 'black',
        }}
      />
    </Tab.Navigator>
  );
};

const InvitTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="ListsPetsU"
      shifting={true}
      activeColor={colors.primary}
      inactiveColor={colors.text}
      barStyle={{ backgroundColor: colors.background }}
    >
      <Tab.Screen
        name="ListsPetsU"
        component={ListsPetsU}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="developer-board" size={25} color={color} />
          ),
          tabBarLabel: 'Lista mascotas',
          tabBarColor: 'black',
        }}
      />
    </Tab.Navigator>
  );
};
const AdminTabs = () => {
  const { colors } = useTheme();

  return (
    <GlobalProvider>
      <Tab.Navigator
        initialRouteName="ListsPetsA"
        shifting={true}
        activeColor={colors.primary}
        inactiveColor={colors.text}
        barStyle={{ backgroundColor: colors.background }}
      >
        <Tab.Screen
          name="ListsPetsA"
          component={ListsPetsA}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="list-alt" size={25} color={color} />
            ),
            tabBarLabel: 'Lista de Mascotas',
            tabBarColor: 'black',
          }}
        />
        <Tab.Screen
          name="UserProfile"
          component={UserProfile}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user-circle" size={25} color={color} />
            ),
            tabBarLabel: 'Perfil',
            tabBarColor: 'black',
          }}
        />
      </Tab.Navigator>
    </GlobalProvider>
  );
};

const SuperTabs = () => {
  const { colors } = useTheme();

  return (
    <GlobalProvider>
      <Tab.Navigator
        initialRouteName="ListsPetsA"
        shifting={true}
        activeColor={colors.primary}
        inactiveColor={colors.text}
        barStyle={{ backgroundColor: colors.background }}
      >
        <Tab.Screen
          name="ListsPetsA"
          component={ListsPetsA}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="list-alt" size={25} color={color} />
            ),
            tabBarLabel: 'Lista de Mascotas',
            tabBarColor: 'black',
          }}
        />
        <Tab.Screen
          name="SolicitudPets"
          component={SolicitudPets}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="list-alt" size={25} color={color} />
            ),
            tabBarLabel: 'Solicitudes mascotas',
            tabBarColor: 'black',
          }}
        />
        <Tab.Screen
          name="UserProfile"
          component={UserProfile}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user-circle" size={25} color={color} />
            ),
            tabBarLabel: 'Perfil',
            tabBarColor: 'black',
          }}
        />
      </Tab.Navigator>
    </GlobalProvider>
  );
};

const App = () => {
  const [initialRoute, setInitialRoute] = useState('Inicio');

  useEffect(() => {
    const checkUserRole = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const { rol } = JSON.parse(user);
        if (rol === 'administrador') {
          setInitialRoute('AdminMain');
        } else if (rol === 'superusuario') {
          setInitialRoute('AdminMain');
        } else {
          setInitialRoute('UserMain');
        }
      }
    };

    checkUserRole();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Inicio"
          component={LoginPets}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserMain"
          component={UserTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InvitMain"
          component={InvitTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminMain"
          component={AdminTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SuperMain"
          component={SuperTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UpdatePerfil"
          component={UpdateProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FormUser"
          component={FormUser}
          options={{ headerShown: false }}
        />


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
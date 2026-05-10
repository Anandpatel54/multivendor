import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {PhoneLoginScreen} from '../screens/auth/PhoneLoginScreen';
import {OtpScreen} from '../screens/auth/OtpScreen';
import {UserProfileScreen} from '../screens/user/UserProfileScreen';
import {VendorsScreen} from '../screens/user/VendorsScreen';
import {VendorDashboardScreen} from '../screens/vendor/VendorDashboardScreen';
import {SplashScreen} from '../screens/SplashScreen';
import {UserAppointmentsScreen} from '../screens/user/UserAppointmentsScreen';
import {BookingAddressScreen} from '../screens/user/BookingAddressScreen';
import {VendorBookingsScreen} from '../screens/vendor/VendorBookingsScreen';
import {logout} from '../features/auth/authSlice';

type RootStackParamList = {
  PhoneLogin: undefined;
  Otp: undefined;
  Main: undefined;
  BookingAddress: {
    vendorId: string;
    businessName: string;
    slotTime: string;
  };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator();
const VendorDrawer = createDrawerNavigator();

type TabIconProps = {
  color: string;
  size: number;
};

function renderHomeTabIcon({color, size}: TabIconProps) {
  return <MaterialIcons name="home" size={size} color={color} />;
}

function renderProfileTabIcon({color, size}: TabIconProps) {
  return <MaterialIcons name="person" size={size} color={color} />;
}

function renderAppointmentsTabIcon({color, size}: TabIconProps) {
  return <MaterialIcons name="event-note" size={size} color={color} />;
}

function renderDrawerIcon(name: string) {
  return ({color, size}: TabIconProps) => <MaterialIcons name={name} size={size} color={color} />;
}

function VendorDrawerContent(props: any) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{flex: 1}}>
      <View style={{paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14}}>
        <Text style={{fontSize: 18, fontWeight: '700', color: '#102a43'}}>Vendor Panel</Text>
        <Text style={{marginTop: 4, color: '#486581'}}>{currentUser?.name ?? 'Vendor User'}</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={{marginTop: 'auto', paddingHorizontal: 8, paddingBottom: 12}}>
        <DrawerItem
          label="Logout"
          onPress={() => dispatch(logout())}
          icon={renderDrawerIcon('logout')}
        />
      </View>
    </DrawerContentScrollView>
  );
}

function VendorDrawerNavigator() {
  return (
    <VendorDrawer.Navigator
      drawerContent={props => <VendorDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#0d6efd',
      }}>
      <VendorDrawer.Screen
        name="Dashboard"
        component={VendorDashboardScreen}
        options={{drawerIcon: renderDrawerIcon('dashboard')}}
      />
      <VendorDrawer.Screen
        name="Bookings"
        component={VendorBookingsScreen}
        options={{drawerIcon: renderDrawerIcon('list-alt')}}
      />
      <VendorDrawer.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{drawerIcon: renderDrawerIcon('person')}}
      />
    </VendorDrawer.Navigator>
  );
}

function UserTabs() {
  return (
    <MainTab.Navigator>
      <MainTab.Screen
        name="Home"
        component={VendorsScreen}
        options={{tabBarIcon: renderHomeTabIcon}}
      />
      <MainTab.Screen
        name="Appointments"
        component={UserAppointmentsScreen}
        options={{tabBarIcon: renderAppointmentsTabIcon}}
      />
      <MainTab.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{tabBarIcon: renderProfileTabIcon}}
      />
    </MainTab.Navigator>
  );
}

function MainNavigationByRole() {
  const role = useAppSelector(state => state.auth.currentUser?.role);
  return role === 'vendor' ? <VendorDrawerNavigator /> : <UserTabs />;
}

export function AppNavigator() {
  const {isAuthenticated} = useAppSelector(state => state.auth);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <>
            <RootStack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
            <RootStack.Screen name="Otp" component={OtpScreen} />
          </>
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainNavigationByRole} />
            <RootStack.Screen name="BookingAddress" component={BookingAddressScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = ({ title }) => {
    const navigation = useNavigation();
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const checkGuestStatus = async () => {
            try {
                const guestStatus = await AsyncStorage.getItem('guest');
                setIsGuest(guestStatus === 'true');
                console.log('guestStatus:', guestStatus);  // Para depurar
                console.log('isGuest:', isGuest);  // Para depurar
            } catch (error) {
                console.error('Error al verificar el estado de invitado:', error);
            }
        };

        checkGuestStatus();

        // Agregar un listener para actualizaciones en AsyncStorage (opcional)
        const focusListener = navigation.addListener('focus', checkGuestStatus);
        return () => {
            navigation.removeListener('focus', focusListener);
        };
    }, [navigation]);

    const handleLogoPress = () => {
        console.log('isGuest:', isGuest);  // Para depurar
        if (isGuest) {
            Alert.alert(
                'Advertencia',
                '¿Deseas volver al inicio?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Ok', onPress: () => navigation.navigate('Inicio') }
                ]
            );
        } else {
            Alert.alert(
                'Advertencia',
                '¿Deseas cerrar sesión?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Ok', onPress: handleLogout }
                ]
            );
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('guest');
            navigation.navigate('Inicio');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <View style={styles.header}>
                <Image source={require('../../assets/logoOrigi.png')} style={styles.logo} />
            <Text style={styles.txtheader}>{title}</Text>
            <TouchableOpacity onPress={handleLogoPress}>
                <Text style={styles.closeButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingRight: 30,
        borderBottomColor: 'black',
        borderBottomWidth: 2,
        marginHorizontal: 20,
    },
    logo: {
        width: 80,
        height: 65,
        marginBottom: 10,
    },
    txtheader: {
        fontSize: 24,
        textAlign: 'center',
        color: 'black',
        fontWeight: '700',
    },
    closeButtonText: {
        display: "flex",
        fontSize: 13,
        color: 'black',
        fontWeight: '600',
        marginTop: -40,
        backgroundColor: '#FF6347',
        paddingVertical: 5,
        paddingHorizontal: 2,
        borderRadius: 8, 
        elevation: 3,
    },
});

export default Header;

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';  // Nuevo paquete de iconos
import axiosClient from '../client/axiosClient';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../organismos/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfile = ({ navigation }) => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfileData = async () => {
        try {
            const userString = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token'); 

            if (!userString || !token) {
                console.error("No se encontraron datos de usuario o token en AsyncStorage");
                setLoading(false);
                return;
            }

            const user = JSON.parse(userString);
            const id_usuario = user.id_usuario;

            const response = await axiosClient.get(`/usuarios/perfil/${id_usuario}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                const data = response.data[0];
                setProfileData(data);
            } else {
                console.error(response.data.message);
            }
        } catch (error) {
            console.error("Error al obtener los datos del perfil:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfileData();
        }, [])
    );

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('user'); 
            await AsyncStorage.removeItem('token'); 
            Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
            navigation.navigate('Inicio');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1D3557" />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error al cargar los datos del perfil</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="Mi Perfil" />
            <TouchableOpacity style={styles.profileSection}>
                {profileData.img ? (
                    <Image
                        source={{ uri: profileData.img }}
                        style={styles.profileImage}
                    />
                ) : (
                    <MaterialIcons name="person-outline" size={140} style={styles.iconProfile} />
                )}
                <Text style={styles.nameProfile}>{profileData.nombre}</Text>
            </TouchableOpacity>
            <View style={styles.profileDetails}>
                <View style={styles.detailRow}>
                    <MaterialIcons name="badge" size={24} style={styles.icon} />
                    <Text style={styles.detailText}>{profileData.rol}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialIcons name="account-circle" size={24} style={styles.icon} />
                    <Text style={styles.detailText}>{`${profileData.nombre} ${profileData.apellido}`}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialIcons name="email" size={24} style={styles.icon} />
                    <Text style={[styles.detailText, styles.emailText]}>{profileData.correo}</Text>
                </View>
            </View>
            <View style={styles.profileActions}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('UpdatePerfil', { profileData })}
                >
                    <Text style={styles.buttonText}>Editar Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <Text style={styles.buttonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#E9ECEF',
    },
    /* Sección del perfil */
    profileSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    profileImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 3,
        borderColor: '#1D3557',
    },
    iconProfile: {
        color: '#457B9D',
    },
    nameProfile: {
        fontSize: 26,
        fontWeight: '600',
        color: '#1D3557',
        marginTop: 15,
    },
    /* Detalles del perfil */
    profileDetails: {
        marginVertical: 20,
        paddingHorizontal: 15,
        backgroundColor: '#A8DADC',
        paddingVertical: 10,
        borderRadius: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    detailText: {
        fontSize: 18,
        marginLeft: 10,
        color: '#1D3557',
        fontWeight: '500',
    },
    emailText: {
        textDecorationLine: 'underline',
    },
    icon: {
        color: '#1D3557',
    },
    /* Acciones del perfil */
    profileActions: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        backgroundColor: '#457B9D',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    logoutButton: {
        backgroundColor: '#E63946',
    },
    buttonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    /* Cargando y error */
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1FAEE',
    },
    loadingText: {
        marginTop: 10,
        color: '#1D3557',
        fontSize: 18,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1FAEE',
    },
    errorText: {
        color: '#E63946',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default UserProfile;

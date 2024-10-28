import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import EstadoModal from '../organismos/EstadoModal';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../client/axiosClient';
import Icon from 'react-native-vector-icons/FontAwesome';
import ListEstado from '../moleculas/ListEstado';

const LoginPets = () => {
    const navigation = useNavigation();

    const ChangePassword = () => {
        navigation.navigate('solicitar_recuperacion');
    }

    const [formData, setFormData] = useState({
        correo: '',
        password: '',
    });
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                Alert.alert('Sin conexión', 'Por favor, verifica tu conexión a internet.');
            }
        });
        return () => unsubscribe();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            setFormData({ correo: '', password: '' });
        }, [])
    );

    const handleInputChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const { correo, password } = formData;
        if (!correo || !password) {
            Alert.alert('Error', 'Por favor, completa todos los campos.');
            return false;
        }
        return true;
    };

    const Validacion = async () => {
        if (!validateForm()) return;

        try {
            const response = await axiosClient.post('/validacion', formData);

            if (response.status === 200) {
                const { token, user } = response.data;

                const userInfo = Array.isArray(user) ? user[0] : user;
                if (!userInfo) {
                    Alert.alert('Error', 'No se encontró la información del usuario.');
                    return;
                }

                await AsyncStorage.setItem('token', token);
                await AsyncStorage.setItem('user', JSON.stringify(userInfo));

                // Elimina el estado de invitado
                await AsyncStorage.removeItem('guest');

                const userRol = userInfo.rol;

                if (userRol === 'usuario') {
                    Alert.alert('Bienvenido Usuario.');
                    navigation.navigate('UserMain');
                } else if (userRol === 'administrador') {
                    Alert.alert('Bienvenido Administrador.');
                    navigation.navigate('AdminMain');
                } else if (userRol === 'superusuario') {
                    Alert.alert('Bienvenido Super Usuario.');
                    navigation.navigate('SuperMain');
                } else {
                    Alert.alert('Error', 'Usuario no autorizado.');
                }

            } else {
                Alert.alert('Error', 'Usuario no autorizado.');
            }
        } catch (error) {
            /* console.error('Error durante la validación:', error); */
            Alert.alert('Error', 'Credenciales incorrectas.');
        }
    };


    const EntrarComoInvitado = async () => {
        await AsyncStorage.setItem('guest', 'true');
        Alert.alert('Entrando como invitado.');
        navigation.navigate('InvitMain');
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <Text style={styles.title}>INICIAR SESIÓN</Text>
                <Image source={require('../../assets/logoprueba.png')} style={styles.logo} />

                <TextInput
                    placeholder="Ingrese su Correo Electronico"
                    style={styles.input}
                    placeholderTextColor="#666"
                    value={formData.correo}
                    onChangeText={(text) => handleInputChange('correo', text)}
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Ingrese su Contraseña"
                        placeholderTextColor="#666"
                        value={formData.password}
                        onChangeText={(text) => handleInputChange('password', text)}
                        secureTextEntry={secureTextEntry}
                    />
                    <TouchableOpacity
                        style={styles.eyeIconContainer}
                        onPress={toggleSecureEntry}
                    >
                        <Icon
                            name={secureTextEntry ? 'eye-slash' : 'eye'}
                            size={20}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>
                {/* <TouchableOpacity style={styles.forgotPasswordButton} onPress={ChangePassword}>
                    <Text style={styles.forgotPasswordText}>¿OLVIDASTE LA CONTRASEÑA?</Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={styles.button} onPress={Validacion}>
                    <Text style={styles.buttonText}>Iniciar sesión</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FormUser')}>
                    <Text style={styles.buttonText}>Registrate!</Text>
                </TouchableOpacity>
                <Text style={styles.linkText} onPress={EntrarComoInvitado}>
                    Entrar como Invitado
                </Text>
            </View>
            <View style={{padding:23}}>
            <ListEstado/> 
            </View>
               
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 70,
        color: '#000',
    },
    logo: {
        width: 200,
        height: 250,
        marginTop: 15,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        color: '#000',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    inputPassword: {
        height: 50,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        paddingHorizontal: 10,
        color: '#000',
        width: '100%',
    },
    eyeIconContainer: {
        position: 'absolute',
        right: 10,
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 15,
        width: 180,
        height: 60,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    linkText: {
        color: 'black',
        fontSize: 16,
        marginTop: 20,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    forgotPasswordButton: {
        marginTop: 10,
      },
      
      forgotPasswordText: {
        color: '#000',
        fontSize: 16,
        textDecorationLine: 'underline',
        textAlign: 'left',
      },
});

export default LoginPets;

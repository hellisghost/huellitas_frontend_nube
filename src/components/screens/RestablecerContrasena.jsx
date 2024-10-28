import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axiosClient from '../client/axiosClient'; // Asegúrate de que esta ruta sea correcta
import Icon from 'react-native-vector-icons/FontAwesome';

const RestablecerContraseña = ({ navigation }) => {
    
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    const handlePasswordSubmit = async () => {
        if (!password) {
            return Alert.alert('Alerta', 'El campo de nueva contraseña es obligatorio');
        }

        try {
            const response = await axiosClient.post('/usuarios/reset-password', { correo, password });
            console.log('Contraseña restablecida con éxito:', response.data);
            Alert.alert('Éxito', response.data.message);
            navigation.navigate('Inicio');  // Redirigir al inicio de sesión o página principal
        } catch (error) {
            console.error('Error al restablecer la contraseña:', error.response.data.message);
            Alert.alert('Error', error.response.data.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Restablecer Contraseña</Text>

            <View style={styles.passwordContainer}>
                <TextInput
                    placeholder="Ingrese su nueva contraseña"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    placeholderTextColor="#666"
                    secureTextEntry={secureTextEntry} // Aplicamos la visibilidad dinámica
                />
                <TouchableOpacity style={styles.eyeIconContainer} onPress={toggleSecureEntry}>
                    <Icon
                        name={secureTextEntry ? 'eye-slash' : 'eye'}
                        size={20}
                        color="orange"
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handlePasswordSubmit}>
                <Text style={styles.buttonText}>Restablecer Contraseña</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
        textAlign: 'center',
        marginTop: 150,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#57BF4F',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        color: '#000',
    },
    button: {
        backgroundColor: '#00CC00',
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 20,
        width: 180,
        height: 60,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    eyeIconContainer: {
        position: 'absolute',
        right: 10,
    }
});

export default RestablecerContraseña;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axiosClient from '../client/axiosClient'; // Asegúrate de que esta ruta sea correcta

const SolicitarRecuperacion = ({ navigation }) => {
    const [correo, setCorreo] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const handleCorreoSubmit = async () => {
        if (!correo) {
            return Alert.alert('El campo de correo electrónico es obligatorio');
        }

        try {
            const response = await axiosClient.post('/usuarios/solicitar-reset-password', { correo });
            console.log('Correo enviado con éxito:', response.data);
            Alert.alert('Éxito', response.data.message);

            // Extraer el token de la respuesta (esto depende de tu API)
            const token = response.data.token;

            // Navegar a la pantalla de restablecer contraseña pasando el token
            navigation.navigate('restablecer_contrasena', { token });
        } catch (error) {
            console.error('Error al enviar el correo:', error.response.data.message);
            Alert.alert('Error', error.response.data.message);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axiosClient.post('/usuarios/update-password', { correo, password });
            Swal.fire('Éxito', response.data.message, 'success');
        } catch (error) {
            Swal.fire('Error', error.response.data.message, 'error');
        }
    };



    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ingrese su correo para recuperar la contraseña</Text>

            {!showPasswordForm ? (
                <View>
                    <TextInput
                        placeholder="Ingrese su correo electrónico"
                        value={correo}
                        onChangeText={setCorreo}
                        style={styles.input}
                        placeholderTextColor="#666"
                        keyboardType="email-address"
                    />
                    <TouchableOpacity style={styles.button} onPress={handleCorreoSubmit}>
                        <Text style={styles.buttonText}>Enviar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.container}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nueva Contraseña:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingresa tu nueva contraseña"
                            secureTextEntry
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handlePasswordSubmit}>
                        <Text style={styles.buttonText}>Guardar Contraseña</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        // backgroundColor: '#fff',
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
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A4A4A',
        marginBottom: 8,
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
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    }
});

export default SolicitarRecuperacion;

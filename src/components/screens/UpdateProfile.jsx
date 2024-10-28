import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    TextInput, 
    Alert, 
    ScrollView 
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { launchImageLibrary } from 'react-native-image-picker';
import axiosClient from '../client/axiosClient';
import Header from '../organismos/Header';
import { Formik } from 'formik';
import * as yup from 'yup';
import moment from 'moment';

// Esquema de validación con yup
const validationSchema = yup.object().shape({
    tipo_documento: yup
        .string()
        .required('El tipo de documento es obligatorio'),
    documento_identidad: yup
        .string()
        .required('El documento de identidad es obligatorio')
        .matches(/^\d+$/, 'El documento de identidad debe ser numérico')
        .min(6, 'El documento de identidad debe contener como mínimo 6 dígitos')
        .max(10, 'El documento de identidad debe contener como máximo 10 dígitos'),
    nombre: yup
        .string()
        .required('El nombre es obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,20}$/, 'El nombre debe tener máximo 20 caracteres, y solo puede contener letras y espacios'),
    apellido: yup
        .string()
        .required('El apellido es obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,20}$/, 'El apellido debe tener máximo 20 caracteres, y solo puede contener letras y espacios'),
    direccion: yup
        .string()
        .required('La dirección es obligatoria'),
    correo: yup
        .string()
        .email('El correo electrónico debe ser válido')
        .required('El correo electrónico es obligatorio'),
    telefono: yup
        .string()
        .required('El teléfono es obligatorio')
        .matches(/^\d+$/, 'El teléfono debe ser numérico')
        .length(10, 'El teléfono debe contener exactamente 10 dígitos'),
    password: yup
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(16, 'La contraseña no puede tener más de 16 caracteres')
        .required('La contraseña es obligatoria'),
});

const UpdateProfile = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [foto, setFoto] = useState(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [razasPorCategoria, setRazasPorCategoria] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState([]);

    // Funciones para cargar datos
    const fetchCategorias = async () => {
        try {
            const response = await axiosClient.get('/categorias/listar');
            const categoriasActivas = response.data.filter(cate => cate.estado === 'activa');
            setCategorias(categoriasActivas);
        } catch (error) {
            console.error('Error al obtener las categorías:', error);
            Alert.alert('Error', 'No se pudieron cargar las categorías.');
        }
    };

    const fetchDepartamentos = async () => {
        try {
            const response = await axiosClient.get('/departamentos/listar');
            setDepartamentos(response.data);
        } catch (error) {
            console.error('Error al obtener los departamentos:', error);
            Alert.alert('Error', 'No se pudieron cargar los departamentos.');
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const user = await AsyncStorage.getItem('user');
                const id_usuario = JSON.parse(user).id_usuario;
                const response = await axiosClient.get(`/usuarios/perfil/${id_usuario}`, {
                    headers: { token: token }
                });
                if (response.status === 200) {
                    const userProfile = response.data[0];
                    setUserData(userProfile);
                    const imageUrl = userProfile.img
                        ? `${axiosClient.defaults.baseURL}/uploads/${userProfile.img}`
                        : null;
                    console.log('Foto URL:', imageUrl); // Verifica el URL de la imagen
                    setFotoUrl(imageUrl);
                } else {
                    Alert.alert("Error", response.data.message);
                }
            } catch (error) {
                Alert.alert("Error", "Error al obtener los datos del perfil: " + error.message);
            }
        };

        fetchProfileData();
        fetchCategorias();
        fetchDepartamentos();
    }, []);

    // Funciones para cargar razas y municipios según selección
    const loadRazasPorCategoria = async (categoriaId) => {
        try {
            const response = await axiosClient.get(`/razas/listarrazas/${categoriaId}`);
            setRazasPorCategoria(response.data);
        } catch (error) {
            console.error('Error al obtener las razas:', error);
            Alert.alert('Error', 'No se pudieron cargar las razas.');
        }
    };

    const loadMunicipiosPorDepartamento = async (departamentoId) => {
        try {
            const response = await axiosClient.get(`/municipios/listardepartamento/${departamentoId}`);
            setMunicipiosPorDepartamento(response.data);
        } catch (error) {
            console.error('Error al obtener los municipios:', error);
            Alert.alert('Error', 'No se pudieron cargar los municipios.');
        }
    };

    // Manejadores de cambio de selección
    const handleCategoriaChange = (value, setFieldValue) => {
        setFieldValue('tipo_documento', value);
        loadRazasPorCategoria(value);
    };

    const handleDepartamentoChange = (value, setFieldValue) => {
        setFieldValue('fk_id_departamento', value);
        loadMunicipiosPorDepartamento(value);
    };

    // Manejo de imágenes
    const handleImageChange = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 1,
            });

            if (!result.didCancel && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                setFoto(selectedImage);
                setFotoUrl(selectedImage.uri);
            }
        } catch (error) {
            console.log('Error al seleccionar la imagen:', error);
            Alert.alert('Error', 'Hubo un problema al seleccionar la imagen.');
        }
    };

    // Manejo de guardado de datos
    const handleSave = async (values) => {
        try {
            const id_usuario = userData.id_usuario;
            const updatedValues = { ...values };
            console.log("Id usuario: ", id_usuario);
            console.log("Datos a actualizar: ", updatedValues); // Log de los datos a enviar

            // Si la contraseña sigue siendo los 8 asteriscos, no la enviamos al backend
            if (values.password === '********') {
                delete updatedValues.password;
            }

            // Crear un objeto FormData
            const formData = new FormData();
            formData.append('nombre', updatedValues.nombre);
            formData.append('apellido', updatedValues.apellido);
            formData.append('correo', updatedValues.correo);
            formData.append('telefono', updatedValues.telefono);
            formData.append('direccion', updatedValues.direccion);
            formData.append('tipo_documento', updatedValues.tipo_documento);
            formData.append('documento_identidad', updatedValues.documento_identidad);
            formData.append('rol', updatedValues.rol);

            if (updatedValues.password) {
                formData.append('password', updatedValues.password); // Enviar la nueva contraseña
            } 

            // Si se seleccionó una nueva foto, añadirla al FormData
            if (foto) {
                formData.append('img', {
                    uri: foto.uri,
                    name: foto.fileName || 'photo.jpg', // Asignar un nombre por defecto
                    type: foto.type || 'image/jpeg', // Asignar un tipo por defecto
                });
            }

            const response = await axiosClient.put(`/usuarios/actualizar/${id_usuario}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Asegurarse de que el tipo de contenido sea multipart/form-data
                },
            });
            console.log("Respuesta del servidor: ", response.data); // Log de la respuesta

            if (response.status === 200) {
                Alert.alert("Éxito", response.data.message);
                navigation.navigate('UserProfile', { refresh: true });
            } else {
                Alert.alert("Error", response.data.message);
            }
        } catch (error) {
            Alert.alert("Error", "Error al actualizar los datos: " + error.message);
            console.log("Error al actualizar: ", error.message);
        }
    };

    if (!userData) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="Perfil de Usuario" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TouchableOpacity style={styles.avatarContainer} onPress={handleImageChange}>
                    {fotoUrl ? (
                        <Image
                            source={{ uri: fotoUrl }}
                            style={styles.avatar}
                        />
                    ) : (
                        <FontAwesome name="user-circle-o" size={100} style={styles.iconPlaceholder} />
                    )}
                </TouchableOpacity>

                <Formik
                    initialValues={{
                        nombre: userData.nombre || '',
                        apellido: userData.apellido || '',
                        correo: userData.correo || '',
                        telefono: userData.telefono || '',
                        direccion: userData.direccion || '',
                        tipo_documento: userData.tipo_documento || '',
                        documento_identidad: userData.documento_identidad || '',
                        password: '********',  // Muestra 8 asteriscos por defecto
                        rol: userData.rol || ''
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => handleSave(values)}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                        <>
                            {/* Nombre */}
                            <View style={styles.formGroup}>
                                <FontAwesome name="user" size={20} color="#333" style={styles.iconLeft} />
                                <TextInput
                                    style={[styles.input, touched.nombre && errors.nombre ? styles.inputError : null]}
                                    placeholder="Nombre"
                                    placeholderTextColor="black"
                                    value={values.nombre}
                                    onChangeText={handleChange('nombre')}
                                    onBlur={handleBlur('nombre')}
                                />
                            </View>
                            {touched.nombre && errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

                            {/* Apellido */}
                            <View style={styles.formGroup}>
                                <FontAwesome name="user" size={20} color="#333" style={styles.iconLeft} />
                                <TextInput
                                    style={[styles.input, touched.apellido && errors.apellido ? styles.inputError : null]}
                                    placeholder="Apellido"
                                    placeholderTextColor="black"
                                    value={values.apellido}
                                    onChangeText={handleChange('apellido')}
                                    onBlur={handleBlur('apellido')}
                                />
                            </View>
                            {touched.apellido && errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}

                            {/* Correo Electrónico */}
                            <View style={styles.formGroup}>
                                <FontAwesome name="envelope" size={20} color="#333" style={styles.iconLeft} />
                                <TextInput
                                    style={[styles.input, touched.correo && errors.correo ? styles.inputError : null]}
                                    placeholder="Correo Electrónico"
                                    placeholderTextColor="black"
                                    value={values.correo}
                                    onChangeText={handleChange('correo')}
                                    onBlur={handleBlur('correo')}
                                    keyboardType="email-address"
                                />
                            </View>
                            {touched.correo && errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}

                            {/* Teléfono */}
                            <View style={styles.formGroup}>
                                <FontAwesome name="phone" size={20} color="#333" style={styles.iconLeft} />
                                <TextInput
                                    style={[styles.input, touched.telefono && errors.telefono ? styles.inputError : null]}
                                    placeholder="Teléfono"
                                    placeholderTextColor="black"
                                    value={values.telefono}
                                    onChangeText={handleChange('telefono')}
                                    onBlur={handleBlur('telefono')}
                                    keyboardType="numeric"
                                />
                            </View>
                            {touched.telefono && errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}

                            {/* Dirección */}
                            <View style={styles.formGroup}>
                                <FontAwesome name="home" size={20} color="#333" style={styles.iconLeft} />
                                <TextInput
                                    style={[styles.input, touched.direccion && errors.direccion ? styles.inputError : null]}
                                    placeholder="Dirección"
                                    placeholderTextColor="black"
                                    value={values.direccion}
                                    onChangeText={handleChange('direccion')}
                                    onBlur={handleBlur('direccion')}
                                />
                            </View>
                            {touched.direccion && errors.direccion && <Text style={styles.errorText}>{errors.direccion}</Text>}

                            {/* Tipo de Documento */}
                            <View style={styles.formGroup}>
                                <FontAwesome name="id-card" size={20} color="#333" style={styles.iconLeft} />
                                <RNPickerSelect
                                    onValueChange={(value) => {
                                        setFieldValue('tipo_documento', value);
                                    }}
                                    items={[
                                        { label: 'Tarjeta', value: 'tarjeta' },
                                        { label: 'Cédula', value: 'cedula' },
                                        { label: 'Tarjeta de Extranjería', value: 'tarjeta de extranjeria' },
                                    ]}
                                    placeholder={{ label: 'Seleccionar Tipo de Documento', value: null }}
                                    value={values.tipo_documento}
                                    style={pickerSelectStyles}
                                    useNativeAndroidPickerStyle={false}
                                    Icon={() => {
                                        return <FontAwesome name="angle-down" size={20} color="#333" style={styles.iconRight} />;
                                    }}
                                />
                            </View>
                            {touched.tipo_documento && errors.tipo_documento && <Text style={styles.errorText}>{errors.tipo_documento}</Text>}

                            {/* Documento de Identidad */}
                            <View style={styles.formGroup}>
                                <FontAwesome name="id-card" size={20} color="#333" style={styles.iconLeft} />
                                <TextInput
                                    style={[styles.input, touched.documento_identidad && errors.documento_identidad ? styles.inputError : null]}
                                    placeholder="Documento de Identidad"
                                    placeholderTextColor="black"
                                    value={values.documento_identidad}
                                    onChangeText={handleChange('documento_identidad')}
                                    onBlur={handleBlur('documento_identidad')}
                                    keyboardType="numeric"
                                />
                            </View>
                            {touched.documento_identidad && errors.documento_identidad && <Text style={styles.errorText}>{errors.documento_identidad}</Text>}

                            {/* Contraseña */}
                            <View style={styles.formGroup}>
                                <FontAwesome name="lock" size={20} color="#333" style={styles.iconLeft} />
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, styles.passwordInput, touched.password && errors.password ? styles.inputError : null]}
                                        placeholder="Contraseña"
                                        placeholderTextColor="black"
                                        value={values.password}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        secureTextEntry={!showPassword} // Alternar visibilidad
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <FontAwesome
                                            name={showPassword ? 'eye' : 'eye-slash'}
                                            size={20}
                                            color="black"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                            {/* Botón de Guardar */}
                            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </Formik>
            </ScrollView>
        </View>
    );
};
    // Estilos personalizados y completamente nuevos
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#b5b5b5',
        },
        scrollContainer: {
            padding: 20,
        },
        avatarContainer: {
            alignItems: 'center',
            marginVertical: 20,
        },
        avatar: {
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 3,
            borderColor: 'black',
        },
        iconPlaceholder: {
            color: 'white',
        },
        formGroup: {
            marginBottom: 20,
        },
        input: {
            flex: 1,
            height: 50,
            paddingLeft: 10,
            paddingRight: 40,
            borderWidth: 1,
            borderColor: 'black',
            borderRadius: 25,
            backgroundColor: 'white',
            color: 'black',
            fontSize: 16,
        },
        passwordContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            position: 'relative',
        },
        passwordInput: {
            flex: 1,
        },
        iconLeft: {
            position: 'absolute',
            left: 15,
            zIndex: 1,
        },
        iconRight: {
            position: 'absolute',
            right: 15,
            zIndex: 1,
        },
        inputError: {
            borderColor: '#E74C3C',
        },
        errorText: {
            color: '#E74C3C',
            fontSize: 12,
            marginTop: 5,
            marginLeft: 45,
        },
        saveButton: {
            backgroundColor: 'black',
            paddingVertical: 15,
            borderRadius: 30,
            alignItems: 'center',
            shadowColor: 'white',
            shadowOffset: {
                width: 0,
                height: 10,
            },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 5,
            marginTop: 10,
        },
        saveButtonText: {
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
        },
    });

    // Estilos para el RNPickerSelect
    const pickerSelectStyles = StyleSheet.create({
        inputIOS: {
            fontSize: 16,
            paddingVertical: 15,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: 'black',
            borderRadius: 25,
            color: '#fff',
            paddingRight: 40, // espacio para el icono
            backgroundColor: 'white',
        },
        inputAndroid: {
            fontSize: 16,
            paddingHorizontal: 10,
            paddingVertical: 15,
            borderWidth: 1,
            borderColor: 'white',
            borderRadius: 25,
            color: 'black',
            paddingRight: 40, // espacio para el icono
            backgroundColor: 'white',
        },
        iconContainer: {
            top: 15,
            right: 10,
        },
    });

    export default UpdateProfile;

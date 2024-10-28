import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import axiosClient from '../client/axiosClient.js';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
    nombre_mascota: yup
        .string()
        .required('El nombre_mascota es obligatorio')
        .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{1,20}$/, 'El nombre de la mascota debe tener máximo 20 caracteres, y solo puede contener letras y espacios'),
    fecha_nacimiento: yup
        .string()
        .matches(
            /^\d{4}-\d{2}-\d{2}$/,
            'La fecha debe estar en el formato YYYY-MM-DD'
        )
        .required('La fecha de nacimiento es obligatoria')
        .test('is-valid-date', 'La fecha no es válida', value => {
            const date = new Date(value);
            return date instanceof Date && !isNaN(date);
        })
        .max(new Date(), 'La fecha no puede ser futura'),
    estado: yup
        .string()
        .required('El estado es obligatorio'),
    descripcion: yup
        .string()
        .max(300, 'Máximo 300 caracteres')
        .required('La descripción es obligatoria'),
    esterilizacion: yup
        .string()
        .required('Especifica si la mascota está esterilizada'),
    tamano: yup
        .string()
        .required('El tamaño es obligatorio'),
    peso: yup
        .string()
        .matches(/^[0-9]+$/, 'El peso debe ser un número entero, aproxime el peso de la mascota')
        .max(200, 'El peso no puede ser mayor a 200')
        .required('El peso es obligatorio'),
    fk_id_categoria: yup
        .string()
        .required('La categoría es obligatoria'),
    fk_id_raza: yup
        .string()
        .required('La raza es obligatoria'),
    fk_id_departamento: yup
        .string()
        .required('El departamento es obligatorio'),
    fk_id_municipio: yup
        .string()
        .required('El municipio es obligatorio'),
    sexo: yup
        .string()
        .required('El sexo es obligatorio'),
    imagenes: yup
        .array()
        .min(1, 'Debe seleccionar al menos una imagen')
        .required('Debe seleccionar al menos una imagen'),
});

const FormMascotas = ({ mode, handleSubmit, onClose, actionLabel, initialData }) => {

    const [categoria, setCategoria] = useState([]);
    const [raza, setRaza] = useState([]);
    const [departamento, setDepartamento] = useState([]);
    const [municipio, setMunicipio] = useState([]);

    const [fotos, setFotos] = useState([null, null, null, null]);
    const [fotoUrl, setFotoUrl] = useState([null, null, null, null]);
    const [imagenesExistentes, setImagenesExistentes] = useState([]);

    useEffect(() => {
        axiosClient.get('/razas/listar').then((response) => setRaza(response.data));
        axiosClient.get('/municipios/listar').then((response) => setMunicipio(response.data));
    }, []);

    const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState([]);
    const [razasPorCategoria, setRazasPorCategoria] = useState([]);

    useEffect(() => {
        axiosClient.get('/departamentos/listar').then((response) => setDepartamento(response.data));
    }, []);

    useEffect(() => {
        axiosClient.get('/categorias/listar').then((response) => {
            const categoriasFilter = response.data.filter(cate => cate.estado === 'activa');
            setCategoria(categoriasFilter);
        });
    }, []);

    const formik = useFormik({
        initialValues: {
            nombre_mascota: '',
            fecha_nacimiento: '',
            estado: '',
            descripcion: '',
            esterilizacion: '',
            tamano: '',
            peso: '',
            fk_id_categoria: '',
            fk_id_raza: '',
            fk_id_departamento: '',
            fk_id_municipio: '',
            sexo: '',
            imagenes: [],
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                formData.append('nombre_mascota', values.nombre_mascota);
                formData.append('fecha_nacimiento', values.fecha_nacimiento);
                formData.append('estado', values.estado);
                formData.append('descripcion', values.descripcion);
                formData.append('esterilizado', values.esterilizacion); // Cambio aquí
                formData.append('tamano', values.tamano);
                formData.append('peso', values.peso);
                formData.append('fk_id_categoria', values.fk_id_categoria);
                formData.append('fk_id_raza', values.fk_id_raza);
                formData.append('fk_id_departamento', values.fk_id_departamento);
                formData.append('fk_id_municipio', values.fk_id_municipio);
                formData.append('sexo', values.sexo);

                // Agregar imágenes nuevas
                fotos.forEach((foto, index) => {
                    if (foto) {
                        formData.append('imagenes', {
                            uri: foto.uri,
                            type: foto.type || 'image/jpeg',
                            name: foto.fileName || `photo_${index}.jpg`,
                        });
                    }
                });

                // Agregar imágenes existentes si está en modo actualización
                if (mode === 'update' && imagenesExistentes.length > 0) {
                    imagenesExistentes.forEach((imagen, index) => {
                        formData.append('imagenesExistentes[]', imagen);
                    });
                }

                await handleSubmit(formData);
            } catch (error) {
                console.error('Error al construir FormData:', error);
                Alert.alert('Error', 'Hubo un problema al preparar los datos para el registro.');
            }
        }
    });

    const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

    useEffect(() => {
        if (mode === 'update' && initialData) {
            const fecha = initialData.fecha_nacimiento ? initialData.fecha_nacimiento.split('T')[0] : '';
            const peso = initialData.peso ? Math.trunc(parseFloat(initialData.peso)).toString() : '';
            const imagenesArray = initialData.imagenes ? initialData.imagenes.split(',') : [];

            setImagenesExistentes(imagenesArray);

            const fotoUrls = imagenesArray.map(imagen => imagen ? `${axiosClient.defaults.baseURL}/uploads/${imagen}` : null);
            setFotoUrl([...fotoUrls, ...Array(4 - fotoUrls.length).fill(null)]);

            formik.setValues({
                nombre_mascota: initialData.nombre_mascota || '',
                fecha_nacimiento: fecha || '',
                estado: initialData.estado || 'En Adopcion',
                descripcion: initialData.descripcion || '',
                esterilizacion: initialData.esterilizado || '',
                tamano: initialData.tamano || '',
                peso: peso || '',
                fk_id_categoria: initialData.fk_id_categoria || '',
                fk_id_raza: initialData.fk_id_raza || '',
                fk_id_departamento: initialData.fk_id_departamento || '',
                fk_id_municipio: initialData.fk_id_municipio || '',
                sexo: initialData.sexo || '',
                imagenes: imagenesArray.filter(imagen => imagen !== null),
            });

            // Cargar razas y municipios basados en la categoría y departamento inicial
            loadRazasPorCategoria(initialData.fk_id_categoria);
            loadMunicipiosPorDepartamento(initialData.fk_id_departamento);
        }
    }, [mode, initialData]);

    const loadRazasPorCategoria = async (categoriaId) => {
        try {
            const response = await axiosClient.get(`/razas/listarrazas/${categoriaId}`);
            setRazasPorCategoria(response.data);
        } catch (error) {
            console.error('Error al obtener las razas:', error);
        }
    };

    const loadMunicipiosPorDepartamento = async (departamentoId) => {
        try {
            const response = await axiosClient.get(`/municipios/listardepartamento/${departamentoId}`);
            setMunicipiosPorDepartamento(response.data);
        } catch (error) {
            console.error('Error al obtener los municipios:', error);
        }
    };

    const handleDepartamentoChange = async (departamentoId) => {
        formik.setFieldValue('fk_id_departamento', departamentoId);

        if (departamentoId) {
            loadMunicipiosPorDepartamento(departamentoId);
        } else {
            setMunicipiosPorDepartamento([]);
        }
    };

    const handleCategoriaChange = async (categoriaId) => {
        formik.setFieldValue('fk_id_categoria', categoriaId);

        if (categoriaId) {
            loadRazasPorCategoria(categoriaId);
        } else {
            setRazasPorCategoria([]);
        }
    };

    const handleImageChange = async (index) => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 1,
            });

            if (!result.didCancel && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                const updatedFotos = [...fotos];
                updatedFotos[index] = selectedImage;
                setFotos(updatedFotos);
                const updatedFotoUrl = [...fotoUrl];
                updatedFotoUrl[index] = selectedImage.uri;
                setFotoUrl(updatedFotoUrl);

                // Actualizar el campo 'imagenes' en Formik
                const updatedImagenes = updatedFotos.filter(f => f !== null).map(f => f.fileName || f.uri);
                setFieldValue('imagenes', updatedImagenes);
            }
        } catch (error) {
            console.log('Error al seleccionar la imagen:', error);
        }
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    {fotoUrl.map((url, index) => (
                        <TouchableOpacity key={index} style={styles.imageWrapper} onPress={() => handleImageChange(index)}>
                            <Image
                                source={{ uri: url || 'https://via.placeholder.com/150' }}
                                style={styles.image}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                {/* Mostrar mensaje de error si no se ha seleccionado una imagen */}
                {formik.errors.imagenes && formik.touched.imagenes ? (
                    <Text style={styles.errorText}>
                        {formik.errors.imagenes}
                    </Text>
                ) : null}

                {/* Campos del formulario */}
                <View>
                    <Text style={styles.label}>Nombre de la mascota</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de la mascota"
                        placeholderTextColor="#666"
                        value={values.nombre_mascota}
                        onChangeText={handleChange('nombre_mascota')}
                        onBlur={handleBlur('nombre_mascota')}
                    />
                    {touched.nombre_mascota && errors.nombre_mascota && <Text style={styles.errorText}>{errors.nombre_mascota}</Text>}

                    <Text style={styles.label}>Fecha de nacimiento</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#666"
                        value={values.fecha_nacimiento}
                        onChangeText={handleChange('fecha_nacimiento')}
                        onBlur={handleBlur('fecha_nacimiento')}
                    />
                    {touched.fecha_nacimiento && errors.fecha_nacimiento && <Text style={styles.errorText}>{errors.fecha_nacimiento}</Text>}

                    <Text style={styles.label}>Tamaño</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Tamaño", value: '' }}
                        value={formik.values.tamano}
                        onValueChange={formik.handleChange('tamano')}
                        style={pickerStyles}
                        items={[
                            { label: "Pequeño", value: "Pequeno" },
                            { label: "Mediano", value: "Mediano" },
                            { label: "Intermedio", value: "Intermedio" },
                            { label: "Grande", value: "Grande" }
                        ]}
                    />
                    {formik.touched.tamano && formik.errors.tamano && <Text style={styles.errorText}>{formik.errors.tamano}</Text>}

                    <Text style={styles.label}>Peso (en kilogramos)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Peso"
                        placeholderTextColor="#8d8d8d"
                        value={formik.values.peso}
                        onChangeText={handleChange('peso')}
                        onBlur={handleBlur('peso')}
                        keyboardType="numeric"
                    />
                    {formik.touched.peso && errors.peso && <Text style={styles.errorText}>{errors.peso}</Text>}

                    <Text style={styles.label}>Categoría</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Categoria", value: '' }}
                        value={formik.values.fk_id_categoria}
                        onValueChange={(value) => {
                            handleCategoriaChange(value); // Cargar razas por categoría
                        }}
                        style={pickerStyles}
                        items={categoria.map(cate => ({ label: cate.nombre_categoria, value: cate.id_categoria.toString() }))}
                    />
                    {formik.touched.fk_id_categoria && formik.errors.fk_id_categoria && (
                        <Text style={styles.errorText}>{formik.errors.fk_id_categoria}</Text>
                    )}

                    <Text style={styles.label}>Raza</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Raza", value: '' }}
                        value={formik.values.fk_id_raza}
                        onValueChange={(value) => formik.setFieldValue('fk_id_raza', value)}
                        style={pickerStyles}
                        items={razasPorCategoria.map(r => ({ label: r.nombre_raza, value: r.id_raza.toString() }))}
                    />
                    {formik.touched.fk_id_raza && formik.errors.fk_id_raza && (
                        <Text style={styles.errorText}>{formik.errors.fk_id_raza}</Text>
                    )}

                    <Text style={styles.label}>Departamento</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Departamento", value: '' }}
                        value={formik.values.fk_id_departamento}
                        onValueChange={(value) => {
                            handleDepartamentoChange(value); // Cargar municipios por departamento
                        }}
                        style={pickerStyles}
                        items={departamento.map(depa => ({ label: depa.nombre_departamento, value: depa.id_departamento.toString() }))}
                    />
                    {formik.touched.fk_id_departamento && formik.errors.fk_id_departamento && (
                        <Text style={styles.errorText}>{formik.errors.fk_id_departamento}</Text>
                    )}

                    <Text style={styles.label}>Municipio</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Municipio", value: '' }}
                        value={formik.values.fk_id_municipio}
                        onValueChange={(value) => formik.setFieldValue('fk_id_municipio', value)}
                        style={pickerStyles}
                        items={municipiosPorDepartamento.map(mu => ({ label: mu.nombre_municipio, value: mu.id_municipio.toString() }))}
                    />
                    {formik.touched.fk_id_municipio && formik.errors.fk_id_municipio && (
                        <Text style={styles.errorText}>{formik.errors.fk_id_municipio}</Text>
                    )}

                    <Text style={styles.label}>¿Está esterilizado?</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Esterilizado", value: '' }}
                        value={formik.values.esterilizacion}
                        onValueChange={formik.handleChange('esterilizacion')}
                        style={pickerStyles}
                        items={[
                            { label: "Sí", value: "si" },
                            { label: "No", value: "no" }
                        ]}
                    />
                    {formik.touched.esterilizacion && formik.errors.esterilizacion && <Text style={styles.errorText}>{formik.errors.esterilizacion}</Text>}

                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Descripción"
                        placeholderTextColor="#8d8d8d"
                        value={formik.values.descripcion}
                        onChangeText={handleChange('descripcion')}
                        onBlur={handleBlur('descripcion')}
                        multiline
                        numberOfLines={4}
                    />
                    {formik.touched.descripcion && formik.errors.descripcion && <Text style={styles.errorText}>{formik.errors.descripcion}</Text>}

                    <Text style={styles.label}>Estado</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Estado", value: '' }}
                        value={formik.values.estado}
                        onValueChange={formik.handleChange('estado')}
                        style={pickerStyles}
                        items={[
                            { label: "En Adopción", value: "En Adopcion" },
                            { label: "Urgente", value: "Urgente" },
                            { label: "Adoptado", value: "Adoptado" },
                            { label: "Reservado", value: "Reservado" }
                        ]}
                    />
                    {formik.touched.estado && formik.errors.estado && <Text style={styles.errorText}>{formik.errors.estado}</Text>}

                    <Text style={styles.label}>Sexo</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Sexo", value: '' }}
                        value={formik.values.sexo}
                        onValueChange={formik.handleChange('sexo')}
                        style={pickerStyles}
                        items={[
                            { label: "Macho", value: "Macho" },
                            { label: "Hembra", value: "Hembra" }
                        ]}
                    />
                    {formik.touched.sexo && formik.errors.sexo && <Text style={styles.errorText}>{formik.errors.sexo}</Text>}
                </View>

                {/* Botones */}
                <View style={styles.buttonContainer}>
                    <Button title="Cancelar" color="red" onPress={onClose} />
                    <Button style={{backgroundColor:'black'}} title={actionLabel} onPress={formik.handleSubmit} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
      padding: 25,
      backgroundColor: '#b5b5b5',
      borderRadius: 15,
      marginVertical: 10,
    },
    errorText: {
      color: '#FF6B6B',
      fontSize: 14,
      marginBottom: 15,
      fontWeight: '600', 
      textAlign: 'center',
    },
    imageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 30, 
      paddingHorizontal: 20, 
    },
    label: {
      fontSize: 18, 
      color: 'black', 
      marginBottom: 8,
      fontWeight: '700', 
      letterSpacing: 0.5, 
    },
    imageWrapper: {
      width: 80, 
      height: 80,
      borderRadius: 40, 
      backgroundColor: 'black', 
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000', 
      shadowOpacity: 0.4,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 40,
    },
    input: {
      borderWidth: 2,
      borderColor: '#4A4A4A', 
      color: 'black', 
      padding: 12,
      borderRadius: 10, 
      marginBottom: 15, 
      backgroundColor: 'white', 
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly', 
      marginTop: 20, 
    },
  });
  
  // Estilos del picker y el formulario
  const pickerStyles = {
    inputIOS: {
      height: 45, 
      borderColor: '#555', 
      borderWidth: 2, 
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 15,
      color: 'black', 
      backgroundColor: 'white', // Fondo gris oscuro
    },
    inputAndroid: {
      height: 45,
      borderColor: '#555',
      borderWidth: 2,
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 15,
      color: 'black',
      backgroundColor: 'white', // Consistencia en ambos sistemas operativos
    },
    placeholder: {
      color: '#888888', // Color placeholder más suave
    },
  };
  
export default FormMascotas;

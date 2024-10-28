import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    ScrollView, 
    TouchableOpacity, 
    StyleSheet, 
    Alert 
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axiosClient from '../client/axiosClient'; // Asegúrate de que esta ruta sea correcta
import moment from 'moment';

// Esquema de validación Yup
const validationSchema = yup.object().shape({
    fk_id_mascota: yup
        .string()
        .required('La mascota es obligatoria'),
    fecha_vacuna: yup
        .date()
        .required('La fecha de la vacuna es obligatoria')
        .max(new Date(), 'La fecha no puede ser en el futuro'),
    enfermedad: yup
        .string()
        .required('La enfermedad es obligatoria')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,20}$/, 'El nombre de la enfermedad debe tener máximo 20 caracteres y solo puede contener letras y espacios'),
    estado: yup
        .string()
        .required('El estado de la vacuna es obligatorio')
});

const FormVacunas = ({ mode, handleSubmit, onClose, actionLabel }) => {
    const [mascotas, setMascotas] = useState([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    // Función para obtener las mascotas
    const fetchMascotas = async () => {
        try {
            const response = await axiosClient.get('/mascotas/listar');
            setMascotas(response.data);
        } catch (error) {
            console.error('Error fetching mascotas: ', error);
            Alert.alert('Error', 'No se pudieron cargar las mascotas.');
        }
    };

    useEffect(() => {
        fetchMascotas(); // Llama a la función al cargar el componente
    }, []);

    // Formik para el manejo del formulario y Yup para validaciones
    const formik = useFormik({
        initialValues: {
            fk_id_mascota: '',
            fecha_vacuna: '',
            enfermedad: '',
            estado: ''
        },
        validationSchema,
        onSubmit: (values) => {
            // Aquí puedes manejar el envío del formulario
            handleSubmit(values);
        }
    });

    // Función para manejar la selección de fecha
    const handleConfirm = (date) => {
        formik.setFieldValue('fecha_vacuna', moment(date).format('YYYY-MM-DD')); // Asignar fecha en Formik
        setDatePickerVisibility(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.label}>Mascota</Text>
                <RNPickerSelect
                    placeholder={{ label: "Seleccionar Mascota", value: '' }}
                    value={formik.values.fk_id_mascota}
                    onValueChange={value => formik.setFieldValue('fk_id_mascota', value)}
                    items={mascotas.map(m => ({ label: m.nombre_mascota, value: m.id_mascota }))}
                    style={pickerStyles}
                />
                {formik.touched.fk_id_mascota && formik.errors.fk_id_mascota ? (
                    <Text style={styles.errorText}>{formik.errors.fk_id_mascota}</Text>
                ) : null}

                <Text style={styles.label}>Fecha de Vacuna</Text>
                <TouchableOpacity 
                    style={styles.dateButton} 
                    onPress={() => setDatePickerVisibility(true)}
                >
                    <Text style={styles.dateButtonText}>
                        {formik.values.fecha_vacuna ? `Seleccionada: ${formik.values.fecha_vacuna}` : 'Seleccionar Fecha'}
                    </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={() => setDatePickerVisibility(false)}
                />
                {formik.touched.fecha_vacuna && formik.errors.fecha_vacuna ? (
                    <Text style={styles.errorText}>{formik.errors.fecha_vacuna}</Text>
                ) : null}

                <Text style={styles.label}>Enfermedad</Text>
                <TextInput
                    style={[
                        styles.input,
                        formik.touched.enfermedad && formik.errors.enfermedad ? styles.inputError : null
                    ]}
                    placeholder="Enfermedad"
                    value={formik.values.enfermedad}
                    onChangeText={value => formik.setFieldValue('enfermedad', value)}
                    onBlur={formik.handleBlur('enfermedad')}
                    placeholderTextColor="#999"
                />
                {formik.touched.enfermedad && formik.errors.enfermedad ? (
                    <Text style={styles.errorText}>{formik.errors.enfermedad}</Text>
                ) : null}

                <Text style={styles.label}>Estado de la Vacuna</Text>
                <RNPickerSelect
                    placeholder={{ label: "Seleccionar Estado de Vacuna", value: '' }}
                    value={formik.values.estado}
                    onValueChange={value => formik.setFieldValue('estado', value)}
                    items={[
                        { label: "Completa", value: "Completa" },
                        { label: "Incompleta", value: "Incompleta" },
                        { label: "En Proceso", value: "En Proceso" },
                        { label: "No se", value: "No se" }
                    ]}
                    style={pickerStyles}
                />
                {formik.touched.estado && formik.errors.estado ? (
                    <Text style={styles.errorText}>{formik.errors.estado}</Text>
                ) : null}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={formik.handleSubmit}
                    >
                        <Text style={styles.buttonText}>{actionLabel}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

// Estilos
const styles = StyleSheet.create({
    scrollContainer: {
        paddingVertical: 20,
        backgroundColor: '#f2f2f2',
    },
    container: {
        backgroundColor: '#fff',
        padding: 25,
        marginHorizontal: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
    },
    inputError: {
        borderColor: 'red',
    },
    dateButton: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#ff4d4d',
        paddingVertical: 15,
        borderRadius: 10,
        marginRight: 10,
        alignItems: 'center',
    },
    registerButton: {
        flex: 1,
        backgroundColor: '#000', // Botón negro
        paddingVertical: 15,
        borderRadius: 10,
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

// Estilos del picker
const pickerStyles = {
    inputIOS: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
    },
    inputAndroid: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
    },
    placeholder: {
        color: '#999',
    },
};

export default FormVacunas;

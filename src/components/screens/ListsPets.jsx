import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Image
} from 'react-native';
import axiosClient from '../client/axiosClient';
import Header from '../organismos/Header';
import ListPet from '../moleculas/ListPet';
import EstadoModalUsu from '../organismos/EstadoModalUsu';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage

const statusColorMap = {
    'En Adopcion': "#28a745",
    Urgente: "#FF0000",
    Reservado: "#ffc107",
    Adoptado: "#6c757d",
    Todos: "#007bff",
};

const statusOptions = [
    { name: "Todos", uid: "Todos" },
    { name: "En Adopcion", uid: "En Adopcion" },
    { name: "Urgente", uid: "Urgente" },
];

const ListsPets = () => {
    const [filterValue, setFilterValue] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [estadoModalVisible, setEstadoModalVisible] = useState(true); // Mostrar primero el modal
    const [selectedTitle, setSelectedTitle] = useState('');
    const [userRole, setUserRole] = useState('invitado'); // Estado para almacenar el rol del usuario

    useFocusEffect(
        React.useCallback(() => {
            fetchPets();
            fetchUserRole(); // Recupera el rol del usuario cada vez que el componente se enfoca
        }, [])
    );

    useEffect(() => {
        filterPets();
    }, [filterValue, selectedStatus, pets]);

    const fetchUserRole = async () => {
        try {
            const userString = await AsyncStorage.getItem('user');
            if (userString) {
                const user = JSON.parse(userString);
                setUserRole(user.rol || 'invitado'); // Asigna el rol, por defecto 'invitado'
            } else {
                setUserRole('invitado'); // Si no hay usuario, es 'invitado'
            }
        } catch (error) {
            console.error('Error al obtener usuario de AsyncStorage: ', error);
            setUserRole('invitado'); // En caso de error, considera 'invitado'
        }
    };

    const fetchPets = async () => {
        try {
            const response = await axiosClient.get('/mascotas/listar');
            setPets(response.data);
            setFilteredPets(response.data);
        } catch (error) {
            Alert.alert('Error', 'No hay mascotas para listar');
        } finally {
            setIsLoading(false);
        }
    };

    const filterPets = () => {
        let filtered = pets;

        // Excluir mascotas en "Reservado" y "Adoptado" siempre
        filtered = filtered.filter(pet => pet.estado !== "Reservado" && pet.estado !== "Adoptado");

        if (filterValue) {
            filtered = filtered.filter(pet =>
                pet.nombre_mascota.toLowerCase().includes(filterValue.toLowerCase()) ||
                pet.raza.toLowerCase().includes(filterValue.toLowerCase()) ||
                pet.categoria.toLowerCase().includes(filterValue.toLowerCase()) ||
                pet.sexo.toLowerCase().includes(filterValue.toLowerCase()) 
            );
        }

        // Filtrar por estado seleccionado
        if (selectedStatus !== 'Todos') {
            filtered = filtered.filter(pet => pet.estado === selectedStatus);
        }

        setFilteredPets(filtered);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedPet(null);
        fetchPets(); // Refresca la lista después de cerrar el modal
    };

    const handleEstadoChipPress = (estado) => {
        setSelectedTitle(estado);
        setEstadoModalVisible(true); // Muestra el EstadoModalUsu
    };

    const handleAdoptPress = (pet) => {
        if (userRole === 'invitado') {
            Alert.alert(
                'Inicia Sesión',
                'Debes iniciar sesión para poder adoptar una mascota.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') }, // Asegúrate de tener una pantalla de Login
                ],
                { cancelable: true }
            );
        } else {
            setSelectedPet(pet);
            setModalVisible(true);
        }
    };

    const handleCloseEstadoModal = () => {
        setEstadoModalVisible(false);
    };

    const renderPetCard = ({ item }) => (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                <Text style={styles.title}>Nombre: {item.nombre_mascota}</Text>
                <Text style={styles.subtitle}>Género: {item.sexo}</Text>
                <Text style={styles.subtitle}>Raza: {item.raza}</Text>
                <TouchableOpacity
                    style={[styles.statusChip, { backgroundColor: statusColorMap[item.estado] }]}
                    onPress={() => handleEstadoChipPress(item.estado)}
                >
                    <Text style={styles.statusText}>{item.estado}</Text>
                </TouchableOpacity>

                {/* Sección de imágenes */}
                {item.imagenes && item.imagenes.length > 0 ? (
                    <View style={[styles.imageGrid, item.imagenes.length === 1 ? styles.singleImageGrid : styles.multiImageGrid]}>
                        {item.imagenes.split(',').filter(imagen => imagen).map((imagen, index) => (
                            <View key={index} style={[styles.imageWrapper, item.imagenes.length === 1 && index === 0 ? styles.singleImageWrapper : null]}>
                                <Image
                                    source={{ uri: `${axiosClient.defaults.baseURL}/uploads/${imagen}` }}
                                    style={styles.image}
                                    resizeMode="cover"
                                    onError={(error) => console.log(`Error loading image ${index + 1}:`, error.nativeEvent.error)}
                                />
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.defaultImageWrapper}>
                        <Image
                            source={{ uri: 'https://nextui.org/images/hero-card-complete.jpeg' }}
                            style={styles.image}
                            resizeMode="cover"
                            onError={(error) => console.log('Error loading default image:', error.nativeEvent.error)}
                        />
                    </View>
                )}

                <Text style={styles.description}>{item.descripcion}</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleAdoptPress(item)} // Usa el manejador actualizado
                >
                    <Text style={styles.buttonText}>Adoptar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Modal para EstadoUsu al iniciar */}
            <EstadoModalUsu
                isVisible={estadoModalVisible}
                onClose={handleCloseEstadoModal}
                title={selectedTitle}
            />

            {/* Renderizar el contenido solo si el modal está cerrado */}
            {!estadoModalVisible && (
                <>
                    <Header title="Lista de mascotas" />
                    <View style={styles.searchContainer}>
                        <Icon name="search" size={20} color="black" style={styles.searchIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Buscar..."
                            value={filterValue}
                            onChangeText={setFilterValue}
                        />
                    </View>
                    <View style={styles.dropdown}>
                        {statusOptions.map(option => (
                            <TouchableOpacity
                                key={option.uid}
                                style={[styles.dropdownItem, selectedStatus === option.uid && styles.selectedDropdownItem]}
                                onPress={() => setSelectedStatus(option.uid)}
                            >
                                <Text style={styles.dropdownText}>{option.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <FlatList
                            data={filteredPets}
                            renderItem={renderPetCard}
                            keyExtractor={item => item.id_mascota.toString()}
                            numColumns={2}
                            columnWrapperStyle={styles.row}
                        />
                    )}
                    <ListPet visible={modalVisible} onClose={handleModalClose} pet={selectedPet} />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#b5b5b5',
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 8,
        backgroundColor: 'white',
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
        paddingVertical: 0,
    },
    dropdown: {
        flexDirection: 'row',
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    dropdownItem: {
        padding: 8,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#f8f8f8',
    },
    selectedDropdownItem: {
        backgroundColor: '#ddd',
    },
    dropdownText: {
        fontSize: 16,
        color: 'black',
    },
    row: {
        flex: 1,
        justifyContent: "space-between",
        marginBottom: 16,
    },
    cardContainer: {
        flex: 1,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flex: 1,
        width: 175,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
    },
    statusChip: {
        padding: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginVertical: 8,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    singleImageGrid: {
        justifyContent: 'center',
    },
    multiImageGrid: {
        justifyContent: 'space-between',
    },
    imageWrapper: {
        flexBasis: '48%',
        marginBottom: 8,
    },
    singleImageWrapper: {
        flexBasis: '100%',
    },
    defaultImageWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 80,
        marginTop: 8,
    },
    image: {
        width: '100%',
        height: 80,
        borderRadius: 10,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    button: {
        backgroundColor: 'black',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ListsPets;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../client/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../organismos/Header';
import Icon from 'react-native-vector-icons/FontAwesome';

const MySolicitudPet = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');

  const fetchAdoptedPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      const id_usuario = parsedUser ? parsedUser.id_usuario : null;

      if (id_usuario) {
        const response = await axiosClient.get(`/adopciones/proceso/${id_usuario}`);

        console.log('Response data:', response.data);

        if (response.data && response.data.length > 0) {
          // Set the pets and initialize mainImage for each pet
          const updatedPets = response.data.map(pet => {
            const imagenesArray = pet.imagenes ? pet.imagenes.split(',') : [];
            const mainImage = imagenesArray.length > 0 ? `${axiosClient.defaults.baseURL}/uploads/${imagenesArray[0]}` : '';
            return { ...pet, mainImage };
          });

          setPets(updatedPets);
          setFilteredPets(updatedPets);
        } else {
          setError('No tienes mascotas en proceso de adopción');
          setPets([]);
          setFilteredPets([]);
        }
      } else {
        setError('Usuario no registrado');
      }
    } catch (error) {
      setError('No tienes solicitudes de mascotas');
    } finally {
      setIsLoading(false);
    }
  }, []);
/*  */
  useFocusEffect(
    useCallback(() => {
      fetchAdoptedPets();
    }, [fetchAdoptedPets])
  );

  useEffect(() => {
    filterPets();
  }, [filterValue, pets]);

  const filterPets = () => {
    let filtered = pets;

    if (filterValue) {
      filtered = filtered.filter(pet =>
        pet.nombre_mascota.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.fk_id_raza.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.sexo.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    setFilteredPets(filtered);
  };

  const denyAdoption = async (id_adopcion) => {
    try {
      const response = await axiosClient.post(`/adopciones/administrar/${id_adopcion}`, {
        accion: 'denegar'
      });

      console.log('Deny adoption response:', response.data);

      if (response.status === 200) {
        Alert.alert('Éxito', response.data.message);
        fetchAdoptedPets();
      } else {
        Alert.alert('Error', response.data.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error denying adoption:', error);
      Alert.alert('Error', 'Error al denegar la adopción');
    }
  };

  const renderPetCard = ({ item }) => {
    const imagenesArray = item.imagenes ? item.imagenes.split(',') : [];
    const additionalImages = imagenesArray.slice();
    
    // Use the selectedImage or default to pet.mainImage if no image is selected
    const currentImage = selectedPetId === item.id_adopcion ? selectedImage : item.mainImage;

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardContent}>
          <Image
            source={{ uri: currentImage }}
            style={styles.mainImage}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>Nombre: {item.nombre_mascota}</Text>
            <Text style={styles.subtitle}>Género: {item.sexo}</Text>
            <Text style={styles.subtitle}>Raza: {item.raza}</Text>
            <Text style={styles.subtitle}>Fecha de solitud de adopción: {new Date(item.fecha_adopcion_proceso).toLocaleDateString()}</Text>
            <Text style={styles.subtitle}>Estado: {item.estado_adopcion}</Text>
          </View>
        </View>
        {additionalImages.length > 0 && (
          <View style={styles.imagesContainer}>
            {additionalImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedPetId(item.id_adopcion);
                  setSelectedImage(`${axiosClient.defaults.baseURL}/uploads/${image}`);
                }}
              >
                <Image
                  source={{ uri: `${axiosClient.defaults.baseURL}/uploads/${image}` }}
                  style={styles.smallImage}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => denyAdoption(item.id_adopcion)}
        >
          <Text style={styles.buttonText}>Cancelar Adopción</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Mis Solicitudes" />
      <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="black" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder="Buscar..."
        value={filterValue}
        onChangeText={setFilterValue}
      />
        </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        filteredPets.length > 0 ? (
          <FlatList
            data={filteredPets}
            renderItem={renderPetCard}
            keyExtractor={item => item.id_adopcion ? item.id_adopcion.toString() : Math.random().toString()}
          />
        ) : (
          <Text style={styles.errorText}>No hay mascotas en proceso de adopción</Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#b5b5b5', // Fondo más suave
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C5C5C7', // Borde más claro
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF', // Fondo blanco en el input de búsqueda
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Sombra ligera para destacar
  },
  searchIcon: {
    marginRight: 8,
    color: 'black', // Color más suave para el ícono
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingVertical: 0,
    color: '#333333', // Texto más oscuro para mejor legibilidad
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10, // Borde más redondeado
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3, // Sombra más profunda para que el card resalte más
  },
  cardContent: {
    flexDirection: 'row', // Mantiene la imagen y el texto en la misma fila
    marginBottom: 10,
  },
  mainImage: {
    width: 130, // Tamaño de imagen un poco más pequeño para dejar más espacio al texto
    height: 130,
    borderRadius: 12, // Borde más redondeado para la imagen
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#D6D6D6', // Agregado borde suave para destacar la imagen
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20, // Tamaño de fuente mayor para el título
    fontWeight: '700', // Negrita más destacada
    color: 'black', // Color más oscuro para el título
    marginBottom: 6, // Mayor espacio entre el título y el subtítulo
  },
  subtitle: {
    fontSize: 15,
    color: 'black', // Color más gris para los subtítulos
    marginBottom: 6,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  smallImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D6D6D6', 
  },
  button: {
    padding: 12, // Mayor relleno en el botón
    backgroundColor: '#FF3B30', // Rojo más vivo para el botón de cancelar
    borderRadius: 8, // Borde más redondeado en el botón
    alignItems: 'center',
    marginTop: 10, // Separación del botón con respecto a la lista de imágenes
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600', // Negrita en el texto del botón
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MySolicitudPet;

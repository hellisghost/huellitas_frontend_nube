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

const SolicitudPets = () => {
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
        const response = await axiosClient.get(`/adopciones/listar`);

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

  const aceptAdoption = async (id_adopcion) => {
    try {
      const response = await axiosClient.post(`/adopciones/administrar/${id_adopcion}`, {
        accion: 'aceptar'
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
            <Text style={styles.subtitle}>Solicitante: {item.usuario_nombre} {item.usuario_apellido}</Text>
            <Text style={styles.subtitle}>Correo: {item.usuario_correo}</Text>
            <Text style={styles.subtitle}>Numero: {item.usuario_telefono}</Text>
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
        <View style={styles.containerButton}>
          <TouchableOpacity
            style={styles.buttonD}
            onPress={() => denyAdoption(item.id_adopcion)}
          >
            <Text style={styles.buttonText}>Denegar Adopción</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonA}
            onPress={() => aceptAdoption(item.id_adopcion)}
          >
            <Text style={styles.buttonText}>Aceptar Adopción</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Solicitudes de mascotas" />
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="orange" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar..."
          value={filterValue}
          onChangeText={setFilterValue}
          placeholderTextColor="#666"
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
    backgroundColor: '#f9f9f9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    // color: 'orange',
    paddingVertical: 0,
  },
  cardContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row', // Coloca la imagen y la información textual en una fila
    marginBottom: 10,
  },
  mainImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666'
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
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
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  containerButton: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  buttonA: {
    padding: 10,
    backgroundColor: 'orange',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonD: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SolicitudPets;

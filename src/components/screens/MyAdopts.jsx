import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../client/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../organismos/Header';
import Icon from 'react-native-vector-icons/FontAwesome';

const MyAdopts = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [mainImage, setMainImage] = useState('');

  const fetchAdoptedPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      const id_usuario = parsedUser ? parsedUser.id_usuario : null;

      if (id_usuario) {
        const response = await axiosClient.get(`/adopciones/listaraceptadas/${id_usuario}`);
        
        if (response.data && response.data.length > 0) {
          const updatedPets = response.data.map(pet => {
            const imagenesArray = pet.imagenes ? pet.imagenes.split(',') : [];
            const mainImage = imagenesArray.length > 0 ? `${axiosClient.defaults.baseURL}/uploads/${imagenesArray[0]}` : '';
            return { ...pet, mainImage };
          });

          setPets(updatedPets);
          setFilteredPets(updatedPets);
        } else {
          setError('No se encontraron mascotas adoptadas.');
          setPets([]);
          setFilteredPets([]);
        }
      } else {
        setError('Usuario no identificado.');
      }
    } catch (error) {
      setError('Error al obtener los datos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        pet.raza.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.sexo.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    setFilteredPets(filtered);
  };

  const handleImagePress = (petId, imageUri) => {
    if (selectedPetId === petId) {
      setMainImage(imageUri);
    } else {
      setSelectedPetId(petId);
      setMainImage(imageUri);
    }
  };

  const PetCard = ({ item, mainImage, onImagePress }) => {
    const imagenesArray = item.imagenes ? item.imagenes.split(',') : [];
    const additionalImages = imagenesArray.map(image => `${axiosClient.defaults.baseURL}/uploads/${image}`);

    return (
      <View style={styles.petCard}>
        <Image
          source={{ uri: mainImage || item.mainImage }}
          style={styles.petMainImage}
        />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.nombre_mascota}</Text>
          <Text style={styles.petDetail}>Sexo: {item.sexo}</Text>
          <Text style={styles.petDetail}>Raza: {item.raza}</Text>
          <Text style={styles.petDetail}>Adoptado el: {new Date(item.fecha_adopcion_aceptada).toLocaleDateString()}</Text>
          <Text style={styles.petDetail}>Estado: {item.estado}</Text>
          <Text style={styles.petDetail}>Descripción: {item.descripcion}</Text>
        </View>
        <View style={styles.extraImagesContainer}>
          {additionalImages.map((image, index) => (
            <TouchableOpacity key={index} onPress={() => handleImagePress(item.id_mascota, image)}>
              <Image
                source={{ uri: image }}
                style={styles.extraImage}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <Header title="Mis Adopciones" />
      <View style={styles.searchBarContainer}>
        <Icon name="search" size={20} color="black" style={styles.iconStyle} />
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar mascota..."
          value={filterValue}
          onChangeText={setFilterValue}
          placeholderTextColor="black"
        />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#f39c12" />
      ) : error ? (
        <Text style={styles.errorMessage}>{error}</Text>
      ) : (
        filteredPets.length > 0 ? (
          <FlatList
            data={filteredPets}
            renderItem={({ item }) => (
              <PetCard
                item={item}
                mainImage={selectedPetId === item.id_mascota ? mainImage : item.mainImage}
                onImagePress={handleImagePress}
              />
            )}
            keyExtractor={item => item.id_mascota ? item.id_mascota.toString() : Math.random().toString()}
          />
        ) : (
          <Text style={styles.noPetsMessage}>No hay mascotas adoptadas.</Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#b5b5b5',
    padding: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  iconStyle: {
    margin: 10,
  },
  searchBar: {
    flex: 1,
    color: 'black',
    fontSize: 16,
  },
  petCard: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  petMainImage: {
    width: '50%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  petInfo: {
    marginBottom: 10,
    color: 'black'
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 5,
  },
  petDetail: {
    fontSize: 14,
    color: 'black',
    marginBottom: 2,
  },
  extraImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  extraImage: {
    width: 50,
    height: 50,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 5,
    borderColor: '#444',
    borderWidth: 1,
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  noPetsMessage: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default MyAdopts;

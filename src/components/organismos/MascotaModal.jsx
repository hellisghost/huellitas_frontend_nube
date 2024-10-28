import React, { useContext } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import FormMascotas from '../moleculas/FormMascotas'; 
import MascotasContext from '../../context/MascotasContext'; 

const MascotaModal = ({ isVisible, onClose, handleSubmit, actionLabel, title, mode }) => {
  const { idMascota, getMascota, mascota } = useContext(MascotasContext);

  React.useEffect(() => {
    if (mode === 'update' && idMascota) {
      getMascota(idMascota);
    }
  }, [mode, idMascota]);

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>
          <FormMascotas
            initialData={mascota}
            mode={mode}
            handleSubmit={handleSubmit}
            onClose={onClose}
            actionLabel={actionLabel}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MascotaModal;

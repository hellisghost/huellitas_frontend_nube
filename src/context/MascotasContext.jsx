import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../components/client/axiosClient';

const MascotasContext = createContext();

export const MascotasProvider = ({ children }) => {
  const [mascotas, setMascotas] = useState([]);
  const [mascota, setMascota] = useState(null);
  const [idMascota, setMascotaId] = useState(null);

  // Fetch all mascotas on component mount
  useEffect(() => {
    getMascotas();
  }, []);

  const getMascotas = async () => {
    try {
      const response = await axiosClient.get('/mascotas/listar');
      setMascotas(response.data);
    } catch (error) {
      /* console.error('Error fetching mascotas:', error); */
    }
  };

  const getMascota = async (id_mascota) => {
    try {
      const response = await axiosClient.get(`/mascotas/buscar/${id_mascota}`);
      setMascota(response.data);
    } catch (error) {
      /* console.error('Error fetching mascota:', error); */
    }
  };

  return (
    <MascotasContext.Provider
      value={{
        mascotas,
        mascota,
        idMascota,
        setMascotas,
        setMascota,
        setMascotaId,
        getMascotas,
        getMascota,
      }}
    >
      {children}
    </MascotasContext.Provider>
  );
};

export default MascotasContext;

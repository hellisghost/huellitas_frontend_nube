import React, { createContext, useState } from 'react';
import axiosClient from '../components/client/axiosClient';

const VacunasContext = createContext();

export const VacunasProvider = ({ children }) => {
  const [vacunas, setVacunas] = useState([]);
  const [vacuna, setVacuna] = useState({});
  const [idVacuna, setVacunaId] = useState(null);

  const getVacunas = async () => {
    try {
      const response = await axiosClient.get('/vacuna/listar');
      console.log(response.data);
      setVacunas(response.data);
    } catch (error) {
      console.log('Error del servidor: ' + error);
    }
  };

  const getVacuna = async (id_vacuna) => {
    try {
      const response = await axiosClient.get(`/vacuna/buscar/${id_vacuna}`);
      console.log(response.data);
      setVacuna(response.data);
    } catch (error) {
      console.log('Error: ' + error);
    }
  };

  return (
    <VacunasContext.Provider
      value={{
        vacunas,
        vacuna,
        idVacuna,
        setVacunas,
        setVacuna,
        setVacunaId,
        getVacunas,
        getVacuna,
      }}
    >
      {children}
    </VacunasContext.Provider>
  );
};

export default VacunasContext;

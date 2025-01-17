import React, { createContext } from 'react';
import { MascotasProvider } from './MascotasContext';
import { VacunasProvider } from './VacunasContext';

export const GlobalContext = createContext();

const GlobalProvider = ({ children }) => {
    const globalContextValue = {};

    return (
        <GlobalContext.Provider value={globalContextValue}>
            <MascotasProvider>
                <VacunasProvider>
                    {children}
                </VacunasProvider>
            </MascotasProvider>
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;

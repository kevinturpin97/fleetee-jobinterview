import { createContext, useContext } from 'react';

const MainContext = createContext();

const useMainContext = () => {
    const context = useContext(MainContext);

    if (context === undefined) {
        throw new Error('useMainContext must be used within a MainProvider');
    }
    
    return context;
};

export { MainContext, useMainContext };
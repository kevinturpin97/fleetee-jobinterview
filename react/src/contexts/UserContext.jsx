import { createContext, useContext } from 'react';

const UserContext = createContext();

const useUserContext = () => {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    
    return context;
};

export { UserContext, useUserContext };
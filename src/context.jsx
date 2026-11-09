import { createContext, useContext } from 'react';

export const VunaContext = createContext(null);
export const useVuna = () => useContext(VunaContext);

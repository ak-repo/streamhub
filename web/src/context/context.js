import { createContext, useContext } from "react";

// Auth
export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Action
export const ChannelContext = createContext();
export const useChannel = () => useContext(ChannelContext);

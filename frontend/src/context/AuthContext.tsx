"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserLoginData, UserRegisterData } from "@/types";
import { loginUser, registerUser, demoLogin } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
  login: (data: UserLoginData) => Promise<void>;
  register: (data: UserRegisterData) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("aulamia_user");
      const storedToken = localStorage.getItem("aulamia_token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.error("Error al restaurar sesión guardada:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    try {
      localStorage.setItem("aulamia_user", JSON.stringify(newUser));
      localStorage.setItem("aulamia_token", newToken);
    } catch (e) {
      console.error("Error al guardar sesión en localStorage:", e);
    }
  };

  const login = async (data: UserLoginData) => {
    setIsLoading(true);
    try {
      const res = await loginUser(data);
      saveSession(res.user, res.token);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: UserRegisterData) => {
    setIsLoading(true);
    try {
      const res = await registerUser(data);
      saveSession(res.user, res.token);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    setIsLoading(true);
    try {
      const res = await demoLogin();
      saveSession(res.user, res.token);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("aulamia_user");
      localStorage.removeItem("aulamia_token");
    } catch (e) {
      console.error("Error al limpiar sesión:", e);
    }
  };

  const openLoginModal = () => {
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalTab("register");
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        login,
        register,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}

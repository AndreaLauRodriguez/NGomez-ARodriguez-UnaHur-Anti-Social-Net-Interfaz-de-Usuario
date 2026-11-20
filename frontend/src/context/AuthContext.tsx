import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { getUsers } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (nickName: string, password: string) => Promise<void>;
  loginDirect: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'unahur_antisocial_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      // Limpiamos cualquier dato de prueba viejo que haya quedado en localStorage
      localStorage.removeItem('unahur_mock_posts');
      localStorage.removeItem('unahur_mock_users');
      localStorage.removeItem('unahur_mock_tags');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved) as User;
      if (!parsed.id || parsed.id.startsWith('mock_')) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [user]);

  // Verifica al iniciar que el usuario guardado en localStorage exista en el BackEnd actual
  useEffect(() => {
    if (!user) return;
    getUsers()
      .then((backendUsers) => {
        const matchById = backendUsers.find((u) => u.id === user.id);
        if (matchById) return;

        const matchByNick = backendUsers.find(
          (u) => u.nickName.toLowerCase() === user.nickName.toLowerCase()
        );
        if (matchByNick) {
          setUser(matchByNick);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        // Si el BackEnd aún no levantó, mantenemos la sesión local hasta que conecte
      });
  }, []);

  const login = async (nickName: string, password: string): Promise<void> => {
    const cleanNick = nickName.trim();

    if (!cleanNick) {
      throw new Error('Debés ingresar tu nickName.');
    }

    // Validación local de la contraseña fija "123456" según consigna
    if (password !== '123456') {
      throw new Error('Contraseña incorrecta. Recordá que la clave es "123456".');
    }

    // Consulta GET /users a la API del BackEnd para verificar si el usuario existe
    const users = await getUsers();
    const foundUser = users.find(
      (u) => u.nickName.toLowerCase() === cleanNick.toLowerCase()
    );

    if (!foundUser) {
      throw new Error(`El usuario "${cleanNick}" no existe en el BackEnd. Podés registrarte primero.`);
    }

    setUser(foundUser);
  };

  const loginDirect = (loggedUser: User): void => {
    setUser(loggedUser);
  };

  const logout = (): void => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        loginDirect,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
};

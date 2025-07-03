import { createContext, useState, useEffect, useCallback } from "react";
import { databaseService } from "../services/databaseService";

const DatabaseContext = createContext();

export { DatabaseContext };

export function DatabaseProvider({ children }) {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDatabase = useCallback(async () => {
    if (db) return db;

    setLoading(true);
    setError(null);

    try {
      const database = await databaseService.loadDatabase();
      setDb(database);
      return database;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [db]);

  // Initialize database on mount
  useEffect(() => {
    loadDatabase().catch(console.error);
  }, [loadDatabase]);

  const value = {
    db,
    loading,
    error,
    loadDatabase,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

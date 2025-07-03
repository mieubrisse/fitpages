import initSqlJs from "sql.js";

class DatabaseService {
  constructor() {
    this.db = null;
    this.loading = false;
    this.error = null;
  }

  async loadDatabase() {
    // Return cached database if already loaded
    if (this.db) {
      return this.db;
    }

    // Return if already loading
    if (this.loading) {
      // Wait for the current load to complete
      return new Promise((resolve, reject) => {
        const checkLoaded = () => {
          if (this.db) {
            resolve(this.db);
          } else if (this.error) {
            reject(this.error);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    this.loading = true;
    this.error = null;

    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      const response = await fetch("/api/get-database");

      if (!response.ok) {
        throw new Error(`Failed to fetch database: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      this.db = new SQL.Database(new Uint8Array(arrayBuffer));

      return this.db;
    } catch (err) {
      this.error = err;
      throw err;
    } finally {
      this.loading = false;
    }
  }

  getDatabase() {
    return this.db;
  }

  isLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  clearError() {
    this.error = null;
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService();

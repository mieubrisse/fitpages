import { useState, useEffect } from "react";
import initSqlJs from "sql.js";

const DatabaseViewer = () => {
  const [schema, setSchema] = useState(null);
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);

  useEffect(() => {
    const loadDatabase = async () => {
      try {
        // Initialize SQL.js
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });

        // Fetch the database file
        const response = await fetch("/api/get-database");
        const arrayBuffer = await response.arrayBuffer();

        // Load the database
        const dbInstance = new SQL.Database(new Uint8Array(arrayBuffer));
        setDb(dbInstance);

        // Get all table names
        const tablesResult = dbInstance.exec("SELECT name FROM sqlite_master WHERE type='table'");
        const tables = tablesResult[0]?.values || [];

        // Get schema for each table
        const schemaInfo = [];
        for (const [tableName] of tables) {
          const tableSchema = dbInstance.exec(`PRAGMA table_info(${tableName})`);
          const columns = tableSchema[0]?.values || [];

          schemaInfo.push({
            name: tableName,
            columns: columns.map((col) => ({
              name: col[1],
              type: col[2],
              notNull: col[3],
              defaultValue: col[4],
              primaryKey: col[5],
            })),
          });
        }

        setSchema(schemaInfo);
        setLoading(false);
      } catch (err) {
        console.error("Error loading database:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadDatabase();
  }, []);

  // When a table is selected, load its data
  useEffect(() => {
    if (!selectedTable || !db) return;
    try {
      const result = db.exec(`SELECT * FROM "${selectedTable}"`);
      if (result.length > 0) {
        setTableData({
          columns: result[0].columns,
          values: result[0].values,
        });
      } else {
        setTableData({ columns: [], values: [] });
      }
    } catch {
      setTableData({ columns: [], values: [] });
    }
  }, [selectedTable, db]);

  if (loading) {
    return <div className="p-4 text-gray-300">Loading database schema...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }

  // Table data view
  if (selectedTable && tableData) {
    return (
      <div className="p-4">
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          onClick={() => setSelectedTable(null)}
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">{selectedTable}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-600">
            <thead>
              <tr className="bg-gray-700">
                {tableData.columns.map((col) => (
                  <th
                    key={col}
                    className="border border-gray-600 px-3 py-2 text-left text-gray-200"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.values.length === 0 ? (
                <tr>
                  <td colSpan={tableData.columns.length} className="text-gray-400 text-center py-4">
                    No data
                  </td>
                </tr>
              ) : (
                tableData.values.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-700">
                    {row.map((cell, i) => (
                      <td
                        key={i}
                        className="border border-gray-600 px-3 py-2 text-gray-300 font-mono"
                      >
                        {cell === null ? (
                          <span className="text-gray-500">NULL</span>
                        ) : (
                          cell.toString()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Homescreen: list of tables
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Select a Table</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {schema &&
          schema.map((table) => (
            <button
              key={table.name}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-6 text-left shadow hover:bg-blue-900 hover:border-blue-500 transition-colors text-blue-300 text-xl font-semibold focus:outline-none"
              onClick={() => setSelectedTable(table.name)}
            >
              {table.name}
            </button>
          ))}
      </div>
    </div>
  );
};

export default DatabaseViewer;

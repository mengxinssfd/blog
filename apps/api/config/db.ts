let mysqlConfig: {
  port: number;
  host: string;
  username: string;
  password: string;
  database: string;
};
export function getMYSQLConfig() {
  if (mysqlConfig) return mysqlConfig;
  mysqlConfig = {
    port: Number(process.env['MYSQL_PORT']),
    host: process.env['MYSQL_HOST'] as string,
    username: process.env['MYSQL_USERNAME'] as string,
    password: process.env['MYSQL_PASSWORD'] as string,
    database: process.env['MYSQL_DATABASE'] as string,
  };
  return mysqlConfig;
}

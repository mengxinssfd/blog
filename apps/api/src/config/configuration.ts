export const configLoader = () => {
  return {
    database: {
      port: Number(process.env['MYSQL_PORT']),
      host: process.env['MYSQL_HOST'] as string,
      username: process.env['MYSQL_USERNAME'] as string,
      password: process.env['MYSQL_PASSWORD'] as string,
      database: process.env['MYSQL_DATABASE'] as string,
    },
  };
};

export type Configuration = ReturnType<typeof configLoader>;

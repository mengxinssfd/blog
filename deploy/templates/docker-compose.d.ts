export interface DockerCompose {
  version: string;
  services: {
    apps: {
      ports: string[];
      volumes: string[];
      networks: string[];
      command: string;
    };
    redis: {
      image: 'redis:7';
      ports: string[];
      volumes: string[];
      networks: string[];
      command: string;
    };
    mysql: {
      image: 'mysql:8';
      environment: {
        TZ: string;
        MYSQL_ROOT_PASSWORD: string;
        MYSQL_ALLOW_EMPTY_PASSWORD: string;
        MYSQL_DATABASE: string;
        MYSQL_USER: string;
        MYSQL_PASSWORD: string;
      };
      ports: string[];
      volumes: string[];
      networks: string[];
      command: string;
    };
  };
  networks: Record<string, null>;
}

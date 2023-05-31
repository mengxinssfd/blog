FROM nginx:1
WORKDIR /etc/nginx/

COPY ssl /etc/nginx/ssl
COPY nginx.conf /etc/nginx/

EXPOSE 80 443

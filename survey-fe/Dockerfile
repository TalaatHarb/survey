FROM node:alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
RUN npm run build --omit=dev

# => Run container
FROM nginx:stable-alpine

# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

COPY --from=builder /app/dist /usr/share/nginx/html/

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html
COPY ./env.sh .
COPY .env .

# Add bash and make our shell script executable
RUN apk add --no-cache bash && chmod +x env.sh

# Set default port for server
ENV PORT 80

# Start Nginx server
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && envsubst \"`env | awk -F = '{printf \" \\\\$%s\", $1}'`\" < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
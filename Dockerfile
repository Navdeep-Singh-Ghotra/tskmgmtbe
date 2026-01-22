# Stage 1: Build stage (install dependencies)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Production stage (copy minimal required files)
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
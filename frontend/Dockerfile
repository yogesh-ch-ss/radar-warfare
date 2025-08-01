# Use official Node image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Build the app
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

# Serve the build directory
CMD ["serve", "-s", "dist", "-l", "3000"]

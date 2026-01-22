FROM node:22-bookworm-slim

WORKDIR /app

# Copy the list of ingredients
COPY package.json ./

# Install everything (this creates its own lockfile inside the container)
RUN npm install

# Copy the rest of your code (index.js)
COPY . .

# Tell the server to use port 8080
EXPOSE 8080

# Start the proxy
CMD ["node", "index.js"]

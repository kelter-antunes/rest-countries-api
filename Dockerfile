# Use a smaller base image
FROM node:14-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Ensure the application has permission to create and write to the error log file
RUN touch error_log.json && chmod 666 error_log.json

# Expose the application's port
EXPOSE 3000

# Start the application
CMD [ "node", "app.js" ]

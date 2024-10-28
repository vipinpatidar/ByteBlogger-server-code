# Blog API

This blog API follows the MVC (Model-View-Controller) architecture, uses npm as the package manager, and MongoDB as the database.

# Live Preview

ByteBlogger: https://byteblogger-vipin.netlify.app

## Get Frontend Code

<div>
<a href="https://github.com/vipinpatidar/ByteBlogger-server-code" target="_blank">
For using frontend (Clone or download)
</a>
</div>
<br />

## what is there

- controllers: Contains the logic for handling requests and responses.
- models: Defines the data models used by the server.
- uploads: for uploaded files
- routes: Defines the API routes for different features.
- server.js: Entry point for the server.
- .env: Environmental variables file.
- package.json: NPM package configuration.

## Environmental Variables

- PORT=3000
- MONGODB_URL=mongodb://localhost:27017/your-database-name
- SECRET_KEY=your-secret-key
- STRIPE_KEY=your stripe public key

### Details for .env variable

- PORT: Port on which the server will run.
- MONGODB_URL: MongoDB connection URL.
- SECRET_KEY: Secret key for JWT (JSON Web Token) authentication.
- STRIPE_KEY=your stripe public key

## Installation

### Using Docker

### Adding frontend image to backend compose file

<div align="center">
<a href="https://github.com/vipinpatidar/ByteBlogger-client-side" target="_blank">
For using frontend image in docker-compose.yaml file, Go to frontend github repo download or clone it and create a image using it's Dockerfile and docker-compose.yaml files
</a>
</div>

<br />
<br />

#### add a .env file in server directory with environment variables like

      #PORT=3000
      #MONGODB_URL=your mongodb url
      #SECRET_KEY=jwt secret key
      #STRIPE_KEY=your stripe public key

<details>
<summary><code>Dockerfile</code></summary>

```Dockerfile

ARG NODE_VERSION=20.11.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD npm start

```

</details>

<details>
<summary><code>docker-compose.yaml</code></summary>

```dockerfile

# specify the version of docker-compose
version: "3.8"

# define the services/containers to be run
services:
  # define the frontend service
  # we can use any name for the service. A standard naming convention is to use "web" for the frontend
  web:
    depends_on:
      - server
    image: <Your frontend image will come here like: frontend-web:latest>
    # specify the ports to expose for the web service
    # the first number is the port on the host machine
    # the second number is the port inside the container
    ports:
      - 5173:5173

  # define the server service/container
  server:
    # server service depends on the db service so the db service will be started before the server service
    depends_on:
      - db

    # specify the build context for the server service
    build: .

    # specify the ports to expose for the server service
    # the first number is the port on the host machine
    # the second number is the port inside the container
    ports:
      - 3000:3000

    # specify environment variables for the server service
    # for demo purposes, we're using a local mongodb instance
    env_file:
      - .env

      # add a .env file in the server directory with envrioment variables like
      #PORT=3000
      #MONGODB_URL=your mongodb url
      #SECRET_KEY=jwt secret key
      #STRIPE_KEY=your stripe public key

    # establish docker compose watch mode for the server service
    develop:
      # specify the files to watch for changes
      watch:
        # it'll watch for changes in package.json and package-lock.json and rebuild the container and image if there are any changes
        - path: ./package.json
          action: rebuild
        - path: ./package-lock.json
          action: rebuild

        # it'll watch for changes in the server directory and sync the changes with the container real time
        - path: .
          target: /app
          action: sync

  # define the db service
  db:
    # specify the image to use for the db service from docker hub. If we have a custom image, we can specify that in this format
    # In the above two services, we're using the build context to build the image for the service from the Dockerfile so we specify the image as "build: ./frontend" or "build: ./backend".
    # but for the db service, we're using the image from docker hub so we specify the image as "image: mongo:latest"
    # you can find the image name and tag for mongodb from docker hub here: https://hub.docker.com/_/mongo
    image: mongo:latest

    # specify the ports to expose for the db service
    # generally, we do this in server service using mongodb atlas. But for demo purposes, we're using a local mongodb instance
    # usually, mongodb runs on port 27017. So we're exposing the port 27017 on the host machine and mapping it to the port 27017 inside the container
    ports:
      - 27017:27017

    # specify the volumes to mount for the db service
    # we're mounting the volume named "blogAppDB" inside the container at /data/db directory
    # this is done so that the data inside the mongodb container is persisted even if the container is stopped
    volumes:
      - blogAppDB:/data/db

# define the volumes to be used by the services
volumes:
  blogAppDB:

```

</details>

#### Creating Images and container from .yaml file

1.  Running in watch mode

    docker-compose watch

2.  Without watch mode

    docker-compose up

3.  Stop and Remove containers

    docker-compose down

### Using github clone

1. Clone the repository:
   git clone https://github.com/your-username/your-repo.git

2. Navigate to the project directory:
   cd your-repo

3. Install dependencies:
   npm install

## Running the Server

Start the server using the following command: npm start

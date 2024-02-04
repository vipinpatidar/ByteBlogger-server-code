# Blog API

This blog API follows the MVC (Model-View-Controller) architecture, uses npm as the package manager, and MongoDB as the database.

controllers: Contains the logic for handling requests and responses.
models: Defines the data models used by the server.
uploads: for uploaded files
routes: Defines the API routes for different features.
server.js: Entry point for the server.
.env: Environmental variables file.
package.json: NPM package configuration.

## Environmental Variables

PORT=3000
MONGODB_URL=mongodb://localhost:27017/your-database-name
SECRET_KEY=your-secret-key

### Details for .env variable

PORT: Port on which the server will run.
MONGODB_URL: MongoDB connection URL.
SECRET_KEY: Secret key for JWT (JSON Web Token) authentication.

## Installation

1. Clone the repository:
   git clone https://github.com/your-username/your-repo.git

2. Navigate to the project directory:
   cd your-repo

3. Install dependencies:
   npm install

## Running the Server

Start the server using the following command:npm start

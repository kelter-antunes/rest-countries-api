# REST Countries API Wrapper

This project is a REST API wrapper for [restcountries.com](https://restcountries.com), providing an easy-to-use interface for retrieving country data with caching, error logging, and Swagger documentation.

## Features
- **Caching:** Results are cached using `node-cache` to reduce redundant API calls.
- **Error Logging:** Errors are logged in `error_log.json` and tracked to provide health insights.
- **Swagger Documentation:** API routes are documented with JSDoc annotations, accessible via `/api-docs`.

## Tech Stack
- **Node.js** with Express
- **Axios** for API requests
- **Node-Cache** for caching
- **Docker** for containerization
- **Swagger** for API documentation

## Getting Started

### Prerequisites

- **Node.js**: [Install Node.js](https://nodejs.org/)
- **Docker**: [Install Docker](https://www.docker.com/get-started)

### Installation (Local Development)

1. Clone the repository:

    ```bash
    git clone https://github.com/kelter-antunes/rest-countries-api.git
    ```

2. Navigate to the project directory:

    ```bash
    cd rest-countries-api
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Start the server:

    ```bash
    npm start
    ```

5. The API will be running at `http://localhost:3000`. You can access Swagger documentation at `http://localhost:3000/api-docs`.

### API Endpoints

| Endpoint                  | Description                          |
|---------------------------|--------------------------------------|
| GET `/independent`         | Get all independent countries        |
| GET `/all`                 | Get all countries                    |
| GET `/name/{name}`         | Get country by name                  |
| GET `/alpha/{code}`        | Get country by code                  |
| GET `/currency/{currency}` | Get countries by currency            |
| GET `/lang/{language}`     | Get countries by language            |
| GET `/capital/{capital}`   | Get countries by capital city        |
| GET `/region/{region}`     | Get countries by region              |
| GET `/health`              | Get API health status                |

### Usage with Docker

You can pull the pre-built Docker image from Docker Hub and run it directly, or build it locally.

#### Pull the Docker Image

1. Pull the Docker image from Docker Hub:

    ```bash
    docker pull kelter/rest-countries-api:latest
    ```

2. Run the Docker container:

    ```bash
    docker run -p 3000:3000 kelter/rest-countries-api
    ```

The API will be accessible at `http://localhost:3000`.

#### Build the Docker Image Locally

1. Build the Docker image:

    ```bash
    docker build -t rest-countries-api .
    ```

2. Run the Docker container:

    ```bash
    docker run -p 3000:3000 rest-countries-api
    ```

### Environment Variables

| Variable      | Description                        | Default   |
|---------------|------------------------------------|-----------|
| `PORT`        | Port for the API to run on         | `3000`    |
| `CACHE_TTL`   | Cache Time-To-Live in seconds      | `3600`    |

### Error Logging

Errors are logged in `error_log.json`, located in the project root. It tracks errors within the last 24 hours and logs them along with timestamps.

### Health Check

The API provides a health check endpoint at `/health`, which returns:
- **Uptime**
- **Total number of requests**
- **Error rate in the last 24 hours**

### Swagger API Documentation

Once the server is running, you can access the Swagger documentation at:

```bash
http://localhost:3000/api-docs
```


This provides detailed information about the available API routes, parameters, and responses.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

If you have any questions or encounter issues, feel free to open an issue on GitHub!

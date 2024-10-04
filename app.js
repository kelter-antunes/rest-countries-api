const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const expressJSDocSwagger = require('express-jsdoc-swagger');

const app = express();
const port = process.env.PORT || 3000;

// Create a new cache instance
const cache = new NodeCache();

// Default TTL of 60 minutes (in seconds)
const DEFAULT_TTL = 60 * 60;

// Configurable cache TTL (in seconds)
const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : DEFAULT_TTL;

// Base URL for restcountries.com API
const BASE_URL = 'https://restcountries.com/v3.1';

// Error logging
const errorLogFile = path.join(__dirname, 'error_log.json');
let errorLog = { errors: [], totalRequests: 0 };

// Initialize error log
const initErrorLog = () => {
  try {
    if (fs.existsSync(errorLogFile)) {
      const data = fs.readFileSync(errorLogFile, 'utf8');
      if (data) {
        errorLog = JSON.parse(data);
      }
    } else {
      saveErrorLog();
    }
  } catch (error) {
    console.error('Error initializing error log:', error);
    saveErrorLog();
  }
};

// Function to save error log
const saveErrorLog = () => {
  fs.writeFileSync(errorLogFile, JSON.stringify(errorLog), 'utf8');
};

// Initialize error log on startup
initErrorLog();

// Function to log errors
const logError = (error) => {
  const now = new Date();
  errorLog.errors.push({ timestamp: now, message: error.message });
  
  // Remove errors older than 24 hours
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  errorLog.errors = errorLog.errors.filter(e => new Date(e.timestamp) > oneDayAgo);
  
  saveErrorLog();
};

// Swagger configuration
const swaggerOptions = {
  info: {
    version: '1.0.0',
    title: 'REST Countries API',
    description: 'A REST API wrapper for restcountries.com with caching',
  },
  security: {
    BasicAuth: {
      type: 'http',
      scheme: 'basic',
    },
  },
  baseDir: __dirname,
  filesPattern: './**/*.js',
  swaggerUIPath: '/api-docs',
  exposeSwaggerUI: true,
  exposeApiDocs: false,
  apiDocsPath: '/v3/api-docs',
  notRequiredAsNullable: false,
  swaggerUiOptions: {},
};

// Initialize Swagger
expressJSDocSwagger(app)(swaggerOptions);

// Middleware to handle caching and API requests
const cacheMiddleware = (endpoint) => async (req, res, next) => {
    // Replace placeholders in the endpoint (like :name) with actual values from req.params
    let apiEndpoint = endpoint;
    Object.keys(req.params).forEach((param) => {
        apiEndpoint = apiEndpoint.replace(`:${param}`, req.params[param]);
    });

    const key = `${apiEndpoint}${JSON.stringify(req.query)}`;
    errorLog.totalRequests++;

    console.log('key: ' + key);

    try {
        const cachedData = cache.get(key);

        if (cachedData) {
            console.log('key: ' + key + ' CACHE HIT');
            return res.json(cachedData);
        }

        console.log('key: ' + key + ' CACHE MISS');

        console.log('Calling: ' + `${BASE_URL}${apiEndpoint}`);

        const response = await axios.get(`${BASE_URL}${apiEndpoint}`, {
            params: req.query
        });
        const data = response.data;
        cache.set(key, data, CACHE_TTL);
        res.json(data);
    } catch (error) {
        logError(error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    } finally {
        saveErrorLog();
    }
};

/**
 * GET /independent
 * @summary Get all independent countries
 * @tags Countries
 * @param {boolean} status.query - Independent status
 * @return {object} 200 - Success response
 */
app.get('/independent', cacheMiddleware('/independent'));

/**
 * GET /all
 * @summary Get all countries
 * @tags Countries
 * @return {object} 200 - Success response
 */
app.get('/all', cacheMiddleware('/all'));

/**
 * GET /name/{name}
 * @summary Get country by name
 * @tags Countries
 * @param {string} name.path.required - Country name
 * @return {object} 200 - Success response
 */
app.get('/name/:name', cacheMiddleware('/name/:name'));

/**
 * GET /alpha/{code}
 * @summary Get country by code
 * @tags Countries
 * @param {string} code.path.required - Country code (cca2, ccn3, cca3 or cioc)
 * @return {object} 200 - Success response
 */
app.get('/alpha/:code', cacheMiddleware('/alpha/:code'));

/**
 * GET /currency/{currency}
 * @summary Get countries by currency
 * @tags Countries
 * @param {string} currency.path.required - Currency code or name
 * @return {object} 200 - Success response
 */
app.get('/currency/:currency', cacheMiddleware('/currency/:currency'));

/**
 * GET /lang/{language}
 * @summary Get countries by language
 * @tags Countries
 * @param {string} language.path.required - Language code or name
 * @return {object} 200 - Success response
 */
app.get('/lang/:language', cacheMiddleware('/lang/:language'));

/**
 * GET /capital/{capital}
 * @summary Get countries by capital city
 * @tags Countries
 * @param {string} capital.path.required - Capital city name
 * @return {object} 200 - Success response
 */
app.get('/capital/:capital', cacheMiddleware('/capital/:capital'));

/**
 * GET /region/{region}
 * @summary Get countries by region
 * @tags Countries
 * @param {string} region.path.required - Region name
 * @return {object} 200 - Success response
 */
app.get('/region/:region', cacheMiddleware('/region/:region'));

/**
 * GET /health
 * @summary Get API health status
 * @tags Health
 * @return {object} 200 - Health status of the API
 */
app.get('/health', (req, res) => {
  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const recentErrors = errorLog.errors.filter(e => new Date(e.timestamp) > oneDayAgo);
  const errorRate = errorLog.totalRequests > 0 ? (recentErrors.length / errorLog.totalRequests) * 100 : 0;

  res.json({
    status: 'OK',
    uptime: process.uptime(),
    totalRequests: errorLog.totalRequests,
    errorsLast24h: recentErrors.length,
    errorRate: `${errorRate.toFixed(2)}%`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  logError(err);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`REST Countries API listening at http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});
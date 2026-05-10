// src/app.js
const express = require('express');
const connectDB = require('../config/db');
const os = require('os');
const mongoose = require("mongoose");

const app = express();

connectDB();
// init middleware

app.use(express.json({ extended: false }));
app.get('/', (req, res) => res.send('API running'));

// define routes
app.use('/api/users', require('../routes/api/users'));
app.use('/api/auth', require('../routes/api/auth'));
app.use('/api/profile', require('../routes/api/profile'));
app.use('/api/posts', require('../routes/api/posts'));

const PORT = process.env.PORT || 5002;

// ============ HEALTH CHECK ENDPOINTS ============

/**
 * Liveness Probe - Simple health check
 * Checks if the application is running
 * Should be lightweight and fast
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});



/**
 * Readiness Probe - Comprehensive check
 * Checks if application is ready to serve traffic
 * Should verify database connections, external services, etc.
 */
app.get('/ready', async (req, res) => {
    try {
        const checks = {
            database: await checkDatabaseConnection(),
            timestamp: new Date().toISOString()
        };

        const allHealthy = checks.database.status === 'healthy';

        if (allHealthy) {
            res.status(200).json({
                status: 'ready',
                checks: checks
            });
        } else {
            res.status(503).json({
                status: 'not ready',
                checks: checks
            });
        }
    } catch (error) {
        console.error('Readiness check failed:', error);
        res.status(503).json({
            status: 'not ready',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Deep Health Check - Detailed diagnostics
 * Optional endpoint for debugging
 */
app.get('/healthz', async (req, res) => {
    const startTime = Date.now();

    const healthInfo = {
        status: 'healthy',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: os.loadavg(),
        timestamp: new Date().toISOString(),
        checks: {
            database: await getDatabaseStatus(),
            api: { status: 'healthy', responseTime: `${Date.now() - startTime}ms` }
        }
    };

    // Check if database is connected
    const dbConnected = healthInfo.checks.database.status === 'connected';

    if (!dbConnected) {
        healthInfo.status = 'degraded';
    }

    const statusCode = healthInfo.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthInfo);
});

// ============ HEALTH CHECK HELPER FUNCTIONS ============

/**
 * Check database connection status
 */
async function checkDatabaseConnection() {
    try {
        // Check mongoose connection state
        //const dbState = mongoose.connection.readyState;
        const dbState = mongoose.connection.readyState;
        const states = {
            0: { status: 'disconnected', healthy: false },
            1: { status: 'connected', healthy: true },
            2: { status: 'connecting', healthy: false },
            3: { status: 'disconnecting', healthy: false },
            99: { status: 'uninitialized', healthy: false }
        };

        const state = states[dbState] || states[99];

        if (state.healthy) {
            // Optional: Execute a simple query to verify actual connectivity
            if (mongoose.connection.db) {
                await mongoose.connection.db.admin().ping();
            }
            return {
                status: 'healthy',
                state: state.status,
                message: 'Database is connected and responding'
            };
        } else {
            return {
                status: 'unhealthy',
                state: state.status,
                message: 'Database is not ready'
            };
        }
    } catch (error) {
        console.error('Database health check failed:', error);
        return {
            status: 'unhealthy',
            state: 'error',
            error: error.message,
            message: 'Database connection check failed'
        };
    }
}

/**
 * Get detailed database status (for debug endpoint)
 */
async function getDatabaseStatus() {
    try {
        const dbState = mongoose.connection.readyState;
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

        let details = {
            state: states[dbState] || 'unknown',
            readyState: dbState,
            host: mongoose.connection.host || 'unknown',
            name: mongoose.connection.name || 'unknown'
        };

        // Get connection pool stats if connected
        if (dbState === 1 && mongoose.connection.client) {
            const serverStatus = await mongoose.connection.db.admin().serverStatus();
            details.connections = serverStatus.connections;
        }

        return {
            status: dbState === 1 ? 'healthy' : 'unhealthy',
            details: details
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}



app.listen(PORT, () => console.log(`server started on port ${PORT}`));

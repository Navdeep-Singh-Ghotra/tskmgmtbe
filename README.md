# tskmgmtbe
Taskmanagement backend

This is API for Task manager

Tech stack is Node.js and express

{Node.js with Express , Next.js API Routes, Python with Django/Flask, Go (Golang), Java with Spring Boot}

Authentication ,
CRUD ,
DB integration


`npm init`
`mkdir src`
`mkdir src/models src/routes src/middleware src/controllers src/config`
`cat > .gitignore << EOF
node_modules/
.env
*.log
coverage/
.DS_Store
EOF`

`npm init -y`

# Install production dependencies
`npm install express mongoose bcryptjs jsonwebtoken dotenv cors`

# Install development dependencies
`npm install -D nodemon jest supertest`

# Optional: Install additional useful packages
`npm install express-validator helmet compression`
`npm install -D @types/jest @types/supertest`

DB is Mongo



# Access PostgreSQL
sudo -u postgres psql

# Run these SQL commands:
CREATE DATABASE taskmanager;
CREATE USER taskadmin WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE taskmanager TO taskadmin;
\c taskmanager  -- Connect to database

put this as mongoURI in config default `mongosh` `db.getMongo().getURI()`

`npx kill-port 5000`

`mongod --version`

### How make the app cloud native ?

Containerize with Docker --> done, added dockerfile, changes required though

Environment-based configuration --> how , add .env for local, inject them during deployment via container orchestration kubernetes

Stateless architecture --> how, Implement 12-Factor App Principles

// Use environment variables
const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Validate required env vars
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`${varName} is required`);
  }
});

// Use external services for state
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store: new RedisStore({
    url: process.env.REDIS_URL
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

Health checks implemented --> 

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

Structured logging --> how

// Use structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});

// Log HTTP requests with correlation IDs
app.use((req, res, next) => {
  req.id = require('crypto').randomUUID();
  logger.info('Request started', {
    requestId: req.id,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent')
  });
  next();
});

Metrics endpoint --> how

Graceful shutdown --> how
const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

const gracefulShutdown = () => {
  logger.info('Received shutdown signal, starting graceful shutdown');
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections
    db.close().then(() => {
      logger.info('Database connections closed');
      process.exit(0);
    });
  });

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

Resource limits defined

CI/CD pipeline

Security scanning in pipeline

Automated rollback strategy

Make changes to architect Node.js + MongoDB application as:

 Scalable with connection pooling and replica sets

 Resilient with health checks and graceful shutdown

 Observable with comprehensive logging and metrics

 Secure with input sanitization and rate limiting

 Kubernetes-ready with proper probes and resource limits

 Performant with query optimization and caching

 Maintainable with structured logging and monitoring


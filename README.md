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

`mongod --version


// server/config/database.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Database configuration with best practices
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    
    // Logging configuration
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Connection pool configuration for better performance
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,      // Maximum number of connections
      min: parseInt(process.env.DB_POOL_MIN) || 5,       // Minimum number of connections
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000,  // 60 seconds to get connection
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,        // 10 seconds before closing idle connection
      evict: parseInt(process.env.DB_POOL_EVICT) || 1000,       // Check for idle connections every second
      handleDisconnects: true                            // Automatically handle disconnects
    },
    
    // Database options for better performance and reliability
    dialectOptions: {
      charset: 'utf8mb4',
      // Connection timeout (MySQL2 compatible options)
      connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 60000,
      // Enable SSL in production
      ...(process.env.NODE_ENV === 'production' && process.env.DB_SSL === 'true' && {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      })
    },
    
    // Query options
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      underscored: true,        // Use snake_case for auto-generated fields
      freezeTableName: true,    // Don't pluralize table names
      timestamps: true          // Add createdAt and updatedAt by default
    },
    
    // Timezone configuration
    timezone: process.env.DB_TIMEZONE || '+00:00',
    
    // Retry configuration
    retry: {
      max: parseInt(process.env.DB_RETRY_MAX) || 3,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ENETUNREACH/,
        /ER_LOCK_WAIT_TIMEOUT/,
        /ER_LOCK_DEADLOCK/
      ]
    },
    
    // Benchmark queries in development
    benchmark: process.env.NODE_ENV === 'development'
  }
);

// Connection test and initialization
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Additional connection info in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Connected to: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    
    // Log additional error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', error);
    }
    
    // Exit process in production if database connection fails
    if (process.env.NODE_ENV === 'production') {
      console.error('Database connection failed in production. Exiting...');
      process.exit(1);
    }
  }
};

// Initialize database connection
initializeDatabase();

// Graceful shutdown handling
const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('📴 Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Closing database connection...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Closing database connection...');
  await closeDB();
  process.exit(0);
});

// Connection event handlers for monitoring (MySQL compatible)
sequelize.addHook('afterConnect', (connection, config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 New database connection established');
  }
});

sequelize.addHook('beforeDisconnect', (connection) => {
  console.warn('🔌 Database connection closing');
});

// Add helper methods to sequelize instance
sequelize.connectDB = initializeDatabase;
sequelize.closeDB = closeDB;

module.exports = sequelize;
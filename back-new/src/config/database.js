const mongoose = require('mongoose');

// MongoDB connection options with connection pooling
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  w: 'majority'
};

// Get MongoDB URI from environment variables or use default
const getMongoURI = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  
  const host = process.env.MONGODB_HOST || 'localhost';
  const port = process.env.MONGODB_PORT || '27017';
  const database = process.env.MONGODB_DATABASE || 'student_portal';
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;
  
  if (username && password) {
    return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;
  }
  
  return `mongodb://${host}:${port}/${database}`;
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = getMongoURI();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 Connecting to MongoDB...');
      console.log(`📍 URI: ${mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    }
    
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Set up connection event listeners
    setupConnectionListeners();
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Please check your MongoDB connection settings');
    console.error('💡 Make sure MongoDB is running and accessible');
    
    // Exit process with failure code
    process.exit(1);
  }
};

// Set up connection event listeners
const setupConnectionListeners = () => {
  const db = mongoose.connection;
  
  // Connection opened
  db.on('open', () => {
    console.log('🚀 MongoDB connection opened');
  });
  
  // Connection error
  db.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
  });
  
  // Connection disconnected
  db.on('disconnected', () => {
    console.log('🔌 MongoDB disconnected');
  });
  
  // Connection reconnected
  db.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });
  
  // Connection closed
  db.on('close', () => {
    console.log('🔒 MongoDB connection closed');
  });
  
  // Process termination handlers
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, closing MongoDB connection...');
    await closeConnection();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, closing MongoDB connection...');
    await closeConnection();
    process.exit(0);
  });
};

// Close database connection
const closeConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed successfully');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};

// Get connection status
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    isConnected: mongoose.connection.readyState === 1
  };
};

// Health check function
const healthCheck = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        message: 'Database not connected',
        timestamp: new Date().toISOString(),
        connection: getConnectionStatus()
      };
    }
    
    // Test database operation
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      message: 'Database connection is working',
      timestamp: new Date().toISOString(),
      connection: getConnectionStatus()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      connection: getConnectionStatus()
    };
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const stats = await mongoose.connection.db.stats();
    
    return {
      collections: stats.collections,
      views: stats.views,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      totalSize: stats.totalSize,
      scaleFactor: stats.scaleFactor,
      fsUsedSize: stats.fsUsedSize,
      fsTotalSize: stats.fsTotalSize
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
};

// Get collection information
const getCollectionsInfo = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const collectionsInfo = await Promise.all(
      collections.map(async (collection) => {
        try {
          const stats = await mongoose.connection.db.collection(collection.name).stats();
          return {
            name: collection.name,
            type: collection.type,
            options: collection.options,
            info: collection.info,
            stats: {
              count: stats.count,
              size: stats.size,
              avgObjSize: stats.avgObjSize,
              storageSize: stats.storageSize,
              totalIndexSize: stats.totalIndexSize,
              totalSize: stats.totalSize
            }
          };
        } catch (error) {
          return {
            name: collection.name,
            type: collection.type,
            options: collection.options,
            info: collection.info,
            error: error.message
          };
        }
      })
    );
    
    return collectionsInfo;
  } catch (error) {
    console.error('Error getting collections info:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    console.log('🧪 Testing database connection...');
    
    const conn = await connectDB();
    
    // Test basic operations
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful');
    
    // Get database info
    const dbInfo = await mongoose.connection.db.admin().listDatabases();
    console.log('📊 Available databases:', dbInfo.databases.map(db => db.name));
    
    // Get collection count
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections in current database: ${collections.length}`);
    
    console.log('✅ Database connection test completed successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

module.exports = {
  connectDB,
  closeConnection,
  getConnectionStatus,
  healthCheck,
  getDatabaseStats,
  getCollectionsInfo,
  testConnection,
  getMongoURI
};

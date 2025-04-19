import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const AppwriteConfig = {
  endpoint: process.env.REACT_APP_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.REACT_APP_APPWRITE_PROJECT_ID || '67bb24ad002378e79e38',
  databaseId: process.env.REACT_APP_APPWRITE_DATABASE_ID || '67bb32ca00157be0d0a2',
  reposCollectionId: process.env.REACT_APP_APPWRITE_REPOS_COLLECTION_ID || '67ec0ff5002cafd109d7',
  commandsCollectionId: process.env.REACT_APP_APPWRITE_COMMANDS_COLLECTION_ID || '67ec1ff5002cafd109e8',
  bucketId: process.env.REACT_APP_APPWRITE_BUCKET_ID || '67c698210004ee988ef1'
};

const client = new Client();
client
  .setEndpoint(AppwriteConfig.endpoint)
  .setProject(AppwriteConfig.projectId);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Export everything needed, including ID and Query
export {
  client,
  account,
  databases,
  storage,
  AppwriteConfig,
  ID,
  Query
};


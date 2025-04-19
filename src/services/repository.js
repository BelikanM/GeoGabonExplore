import { databases, storage, ID, Query, AppwriteConfig } from './appwrite';

const { databaseId, reposCollectionId, commandsCollectionId, bucketId } = AppwriteConfig;

// Repository functions
export const createRepository = async (userId, name, description) => {
  try {
    return await databases.createDocument(
      databaseId,
      reposCollectionId,
      ID.unique(),
      {
        user_id: userId,
        name,
        description,
        created_at: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Error creating repository:', error);
    throw error;
  }
};

export const getUserRepositories = async (userId) => {
  try {
    return await databases.listDocuments(
      databaseId,
      reposCollectionId,
      [Query.equal('user_id', userId)]
    );
  } catch (error) {
    console.error('Error getting repositories:', error);
    throw error;
  }
};

export const getRepositoryById = async (repoId) => {
  try {
    return await databases.getDocument(
      databaseId,
      reposCollectionId,
      repoId
    );
  } catch (error) {
    console.error('Error getting repository:', error);
    throw error;
  }
};

export const deleteRepository = async (repoId) => {
  try {
    // First delete all commands associated with this repository
    const commands = await getRepositoryCommands(repoId);
    
    for (const command of commands.documents) {
      await deleteCommand(command.$id);
    }
    
    // Then delete the repository
    return await databases.deleteDocument(
      databaseId,
      reposCollectionId,
      repoId
    );
  } catch (error) {
    console.error('Error deleting repository:', error);
    throw error;
  }
};

// Command functions
export const addCommand = async (repoId, name, script) => {
  try {
    return await databases.createDocument(
      databaseId,
      commandsCollectionId,
      ID.unique(),
      {
        repo_id: repoId,
        name,
        script,
        created_at: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Error adding command:', error);
    throw error;
  }
};

export const getRepositoryCommands = async (repoId) => {
  try {
    return await databases.listDocuments(
      databaseId,
      commandsCollectionId,
      [Query.equal('repo_id', repoId)]
    );
  } catch (error) {
    console.error('Error getting commands:', error);
    throw error;
  }
};

export const getCommandById = async (commandId) => {
  try {
    return await databases.getDocument(
      databaseId,
      commandsCollectionId,
      commandId
    );
  } catch (error) {
    console.error('Error getting command:', error);
    throw error;
  }
};

export const deleteCommand = async (commandId) => {
  try {
    return await databases.deleteDocument(
      databaseId,
      commandsCollectionId,
      commandId
    );
  } catch (error) {
    console.error('Error deleting command:', error);
    throw error;
  }
};

// File storage functions for repositories
export const uploadFile = async (file, repoId) => {
  try {
    return await storage.createFile(
      bucketId,
      ID.unique(),
      file,
      [`repo:${repoId}`]
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getFilePreview = (fileId) => {
  return storage.getFilePreview(bucketId, fileId);
};

export const getRepoFiles = async (repoId) => {
  try {
    return await storage.listFiles(
      bucketId,
      [Query.equal('tags', [`repo:${repoId}`])]
    );
  } catch (error) {
    console.error('Error getting repo files:', error);
    throw error;
  }
};

export const deleteFile = async (fileId) => {
  try {
    return await storage.deleteFile(bucketId, fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};


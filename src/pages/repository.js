import { databases, storage, ID, Query, AppwriteConfig } from './appwrite';

class RepositoryService {
  // Repository methods
  async createRepository(data) {
    try {
      const repository = await databases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.reposCollectionId,
        ID.unique(),
        data
      );
      return repository;
    } catch (error) {
      throw error;
    }
  }

  async getRepositories(userId) {
    try {
      const repositories = await databases.listDocuments(
        AppwriteConfig.databaseId,
        AppwriteConfig.reposCollectionId,
        [
          Query.equal('userId', userId)
        ]
      );
      return repositories;
    } catch (error) {
      throw error;
    }
  }

  async getRepository(id) {
    try {
      const repository = await databases.getDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.reposCollectionId,
        id
      );
      return repository;
    } catch (error) {
      throw error;
    }
  }

  async updateRepository(id, data) {
    try {
      const repository = await databases.updateDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.reposCollectionId,
        id,
        data
      );
      return repository;
    } catch (error) {
      throw error;
    }
  }

  async deleteRepository(id) {
    try {
      await databases.deleteDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.reposCollectionId,
        id
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Command methods
  async createCommand(data) {
    try {
      const command = await databases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.commandsCollectionId,
        ID.unique(),
        data
      );
      return command;
    } catch (error) {
      throw error;
    }
  }

  async getCommands(repositoryId) {
    try {
      const commands = await databases.listDocuments(
        AppwriteConfig.databaseId,
        AppwriteConfig.commandsCollectionId,
        [
          Query.equal('repositoryId', repositoryId)
        ]
      );
      return commands;
    } catch (error) {
      throw error;
    }
  }

  async getCommand(id) {
    try {
      const command = await databases.getDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.commandsCollectionId,
        id
      );
      return command;
    } catch (error) {
      throw error;
    }
  }

  async updateCommand(id, data) {
    try {
      const command = await databases.updateDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.commandsCollectionId,
        id,
        data
      );
      return command;
    } catch (error) {
      throw error;
    }
  }

  async deleteCommand(id) {
    try {
      await databases.deleteDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.commandsCollectionId,
        id
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  // File upload method
  async uploadFile(file) {
    try {
      const response = await storage.createFile(
        AppwriteConfig.bucketId,
        ID.unique(),
        file
      );
      
      const fileUrl = storage.getFileView(
        AppwriteConfig.bucketId,
        response.$id
      );
      
      return {
        fileId: response.$id,
        fileUrl
      };
    } catch (error) {
      throw error;
    }
  }

  // File deletion method
  async deleteFile(fileId) {
    try {
      await storage.deleteFile(
        AppwriteConfig.bucketId,
        fileId
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
}

const repositoryService = new RepositoryService();

export default repositoryService;


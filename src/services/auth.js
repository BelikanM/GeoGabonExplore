import { account, ID } from './appwrite';

class AuthService {
  async createAccount(email, password, name) {
    try {
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      if (newAccount) {
        // Login immediately after account creation
        return await this.login(email, password);
      } else {
        return newAccount;
      }
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      return await account.createEmailSession(email, password);
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      console.log("Error getting current user: ", error);
      return null;
    }
  }

  async logout() {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;


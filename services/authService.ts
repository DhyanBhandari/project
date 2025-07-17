import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export class AuthService {
  static async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      throw error;
    }
  }

  static async getIdToken(): Promise<string | null> {
    const user = auth().currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}

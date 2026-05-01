export function getFirebaseAuthMessage(error) {
  switch (error?.code) {
    case "auth/admin-restricted-operation":
    case "auth/operation-not-allowed":
      return "Email/password sign up is not enabled. In Firebase Console, go to Authentication > Sign-in method and enable Email/Password.";
    case "auth/api-key-not-valid":
    case "auth/invalid-api-key":
      return "The Firebase API key is not valid for this project. Check frontend/.env and restart the Vite dev server.";
    case "auth/configuration-not-found":
      return "Firebase Authentication is not configured for this project yet. Enable Authentication in Firebase Console.";
    case "auth/email-already-in-use":
      return "An account already exists for this email. Log in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "The email or password is incorrect.";
    case "auth/weak-password":
      return "Use a password with at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error while contacting Firebase. Check your connection and try again.";
    default:
      return error?.message || "Firebase authentication failed. Check your Firebase project settings.";
  }
}

export const googleAuthService = {
  login: async () => {
    await new Promise(resolve =>
      setTimeout(resolve, 1500)
    );

    const random =
      Math.floor(Math.random() * 10);

    if (random < 2) {
      throw new Error(
        'User cancelled login'
      );
    }

    if (random < 4) {
      throw new Error(
        'Network error'
      );
    }

    return {
      user: {
        id: 'google-user-1',
        name: 'Google User',
        email:
          'google.user@gmail.com',
        profileImage:
          'https://picsum.photos/200',
      },

      token: `google_token_${Date.now()}`,
    };
  },
};
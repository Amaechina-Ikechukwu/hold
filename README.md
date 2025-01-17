# HOLD: A Secure Clipboard Manager

## Overview
HOLD is a secure clipboard manager app built with **Expo React Native**. It addresses the issue of copied content being removed from the clipboard after a short duration by providing a persistent and secure storage solution. The app includes robust security features to protect sensitive data and offers a user-friendly interface for managing clipboard content.

## Features

### Core Features
- **Persistent Clipboard History**: Save clipboard content for as long as you need.
- **Categorized Storage**: Organize saved clipboard entries into customizable categories.
- **Search Functionality**: Quickly find specific entries using keywords.

### Security Features
- **Encryption**: Clipboard content is encrypted using AES-256 to ensure maximum security.
- **Biometric Authentication**: Access your clipboard vault using fingerprint or face recognition.
- **Auto-Lock**: Automatically locks the app after a specified period of inactivity.
- **Secure Deletion**: Erase clipboard content permanently, ensuring it cannot be recovered.

### Additional Features
- **Cross-Device Sync**: Sync clipboard data securely across multiple devices (optional feature).
- **Backup and Restore**: Create encrypted backups and restore them as needed.
- **Dark Mode**: Seamless light and dark theme support.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hold.git
   ```
2. Navigate to the project directory:
   ```bash
   cd hold
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```
4. Start the Expo development server:
   ```bash
   expo start
   ```

## Technologies Used
- **React Native**: For building the mobile application.
- **Expo**: To streamline development and handle platform-specific configurations.
- **Expo SecureStore**: For securely storing sensitive data.
- **React Navigation**: For seamless navigation between screens.
- **CryptoJS**: For encrypting clipboard content.
- **React Native Biometrics**: For implementing biometric authentication.


## Usage
1. **Launch the App**:
   Open the app from your device or simulator.
2. **Save Clipboard Content**:
   - Copy content from any app.
   - Open HOLD, and the content will be automatically saved.
3. **Organize Content**:
   - Use categories to organize saved items.
   - Edit or delete entries as needed.
4. **Secure Your Data**:
   - Enable biometric authentication in the settings.
   - Set an auto-lock duration for added security.

## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- The **Expo** and **React Native** communities for their fantastic tools and support.
- Open-source libraries and contributors for making secure and efficient development possible.

## Contact
For questions or support, please contact:
- **Your Name**: [your.email@example.com](mailto:your.email@example.com)
- GitHub: [yourusername](https://github.com/yourusername)


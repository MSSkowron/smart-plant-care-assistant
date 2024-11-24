# Smart Plant Care Assistant

![Logo](./docs/logo.jpg 'Logo')

## Overview

Smart Plant Care Assistant is a mobile application designed to help users manage their plants effectively. With the integration of AI, the app enables plant species recognition, provides watering and care schedules, monitors room lighting conditions, and offers notifications to keep plants healthy. The app supports multi-user authentication and can even detect plant diseases using external APIs.

## Authors

- [Mateusz Skowron](https://github.com/MSSkowron)

- [Karol Wrona](https://github.com/Kawron)

## Technology Stack

Client: [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)

Server: [Supabase](https://supabase.com/)

## Getting Started

Follow these steps to set up and run the app on your local environment.

### Prerequisites

- [Node.js](https://nodejs.org/en) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed

### Installation

1. **Clone the repository**

    Open your terminal and run:

    ```bash
    git clone https://github.com/MSSkowron/smart-plant-care-assistant
    cd smart-plant-care-assistant
    ```

2. **Install dependencies**

    Install the project dependencies:

    ```bash
    npm install
    ```

3. **Configure environment variables**

    Create a .env.local file in the root directory:

    ```bash
    touch .env.local
    ```

    Add the following variables to `.env.local`:

    - `EXPO_PUBLIC_SUPABASE_URL="your-supabase-url"`
    - `EXPO_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"`
    - `EXPO_PUBLIC_PLANTNET_API_KEY="your-plantnet-api-key"`

    Replace each placeholder with your actual credentials:

    - `your-supabase-url`: Your Supabase project URL.
    - `your-supabase-anon-key`: Your Supabase anonymous API key.
    - `your-plantnet-api-key`: Your PlantNet API key.

    These variables are essential for backend communication and plant identification functionality.

4. **Build the Application**

    ```bash
    npm run build
    ```

    This command uses Expo Application Services (EAS) to build the app. Ensure you are logged into your EAS account before proceeding.

    Upon completion, a QR code and a download link will be provided. Use them to download the app to your desired device.

5. **Start the Server**

    Launch the Expo development server:

    ```bash
    npm run start
    ```

    In the output, you'll find options to open the app in:

    - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
    - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
    - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
    - [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

    Once the server is running, open the app on your device using the provided QR code or link.

    Alternatively, you can start the server using a tunnel to expose the app over a public URL:

    ```bash
    npm run start-tunnel
    ```

### Development Tools

- **Linting**: Run `npm run lint` to execute [ESLint](https://eslint.org/) and check your code for potential issues.

    Configuration file: [.eslintrc.js](./.eslintrc.js).

- **Formatting**: Use `npm run format` to automatically format your code with [Prettier](https://prettier.io/).

    Configuration file: [.prettierrc](./.prettierrc).

## License

This project is licensed under the [MIT License](./LICENSE).

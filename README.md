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

1. Clone the repository

    ```bash
    git clone https://github.com/MSSkowron/smart-plant-care-assistant
    cd smart-plant-care-assistant
    ```

2. Install dependencies

    ```bash
    npm install
    ```

3. Start the app

    ```bash
     npx expo start
    ```

    In the output, you'll find options to open the app in:

    - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
    - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
    - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
    - [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

### Development Tools

- **Linting**: Run `npm run lint` to execute [ESLint](https://eslint.org/) and check your code for potential issues.

    Configuration file: [.eslintrc.js](./.eslintrc.js).

- **Formatting**: Use `npm run format` to automatically format your code with [Prettier](https://prettier.io/).

    Configuration file: [.prettierrc](./.prettierrc).

## License

This project is licensed under the [MIT License](./LICENSE).

# Xrtemis Studio

A modern Learning Management System (LMS) built with Astro for managing training modules, trainees, and XR headset onboarding.

## Features

- **Dashboard**: Centralized management interface for organizations, modules, and trainees
- **Trainee Management**: Comprehensive overview and onboarding of trainees
- **Module Subscriptions**: Track and manage module access for users
- **XR Headset Onboarding**: Step-by-step guides for headset setup, APK installation, and device connection
- **API Endpoints**: RESTful APIs for data management and integrations
- **Documentation**: Integrated documentation system using MDX
- **Responsive Design**: Built with Tailwind CSS for mobile-first responsive UI

## Tech Stack

- **Frontend**: Astro, TypeScript, Tailwind CSS, DaisyUI
- **Backend**: Directus (headless CMS)
- **Database**: Via Directus (supports PostgreSQL, MySQL, etc.)
- **XR Integration**: Android Debug Bridge (ADB) libraries for headset management
- **Tables**: Tabulator.js for advanced data tables
- **Deployment**: Node.js adapter for server-side rendering

## Prerequisites

- Node.js (v18 or higher)
- Directus instance running (for backend data management)
- ADB-compatible XR headsets (for headset onboarding features)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd xrtemis-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```env
   DIRECTUS_ACCESS_TOKEN=your_directus_token
   DIRECTUS_API_PROTOCOL=http
   DIRECTUS_API_HOST=localhost
   DIRECTUS_API_PORT=8055
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:4321`

## Build & Deployment

1. Build for production:
   ```bash
   npm run build
   ```

2. Preview the build:
   ```bash
   npm run preview
   ```

## API Endpoints

- `/api/misc-util/` - Utility functions for trainee management
- `/api/module-access/[org_id]/[user_token]` - Module access verification
- `/api/public-util/` - Public utilities
- `/api/table-data/` - Data for dashboard tables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

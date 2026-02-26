# SolusiKos Prototype

## 🚧 Project Status: Prototype 🚧

This project is an early-stage prototype for **SolusiKos**, a modern web application designed to connect boarding house (`Kos`) owners with potential renters in Indonesia. It provides a platform for searching, viewing, and managing boarding house listings.

## ✨ Features

The prototype currently includes the following features:

*   **User Roles:** Separate dashboard interfaces for different user types:
    *   **Penyedia (Provider/Owner):** Can manage their property listings.
    *   **Penghuni (Tenant):** Can manage their bookings and view their rental status.
    *   **Admin:** Centralized administration panel.
*   **Property Search:** A dedicated page (`/cari`) for users to search for available boarding houses.
*   **Property Details:** Dynamic pages for each property (`/kos/[id]`) showing detailed information.
*   **Booking:** A booking system (`/booking/[id]`) to facilitate the rental process.
*   **User Authentication:** Pages for user sign-in (`/masuk`) and registration (`/daftar`).
*   **User Dashboards:** Personalized dashboards for each user role to manage their activities.

## 🛠️ Technology Stack

This project is built with a modern web development stack:

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** Likely using [shadcn/ui](https://ui.shadcn.com/) or a similar component library, as indicated by the structure in `components/ui`.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm (or pnpm/yarn) installed.

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/solusikos-proto1.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
    or
    ```sh
    pnpm install
    ```

### Running the Development Server

Start the development server by running:

```sh
npm run dev
```
or
```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

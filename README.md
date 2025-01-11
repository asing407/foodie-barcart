# The Alchemy - Restaurant & Bar Web Application 🍽️🍸

**The Alchemy** is a modern, fully functional restaurant and bar web application that allows users to browse the menu, place orders, and securely pay for their food and drinks. The app features a mobile-first design with QR code ordering, a countdown timer for order delivery, and real-time notifications. It’s built using **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**, with **Stripe** for payment processing.

## 🚀 Features

- **Mobile-First UI**: Optimized for smartphones with a responsive design.
- **QR Code Ordering**: Users can scan QR codes to view menus and place orders directly from their phones.
- **Real-Time Order Tracking**: Instant updates on order status with real-time notifications.
- **Order Management**: Dynamic cart and checkout functionality, allowing users to easily manage their orders.
- **Stripe Integration**: Secure and seamless payment system with **Stripe** for PCI-compliant transactions.
- **10-Minute Delivery Timer**: A countdown timer for the order delivery with an interactive "Order Received" button to stop the timer.

## 🛠️ Tech Stack

- **Frontend**: 
  - **React**: A JavaScript library for building user interfaces.
  - **TypeScript**: Adds static typing to JavaScript for better scalability and reliability.
  - **Tailwind CSS**: Utility-first CSS framework for responsive and fast UI development.
- **Backend**:
  - **Supabase**: Open-source alternative to Firebase for database management.
- **Payment Integration**:
  - **Stripe**: A popular payment processing platform.
- **Deployment**:
  - **Vercel** (currently) for rapid deployment and hosting.
  - **AWS** (planned) for better scalability and performance.

## 📱 Demo

Check out the live demo of **The Alchemy**:  
👉 [**The Alchemy** - Live App](https://thealchemy.vercel.app/)

## ⚡ Installation

### Prerequisites

To run the project locally, ensure you have the following installed:

- **Node.js**: [Install Node.js](https://nodejs.org/)
- **npm** or **yarn**: A package manager (npm comes with Node.js)

### Steps to Set Up

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/asing407/foodie-barcart.git
   cd foodie-barcart
2. Install dependencies:
   npm i
   or
   yarn install
   and
   npm install vite

4. Set up Supabase (for database):
   Create a Supabase account and set up a new project.
   Add your Supabase URL and API key to .env file (template available in the repo).
   
5. Set up Stripe (for payment):
   
   Create a Stripe account and get your API keys.
   Add the keys to the .env file.
6. Run the application:
   npm start
   # or
   yarn start


Open the app in your browser at http://localhost:8080

## 📝 Roadmap
This project is still a work in progress, and more features will be added over time. Some upcoming functionalities include:

Improved order tracking and user notifications.
User profiles for order history and preferences.
Support for multiple payment methods.
Enhanced admin dashboard for managing orders.
## 🙏 Special Thanks
A special thank you to Aryan Singh for providing invaluable guidance and support throughout the development of this project.

## 💬 Contact
Feel free to open an issue or send a pull request if you have any suggestions, improvements, or questions!

## License
This project is licensed under the MIT License - see the LICENSE file for details.

This format is optimized for a GitHub repository. You can copy-paste it directly into your `README.md` file in your GitHub repo.



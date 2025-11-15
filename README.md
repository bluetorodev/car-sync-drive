# Car Sync Drive 🚗
A modern, full-featured vehicle fleet management application designed to help you stay on top of your vehicle care with comprehensive tracking for maintenance, expenses, and fuel consumption.
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://car-sync-drive.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-92.7%25-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
## 🌟 Features
### 🔧 Maintenance Tracking
Schedule and track all vehicle maintenance tasks with ease. Never miss an oil change, tire rotation, or any other important service:
- Set maintenance reminders and schedules
- Track service history for all vehicles
- Monitor upcoming maintenance tasks
- Keep detailed records of all work performed
### 💰 Expense Management
Log and categorize all vehicle-related expenses to gain a clear understanding of your total cost of ownership:
- Categorize expenses (fuel, maintenance, insurance, etc.)
- Track spending over time
- Visualize expense trends
- Comprehensive cost analysis per vehicle
### ⛽ Fuel Economy Tracking
Monitor fuel consumption and calculate your vehicle's Miles Per Gallon (MPG) to optimize efficiency and reduce costs:
- Log fuel fill-ups with odometer readings
- Calculate real-time MPG metrics
- Track fuel spending trends
- Identify efficiency patterns
### 🚙 Multi-Vehicle Support
Manage multiple vehicles from a single dashboard with individual tracking for each vehicle's:
- Maintenance schedules
- Expense records
- Fuel consumption data
- Vehicle-specific details
## 🛠️ Tech Stack
- **Frontend Framework:** React 18.3.1
- **Language:** TypeScript 5.8.3
- **Build Tool:** Vite 5.4.19
- **Styling:** TailwindCSS 3.4.17
- **UI Components:** Radix UI + shadcn/ui
- **Backend:** Supabase (PostgreSQL)
- **State Management:** TanStack React Query 5.83.0
- **Routing:** React Router DOM 6.30.1
- **Form Handling:** React Hook Form 7.61.1 + Zod validation
- **Charts:** Recharts 2.15.4
- **Deployment:** Vercel
## 🚀 Getting Started
### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- A Supabase account and project
### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/bluetorodev/car-sync-drive.git
   cd car-sync-drive
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Update the following variables in your `.env` file:
   ```env
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   ```
4. **Set up Supabase database**
   
   Run the migration files located in the `supabase/` directory to set up your database schema.
5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`
## 📜 Available Scripts
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development environment
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
## 📁 Project Structure
```
car-sync-drive/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── ExpensesList.tsx
│   │   ├── FuelLogsList.tsx
│   │   ├── MaintenanceList.tsx
│   │   ├── VehicleCard.tsx
│   │   └── VehicleDialog.tsx
│   ├── contexts/        # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Third-party integrations
│   │   └── supabase/   # Supabase client and utilities
│   ├── lib/            # Utility functions and libraries
│   ├── pages/          # Page components
│   │   ├── Auth.tsx    # Authentication page
│   │   ├── Dashboard.tsx # Main dashboard
│   │   ├── Index.tsx   # Landing page
│   │   └── NotFound.tsx # 404 page
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Application entry point
├── supabase/           # Supabase migrations and config
└── package.json
```
## 🔐 Authentication
The application uses Supabase Authentication to provide secure user access. Users can:
- Sign up for a new account
- Sign in with email and password
- Securely manage their vehicle data
## 🎨 UI Components
Built with **shadcn/ui** and **Radix UI**, the application features a modern, accessible component library including:
- Forms with validation
- Dialogs and modals
- Data tables
- Charts and visualizations
- Toast notifications
- Responsive navigation
## 📊 Database
The application uses **Supabase** (PostgreSQL) for data persistence with tables for:
- Users and authentication
- Vehicles
- Maintenance records
- Expense entries
- Fuel logs
## 🌐 Deployment
The application is deployed on **Vercel** and can be accessed at:
[https://car-sync-drive.vercel.app](https://car-sync-drive.vercel.app)
### Deploy Your Own
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bluetorodev/car-sync-drive)
Remember to set up your environment variables in your Vercel project settings.
## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/bluetorodev/car-sync-drive/issues).
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
## 👤 Author
**bluetorodev**
- GitHub: [@bluetorodev](https://github.com/bluetorodev)
## 🙏 Acknowledgments
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React](https://react.dev/) - A JavaScript library for building user interfaces
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
---
<div align="center">
Made with ❤️ by bluetorodev
</div>


# 🚀 BoostTrade - Enterprise Dashboard Application

A modern, scalable dashboard application for campaign and store management with advanced role-based access control and network simulation.

## ✨ Features

- 🎭 **Animated Login System** with success/failure states
- 🛡️ **Role-Based Access Control** (Admin, Campaign Manager, Reports Analyst)
- 🌐 **Network Simulation Engine** (Fast, Normal, Slow, Unstable, Offline)
- 📱 **Mobile-First Responsive Design** with hamburger navigation
- 🧪 **Comprehensive Testing Suite** (Jest + Playwright)
- ⚡ **Performance Monitoring** with Core Web Vitals
- 🎨 **Modern UI/UX** with TailwindCSS + shadcn/ui

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎭 Demo Credentials

The application includes three demo user roles:

- **Admin**: `admin@boosttrade.com` (any password)
  - Full system access including user management, campaigns, stores, and reports

- **Campaign Manager**: `campaign@boosttrade.com` (any password)
  - Campaign creation, editing, publishing, and campaign-related reports

- **Reports Analyst**: `analyst@boosttrade.com` (any password)
  - Read-only access to all reports and analytics

## 🧪 Testing

```bash
# Run all tests
npm run test

# End-to-end tests
npm run test:e2e

# Role-based testing
npm run test:roles

# Network simulation testing
npm run test:network

# Accessibility testing
npm run test:a11y
```

## 📱 Mobile Testing

- Resize your browser window to test mobile responsiveness
- Use device emulation in browser dev tools
- Test hamburger menu and touch interactions

## 🌐 Network Simulation

The application includes a network simulator to test different conditions:

- **Fast** (5G/Fiber): 50-150ms latency, <0.1% failure rate
- **Normal** (Broadband): 200-700ms latency, 1% failure rate
- **Slow** (3G/Rural): 1-3s latency, 5% failure rate
- **Unstable** (Poor): Variable latency, 15% failure rate
- **Offline**: Complete network failure simulation

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (Auth, Navigation)
├── services/           # API services (Mock API)
├── utils/             # Utility functions
├── hooks/             # Custom React hooks
└── lib/               # Library configurations
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run end-to-end tests

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

### Utilities
- `npm run setup` - Make scripts executable
- `./scripts/dev-setup.sh` - Complete development setup
- `./scripts/quick-test.sh` - Run quick test suite

## 🎨 UI Components

The application uses shadcn/ui components with TailwindCSS:

- **Card**: Main content containers with header, content, footer
- **Alert**: Success, error, and warning messages
- **Navigation**: Responsive sidebar with collapsible menu items
- **Icons**: Lucide React icon library

## 🔗 Technology Stack

- **Frontend**: React 18 + TypeScript + Next.js 14
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: React Context API
- **Testing**: Jest + Playwright + Testing Library
- **Development**: ESLint + Prettier + TypeScript
- **Build**: Next.js with optimized production builds

## 📖 Documentation

### Role-Based Access Control
Each user role has specific permissions and navigation access:

```typescript
// Admin permissions
'admin.users.manage', 'campaigns.create', 'stores.manage', 'reports.view_all'

// Campaign Manager permissions  
'campaigns.create', 'campaigns.edit', 'reports.view_campaigns'

// Reports Analyst permissions
'reports.view_all', 'reports.export', 'dashboard.view'
```

### Network Simulation
Test different network conditions:

```typescript
const mockAPI = MockAPIService.getInstance();
mockAPI.simulateNetworkConditions('slow'); // or 'fast', 'normal', 'unstable'
```

### Adding New Features
1. Create components in appropriate directories
2. Add tests for new functionality
3. Update navigation permissions if needed
4. Test across all user roles
5. Verify mobile responsiveness

## 🚀 Deployment

The application is ready for deployment with:

- Docker containerization support
- Environment-based configuration
- Production optimizations
- Health checks and monitoring
- CI/CD pipeline configurations

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the test suite
5. Submit a pull request

---

**Built with ❤️ by the BoostTrade Team**

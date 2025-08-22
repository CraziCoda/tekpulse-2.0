# TekPulse - Campus Hub Platform

A comprehensive campus management platform built with Next.js and Supabase, designed to connect students and streamline campus services.

## Features

### 🎓 Student Services
- **Lost & Found**: Report and search for lost items with image uploads
- **Marketplace**: Buy/sell items with fellow students
- **Campus Map**: Interactive virtual tour integration
- **Real-time Messaging**: Chat with other students and share attachments

### 👥 Community Management
- **Communities**: Join department, faculty, and special interest groups
- **Leadership Positions**: Apply for and manage student leadership roles
- **Posts & Feed**: Share updates and engage with campus community
- **Announcements**: Receive important campus notifications

### 🔧 Admin Features
- **User Management**: Comprehensive admin dashboard
- **Content Moderation**: Review and manage reported content
- **Leadership Approval**: Process leadership applications
- **Analytics**: Platform usage statistics and insights

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Authentication**: Supabase Auth with email verification
- **File Storage**: Supabase Storage for images
- **Real-time**: Supabase real-time subscriptions

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tekpulse
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
tekpulse/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── communities/       # Community management
│   ├── dashboard/         # Main dashboard
│   ├── lost-found/        # Lost & Found system
│   ├── marketplace/       # Student marketplace
│   ├── messages/          # Real-time messaging
│   ├── posts/             # Social feed
│   └── profile/           # User profiles
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
└── public/               # Static assets
```

## Key Features Implementation

### Authentication Flow
- Email-based registration with verification
- Supabase Auth integration
- Protected routes with middleware
- Profile creation on first login

### Real-time Messaging
- Chat rooms with multiple participants
- Attachment sharing (marketplace items, lost & found)
- Unread message tracking
- Real-time updates via Supabase subscriptions

### File Upload System
- Profile pictures, post images, item photos
- Supabase Storage integration
- Image preview and compression
- Secure file access with RLS policies

### Community System
- Hierarchical communities (departments, faculties, colleges)
- Leadership application and approval workflow
- Position-based permissions and badges
- Community-specific posts and discussions

## Database Schema

### Core Tables
- `profiles` - User information and settings
- `communities` - Academic and special interest groups
- `member_positions` - Leadership roles and applications
- `chat_rooms` & `messages` - Messaging system
- `product_listings` - Marketplace items
- `lost_and_founds` - Lost & Found reports
- `posts` & `comments` - Social feed content

### Views & Functions
- `community_details` - Aggregated community data
- `platform_summary` - Usage statistics
- `user_activity_summary` - Individual user metrics
- `unread_message_counts` - Real-time message counts

## Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Add environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Custom domain for email redirects
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

Built with ❤️ for campus communities
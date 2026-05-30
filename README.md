# Victoriosa Marketplace

A Shopify-like ecommerce platform for beauty, aesthetics, and skincare products with dropshipping integration and AI commerce capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account + project
- GitHub account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/FileLanderScaner/Victoriosa-marketplace.git
cd Victoriosa-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📋 Project Structure

```
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # Reusable React components
│   ├── lib/
│   │   └── supabase.ts   # Supabase client config
│   └── types/            # TypeScript types & interfaces
├── docs/
│   └── ROADMAP.md        # Full project roadmap
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind CSS config
├── next.config.js        # Next.js config
└── .env.example          # Environment variables template
```

## 🔐 Security

- All secrets stored in `.env.local` (never committed)
- Supabase RLS policies enforce access control
- Service role key never exposed to frontend
- All sensitive data server-side only

## 🛣️ Development Roadmap

See [docs/ROADMAP.md](./docs/ROADMAP.md) for the complete 15-prompt development plan:

- **Phase 1:** MVP Foundation (Prompts 01-05)
- **Phase 2:** Commerce & Integration (Prompts 06-10)
- **Phase 3:** AI & Refinement (Prompts 11-13)
- **Phase 4:** Deployment (Prompts 14-15)

## 📦 Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Deployment:** Vercel
- **Commerce:** Dropshipping-ready, WhatsApp integration

## 📝 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

## 🌍 Localization

- **Country:** Uruguay
- **Currency:** UYU (Uruguayan Peso)
- **Language:** Spanish (es)
- **WhatsApp:** +598 format (Uruguay country code)

## 📧 Support

For technical support or questions about the development roadmap, refer to the prompts master document or contact the development team.

## 📄 License

Private project - All rights reserved.

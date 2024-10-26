# OmniCurriculum 🌌

## Context & Origin 🎯
OmniCurriculum was born from multiple needs:
- Creating a professional portfolio to showcase projects
- Developing meaningful projects to enrich said portfolio
- Demonstrating technical skills and versatility
- Gaining hands-on experience with React and Django (coming from a Flask background)
- Responding to Mistral AI's job posting requiring an AI-integrated project, which inspired the implementation of Mistral for CV interaction and content summarization

## Quick Start 🚀

### View Live Demo
Visit my live CV at: [https://omnicurriculum-cakiral-sami.ew.r.appspot.com](https://omnicurriculum-cakiral-sami.ew.r.appspot.com)

### Local Development Setup
1. Clone the repository
2. (Optional) Add a Mistral API key in `.env` for AI chat features
3. Install dependencies:
```bash
pip install -r requirements.txt
python manage.py runserver
```
4. Visit `localhost:8000`

For frontend modifications:
```bash
cd frontend
npm install -f
npm run build
```

## Features & Capabilities 🌟
- **Dynamic CV Generation**
  - Automated PDF generation with predefined templates
  - Multilingual support (FR/EN)
  - Short descriptions for CV, long descriptions for portfolio
- **Project Showcase**
  - Comprehensive project listing with links
  - Detailed portfolio presentations
- **AI Integration**
  - Mistral AI-powered CV summarization
  - Interactive chat capabilities
- **Responsive Design**
  - Mobile-first approach
  - Multiple theme support (VSCode theme, with Instagram-style theme in development)

## Technical Architecture 🛠️
- **Frontend**: React, Tailwind CSS
- **Backend**: Django, Django REST Framework
- **Database**: 
  - Development: SQLite3
  - Production: Firestore
- **Deployment**: Google Cloud Platform (App Engine)
- **AI Integration**: Mistral API

## Environment Setup 🔧

### Local Development
1. Copy `.env.example` to `.env`
2. Only Mistral API key is required for local testing
3. Uses SQLite3 by default
4. Data automatically adapts to your information

### Production Deployment
1. Create GCP project
2. Enable necessary APIs
3. Setup Firestore database
4. Configure production environment variables
5. Deploy using `gcloud app deploy`

## Data Management 📊
1. Use `randomData.json` as template for your data
2. Fill with your information (careful with sensitive data)
3. Run `populatedb` script
4. Database is cleared and repopulated each time
5. Toggle Firebase population manually if needed

## Installation Details 📝

### Development Environment
```bash
# Clone repository
git clone [repository-url]

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install -f

# Start development servers
python manage.py runserver        # Backend
npm run build                     # Frontend
python manage.py collectstatic    # Populate database
```

### Environment Variables
Create `.env` file with:
```
SECRET_KEY=your_secret_key
DEBUG=True
MISTRAL_API_KEY=your_mistral_key
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## Roadmap 🗺️
- [x] Basic CV generation
- [x] Multilingual support
- [x] Mistral AI integration
- [x] PDF export
- [ ] Instagram-style theme
- [ ] Enhanced AI interactions

## Contributing 🤝
Contributions welcome! Please read our contributing guidelines.

## License 📜
[To be determined]

---
Created with ❤️ by Cakiral Sami

const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD_HASH = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // r749926n

app.use(express.json());
app.use(express.static('public'));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const DATA_FILE = path.join(DATA_DIR, 'portfolio.json');
const DEFAULT_DATA = {
  name: "Shadow Official",
  title: "Full Stack Developer & Automation Expert",
  tagline: "Transforming Ideas Into Digital Reality",
  bio: "Passionate developer specializing in web development, automation, and bot creation. Building high-performance solutions with cutting-edge technologies.",
  skills: [
    { name: "Web Development", level: 95, icon: "🌐" },
    { name: "Bot Automation", level: 90, icon: "🤖" },
    { name: "JavaScript/Node.js", level: 92, icon: "⚡" },
    { name: "Python", level: 88, icon: "🐍" },
    { name: "React/Vue", level: 85, icon: "⚛️" },
    { name: "API Development", level: 90, icon: "🔌" },
    { name: "Database Design", level: 82, icon: "🗄️" },
    { name: "UI/UX Design", level: 78, icon: "🎨" }
  ],
  projects: [
    {
      id: 1,
      title: "Advanced Web Scraper",
      description: "Automated data extraction system with AI-powered parsing and real-time monitoring.",
      tech: ["Python", "Selenium", "BeautifulSoup"],
      image: "🕷️",
      link: "#"
    },
    {
      id: 2,
      title: "WhatsApp Automation Suite",
      description: "Complete WhatsApp business automation with scheduling, bulk messaging, and analytics.",
      tech: ["Node.js", "WhatsApp API", "MongoDB"],
      image: "💬",
      link: "#"
    },
    {
      id: 3,
      title: "E-Commerce Platform",
      description: "Full-stack e-commerce solution with payment integration and inventory management.",
      tech: ["React", "Node.js", "Stripe"],
      image: "🛒",
      link: "#"
    },
    {
      id: 4,
      title: "Social Media Bot",
      description: "Intelligent social media automation tool for engagement and content scheduling.",
      tech: ["Python", "AI/ML", "APIs"],
      image: "📱",
      link: "#"
    }
  ],
  services: [
    { title: "Web Development", desc: "Custom websites & web apps", icon: "💻" },
    { title: "Bot Creation", desc: "WhatsApp, Telegram & custom bots", icon: "🤖" },
    { title: "Automation", desc: "Business process automation", icon: "⚙️" },
    { title: "API Integration", desc: "Third-party API solutions", icon: "🔗" }
  ],
  contact: {
    whatsapp: "923709515870",
    telegram: "@shadowhacrrr",
    youtube: "shadowHERE.460",
    email: "shadow@official.com"
  },
  theme: {
    primary: "#00d4ff",
    secondary: "#7000ff",
    accent: "#ff006e",
    dark: "#0a0a0a",
    card: "#111111"
  },
  stats: {
    projects: 50,
    clients: 30,
    experience: 3,
    satisfaction: 99
  }
};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  return DEFAULT_DATA;
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let portfolioData = loadData();

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [user, pass] = decoded.split(':');
    if (user === 'admin' && bcrypt.compareSync(pass, ADMIN_PASSWORD_HASH)) {
      next();
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// API Routes
app.get('/api/data', (req, res) => {
  res.json(portfolioData);
});

app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    const token = Buffer.from(`admin:${password}`).toString('base64');
    res.json({ token, success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.get('/api/admin/data', authMiddleware, (req, res) => {
  res.json(portfolioData);
});

app.post('/api/admin/update', authMiddleware, (req, res) => {
  const updates = req.body;
  portfolioData = { ...portfolioData, ...updates };
  saveData(portfolioData);
  res.json({ success: true, data: portfolioData });
});

app.post('/api/admin/add-project', authMiddleware, (req, res) => {
  const project = req.body;
  project.id = Date.now();
  portfolioData.projects.push(project);
  saveData(portfolioData);
  res.json({ success: true, projects: portfolioData.projects });
});

app.delete('/api/admin/project/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  portfolioData.projects = portfolioData.projects.filter(p => p.id !== id);
  saveData(portfolioData);
  res.json({ success: true, projects: portfolioData.projects });
});

app.post('/api/admin/update-contact', authMiddleware, (req, res) => {
  portfolioData.contact = { ...portfolioData.contact, ...req.body };
  saveData(portfolioData);
  res.json({ success: true, contact: portfolioData.contact });
});

app.post('/api/admin/update-theme', authMiddleware, (req, res) => {
  portfolioData.theme = { ...portfolioData.theme, ...req.body };
  saveData(portfolioData);
  res.json({ success: true, theme: portfolioData.theme });
});

app.post('/api/admin/update-stats', authMiddleware, (req, res) => {
  portfolioData.stats = { ...portfolioData.stats, ...req.body };
  saveData(portfolioData);
  res.json({ success: true, stats: portfolioData.stats });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shadow Official | Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --primary: ${portfolioData.theme.primary};
            --secondary: ${portfolioData.theme.secondary};
            --accent: ${portfolioData.theme.accent};
            --dark: ${portfolioData.theme.dark};
            --card: ${portfolioData.theme.card};
        }

        body {
            font-family: 'Rajdhani', sans-serif;
            background: var(--dark);
            color: #fff;
            overflow-x: hidden;
            min-height: 100vh;
        }

        /* Animated Background */
        .bg-animation {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: -1;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a0033 50%, #0a0a0a 100%);
        }

        .bg-animation::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: 
                radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(112, 0, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(255, 0, 110, 0.05) 0%, transparent 50%);
            animation: bgPulse 8s ease-in-out infinite;
        }

        @keyframes bgPulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }

        /* Floating Particles */
        .particles {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            z-index: 0;
        }

        .particle {
            position: absolute;
            width: 4px; height: 4px;
            background: var(--primary);
            border-radius: 50%;
            animation: float 15s infinite;
            opacity: 0.6;
            box-shadow: 0 0 10px var(--primary);
        }

        @keyframes float {
            0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }

        /* Navigation */
        nav {
            position: fixed;
            top: 0; width: 100%;
            padding: 20px 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(20px);
            background: rgba(10, 10, 10, 0.8);
            border-bottom: 1px solid rgba(0, 212, 255, 0.1);
            transition: all 0.3s ease;
        }

        .logo {
            font-family: 'Orbitron', monospace;
            font-size: 1.8rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
            animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
            from { filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.5)); }
            to { filter: drop-shadow(0 0 40px rgba(0, 212, 255, 0.8)); }
        }

        .nav-links {
            display: flex;
            gap: 30px;
            list-style: none;
        }

        .nav-links a {
            color: #fff;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            position: relative;
            padding: 5px 0;
            transition: all 0.3s ease;
        }

        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0;
            width: 0; height: 2px;
            background: linear-gradient(90deg, var(--primary), var(--accent));
            transition: width 0.3s ease;
        }

        .nav-links a:hover::after { width: 100%; }
        .nav-links a:hover { color: var(--primary); }

        .admin-btn {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border: none;
            padding: 10px 25px;
            border-radius: 25px;
            color: #fff;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .admin-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
        }

        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 100px 50px;
            position: relative;
        }

        .hero-content {
            text-align: center;
            max-width: 900px;
            z-index: 1;
        }

        .hero-badge {
            display: inline-block;
            padding: 8px 20px;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid var(--primary);
            border-radius: 50px;
            font-size: 0.9rem;
            color: var(--primary);
            margin-bottom: 30px;
            animation: fadeInUp 1s ease;
        }

        .hero h1 {
            font-family: 'Orbitron', monospace;
            font-size: clamp(2.5rem, 8vw, 5rem);
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 20px;
            animation: fadeInUp 1s ease 0.2s both;
        }

        .hero h1 .highlight {
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero-tagline {
            font-size: clamp(1.2rem, 3vw, 1.8rem);
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 30px;
            animation: fadeInUp 1s ease 0.4s both;
        }

        .hero-bio {
            font-size: 1.1rem;
            color: rgba(255, 255, 255, 0.6);
            max-width: 600px;
            margin: 0 auto 40px;
            line-height: 1.8;
            animation: fadeInUp 1s ease 0.6s both;
        }

        .hero-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            animation: fadeInUp 1s ease 0.8s both;
        }

        .btn {
            padding: 15px 40px;
            border-radius: 50px;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 700;
            font-size: 1rem;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: #fff;
            box-shadow: 0 10px 40px rgba(0, 212, 255, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 20px 60px rgba(0, 212, 255, 0.4);
        }

        .btn-secondary {
            background: transparent;
            color: #fff;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
            border-color: var(--primary);
            color: var(--primary);
            transform: translateY(-3px);
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Stats Section */
        .stats {
            padding: 80px 50px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .stat-card {
            background: var(--card);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 20px;
            padding: 40px 20px;
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--accent));
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .stat-card:hover::before { transform: scaleX(1); }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border-color: var(--primary);
        }

        .stat-number {
            font-family: 'Orbitron', monospace;
            font-size: 3rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .stat-label {
            color: rgba(255, 255, 255, 0.6);
            font-size: 1rem;
            margin-top: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        /* Skills Section */
        .section {
            padding: 100px 50px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .section-title {
            font-family: 'Orbitron', monospace;
            font-size: clamp(2rem, 5vw, 3rem);
            text-align: center;
            margin-bottom: 60px;
            position: relative;
        }

        .section-title::after {
            content: '';
            display: block;
            width: 100px;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--accent));
            margin: 20px auto 0;
            border-radius: 2px;
        }

        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
        }

        .skill-card {
            background: var(--card);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .skill-card::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            transition: width 0.5s ease;
        }

        .skill-card:hover::after { width: 100%; }
        .skill-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }

        .skill-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }

        .skill-name {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .skill-bar {
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
        }

        .skill-progress {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--accent));
            border-radius: 4px;
            transition: width 1.5s ease;
            position: relative;
        }

        .skill-progress::after {
            content: '';
            position: absolute;
            top: 0; right: 0;
            width: 20px; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));
            animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-20px); }
            100% { transform: translateX(20px); }
        }

        .skill-percent {
            text-align: right;
            margin-top: 5px;
            font-size: 0.9rem;
            color: var(--primary);
            font-weight: 600;
        }

        /* Projects Section */
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }

        .project-card {
            background: var(--card);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
        }

        .project-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
            border-color: var(--primary);
        }

        .project-image {
            height: 200px;
            background: linear-gradient(135deg, var(--secondary), var(--accent));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            position: relative;
            overflow: hidden;
        }

        .project-image::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
            animation: shine 3s infinite;
        }

        @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .project-content {
            padding: 25px;
        }

        .project-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .project-desc {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 15px;
        }

        .project-tech {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .tech-tag {
            padding: 5px 15px;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 20px;
            font-size: 0.8rem;
            color: var(--primary);
        }

        /* Services Section */
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
        }

        .service-card {
            background: var(--card);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 20px;
            padding: 40px 30px;
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .service-card::before {
            content: '';
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .service-card:hover::before { opacity: 1; }
        .service-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
        }

        .service-icon {
            font-size: 3rem;
            margin-bottom: 20px;
            display: inline-block;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        .service-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .service-desc {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.95rem;
        }

        /* Contact Section */
        .contact-section {
            padding: 100px 50px;
            text-align: center;
            background: linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.05));
        }

        .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            max-width: 800px;
            margin: 50px auto 0;
        }

        .contact-card {
            background: var(--card);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 20px;
            padding: 30px;
            transition: all 0.3s ease;
            text-decoration: none;
            color: #fff;
            display: block;
        }

        .contact-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: 0 20px 40px rgba(0, 212, 255, 0.1);
        }

        .contact-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }

        .contact-label {
            font-weight: 700;
            margin-bottom: 5px;
        }

        .contact-value {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.9rem;
        }

        /* Footer */
        footer {
            padding: 40px;
            text-align: center;
            border-top: 1px solid rgba(0, 212, 255, 0.1);
            color: rgba(255, 255, 255, 0.4);
        }

        /* Admin Modal */
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(10px);
        }

        .modal-overlay.active { display: flex; }

        .modal {
            background: var(--card);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            animation: modalIn 0.3s ease;
        }

        @keyframes modalIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        .modal h2 {
            font-family: 'Orbitron', monospace;
            margin-bottom: 20px;
            text-align: center;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.8);
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px 15px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 10px;
            color: #fff;
            font-family: 'Rajdhani', sans-serif;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
        }

        /* Admin Dashboard */
        .admin-dashboard {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: var(--dark);
            z-index: 3000;
            overflow-y: auto;
        }

        .admin-dashboard.active { display: block; }

        .admin-header {
            padding: 20px 50px;
            background: var(--card);
            border-bottom: 1px solid rgba(0, 212, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .admin-title {
            font-family: 'Orbitron', monospace;
            font-size: 1.5rem;
        }

        .admin-content {
            padding: 40px 50px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .admin-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }

        .admin-tab {
            padding: 10px 25px;
            background: var(--card);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 10px;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 600;
        }

        .admin-tab.active,
        .admin-tab:hover {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-color: transparent;
        }

        .admin-panel {
            display: none;
            background: var(--card);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 20px;
            padding: 30px;
        }

        .admin-panel.active { display: block; }

        .admin-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        .save-btn {
            background: linear-gradient(135deg, #00ff88, #00cc66);
            color: #000;
            padding: 15px 40px;
            border: none;
            border-radius: 10px;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 20px;
        }

        .save-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        }

        .project-list {
            margin-top: 20px;
        }

        .project-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .delete-btn {
            background: linear-gradient(135deg, #ff006e, #cc0058);
            color: #fff;
            border: none;
            padding: 8px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 600;
        }

        /* Scroll animations */
        .scroll-reveal {
            opacity: 0;
            transform: translateY(50px);
            transition: all 0.8s ease;
        }

        .scroll-reveal.visible {
            opacity: 1;
            transform: translateY(0);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            nav { padding: 15px 20px; }
            .nav-links { display: none; }
            .hero { padding: 80px 20px; }
            .section { padding: 60px 20px; }
            .stats { padding: 40px 20px; }
            .contact-section { padding: 60px 20px; }
            .admin-content { padding: 20px; }
            .admin-header { padding: 15px 20px; }
        }

        /* Loading animation */
        .loader {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: var(--dark);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 5000;
            transition: opacity 0.5s ease;
        }

        .loader.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .loader-text {
            font-family: 'Orbitron', monospace;
            font-size: 2rem;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body>
    <div class="loader" id="loader">
        <div class="loader-text">SHADOW OFFICIAL</div>
    </div>

    <div class="bg-animation"></div>
    <div class="particles" id="particles"></div>

    <nav>
        <div class="logo">SHADOW OFFICIAL</div>
        <ul class="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
        <button class="admin-btn" onclick="openAdmin()">Admin</button>
    </nav>

    <section class="hero" id="home">
        <div class="hero-content">
            <div class="hero-badge">✨ Available for Projects</div>
            <h1>Hi, I'm <span class="highlight" id="hero-name">${portfolioData.name}</span></h1>
            <p class="hero-tagline" id="hero-title">${portfolioData.title}</p>
            <p class="hero-bio" id="hero-bio">${portfolioData.bio}</p>
            <div class="hero-buttons">
                <a href="#contact" class="btn btn-primary">Hire Me</a>
                <a href="#projects" class="btn btn-secondary">View Work</a>
            </div>
        </div>
    </section>

    <section class="stats" id="stats">
        <div class="stat-card scroll-reveal">
            <div class="stat-number" data-target="${portfolioData.stats.projects}">0</div>
            <div class="stat-label">Projects</div>
        </div>
        <div class="stat-card scroll-reveal">
            <div class="stat-number" data-target="${portfolioData.stats.clients}">0</div>
            <div class="stat-label">Clients</div>
        </div>
        <div class="stat-card scroll-reveal">
            <div class="stat-number" data-target="${portfolioData.stats.experience}">0</div>
            <div class="stat-label">Years Exp</div>
        </div>
        <div class="stat-card scroll-reveal">
            <div class="stat-number" data-target="${portfolioData.stats.satisfaction}">0</div>
            <div class="stat-label">% Satisfaction</div>
        </div>
    </section>

    <section class="section" id="skills">
        <h2 class="section-title scroll-reveal">My Skills</h2>
        <div class="skills-grid" id="skills-grid">
            ${portfolioData.skills.map(skill => `
            <div class="skill-card scroll-reveal">
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: 0%" data-width="${skill.level}"></div>
                </div>
                <div class="skill-percent">${skill.level}%</div>
            </div>
            `).join('')}
        </div>
    </section>

    <section class="section" id="projects">
        <h2 class="section-title scroll-reveal">Featured Projects</h2>
        <div class="projects-grid" id="projects-grid">
            ${portfolioData.projects.map(project => `
            <div class="project-card scroll-reveal">
                <div class="project-image">${project.image}</div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-tech">
                        ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </section>

    <section class="section" id="services">
        <h2 class="section-title scroll-reveal">Services</h2>
        <div class="services-grid" id="services-grid">
            ${portfolioData.services.map(service => `
            <div class="service-card scroll-reveal">
                <div class="service-icon">${service.icon}</div>
                <h3 class="service-title">${service.title}</h3>
                <p class="service-desc">${service.desc}</p>
            </div>
            `).join('')}
        </div>
    </section>

    <section class="contact-section" id="contact">
        <h2 class="section-title scroll-reveal">Get In Touch</h2>
        <p style="color: rgba(255,255,255,0.6); max-width: 500px; margin: 0 auto;">
            Ready to start your next project? Let's work together and create something amazing!
        </p>
        <div class="contact-grid">
            <a href="https://wa.me/${portfolioData.contact.whatsapp}" target="_blank" class="contact-card scroll-reveal">
                <div class="contact-icon">💬</div>
                <div class="contact-label">WhatsApp</div>
                <div class="contact-value">${portfolioData.contact.whatsapp}</div>
            </a>
            <a href="https://t.me/${portfolioData.contact.telegram.replace('@', '')}" target="_blank" class="contact-card scroll-reveal">
                <div class="contact-icon">✈️</div>
                <div class="contact-label">Telegram</div>
                <div class="contact-value">${portfolioData.contact.telegram}</div>
            </a>
            <a href="https://youtube.com/@${portfolioData.contact.youtube}" target="_blank" class="contact-card scroll-reveal">
                <div class="contact-icon">📺</div>
                <div class="contact-label">YouTube</div>
                <div class="contact-value">@${portfolioData.contact.youtube}</div>
            </a>
            <a href="mailto:${portfolioData.contact.email}" class="contact-card scroll-reveal">
                <div class="contact-icon">📧</div>
                <div class="contact-label">Email</div>
                <div class="contact-value">${portfolioData.contact.email}</div>
            </a>
        </div>
    </section>

    <footer>
        <p>© 2026 Shadow Official. All rights reserved. | Crafted with 💜</p>
    </footer>

    <!-- Admin Login Modal -->
    <div class="modal-overlay" id="loginModal">
        <div class="modal">
            <h2>🔐 Admin Login</h2>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="adminPass" placeholder="Enter password">
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="login()">Login</button>
            <button class="btn btn-secondary" style="width: 100%; margin-top: 10px;" onclick="closeModal()">Cancel</button>
        </div>
    </div>

    <!-- Admin Dashboard -->
    <div class="admin-dashboard" id="adminDashboard">
        <div class="admin-header">
            <div class="admin-title">⚡ Admin Dashboard</div>
            <button class="admin-btn" onclick="logout()">Logout</button>
        </div>
        <div class="admin-content">
            <div class="admin-tabs">
                <div class="admin-tab active" onclick="switchTab('general')">General</div>
                <div class="admin-tab" onclick="switchTab('skills')">Skills</div>
                <div class="admin-tab" onclick="switchTab('projects')">Projects</div>
                <div class="admin-tab" onclick="switchTab('contact')">Contact</div>
                <div class="admin-tab" onclick="switchTab('theme')">Theme</div>
                <div class="admin-tab" onclick="switchTab('stats')">Stats</div>
            </div>

            <div class="admin-panel active" id="panel-general">
                <h3>General Settings</h3>
                <div class="admin-grid">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="edit-name" value="${portfolioData.name}">
                    </div>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="edit-title" value="${portfolioData.title}">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label>Bio</label>
                        <textarea id="edit-bio" rows="4">${portfolioData.bio}</textarea>
                    </div>
                </div>
                <button class="save-btn" onclick="saveGeneral()">💾 Save Changes</button>
            </div>

            <div class="admin-panel" id="panel-skills">
                <h3>Manage Skills</h3>
                <p style="color: rgba(255,255,255,0.6); margin-bottom: 20px;">Skills are managed in JSON. Edit data/portfolio.json directly for advanced changes.</p>
            </div>

            <div class="admin-panel" id="panel-projects">
                <h3>Manage Projects</h3>
                <div class="form-group">
                    <label>Project Title</label>
                    <input type="text" id="new-project-title" placeholder="Project name">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="new-project-desc" rows="3" placeholder="Project description"></textarea>
                </div>
                <div class="form-group">
                    <label>Technologies (comma separated)</label>
                    <input type="text" id="new-project-tech" placeholder="React, Node.js, etc.">
                </div>
                <div class="form-group">
                    <label>Icon (emoji)</label>
                    <input type="text" id="new-project-icon" placeholder="🚀">
                </div>
                <button class="save-btn" onclick="addProject()">➕ Add Project</button>
                <div class="project-list" id="project-list"></div>
            </div>

            <div class="admin-panel" id="panel-contact">
                <h3>Contact Information</h3>
                <div class="admin-grid">
                    <div class="form-group">
                        <label>WhatsApp</label>
                        <input type="text" id="edit-whatsapp" value="${portfolioData.contact.whatsapp}">
                    </div>
                    <div class="form-group">
                        <label>Telegram</label>
                        <input type="text" id="edit-telegram" value="${portfolioData.contact.telegram}">
                    </div>
                    <div class="form-group">
                        <label>YouTube</label>
                        <input type="text" id="edit-youtube" value="${portfolioData.contact.youtube}">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="edit-email" value="${portfolioData.contact.email}">
                    </div>
                </div>
                <button class="save-btn" onclick="saveContact()">💾 Save Contact</button>
            </div>

            <div class="admin-panel" id="panel-theme">
                <h3>Theme Colors</h3>
                <div class="admin-grid">
                    <div class="form-group">
                        <label>Primary Color</label>
                        <input type="color" id="edit-primary" value="${portfolioData.theme.primary}">
                    </div>
                    <div class="form-group">
                        <label>Secondary Color</label>
                        <input type="color" id="edit-secondary" value="${portfolioData.theme.secondary}">
                    </div>
                    <div class="form-group">
                        <label>Accent Color</label>
                        <input type="color" id="edit-accent" value="${portfolioData.theme.accent}">
                    </div>
                </div>
                <button class="save-btn" onclick="saveTheme()">🎨 Apply Theme</button>
            </div>

            <div class="admin-panel" id="panel-stats">
                <h3>Statistics</h3>
                <div class="admin-grid">
                    <div class="form-group">
                        <label>Projects Count</label>
                        <input type="number" id="edit-stat-projects" value="${portfolioData.stats.projects}">
                    </div>
                    <div class="form-group">
                        <label>Clients Count</label>
                        <input type="number" id="edit-stat-clients" value="${portfolioData.stats.clients}">
                    </div>
                    <div class="form-group">
                        <label>Years Experience</label>
                        <input type="number" id="edit-stat-exp" value="${portfolioData.stats.experience}">
                    </div>
                    <div class="form-group">
                        <label>Satisfaction %</label>
                        <input type="number" id="edit-stat-sat" value="${portfolioData.stats.satisfaction}">
                    </div>
                </div>
                <button class="save-btn" onclick="saveStats()">📊 Update Stats</button>
            </div>
        </div>
    </div>

    <script>
        let authToken = localStorage.getItem('adminToken');

        // Create particles
        function createParticles() {
            const container = document.getElementById('particles');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (10 + Math.random() * 10) + 's';
                container.appendChild(particle);
            }
        }

        // Loading screen
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('loader').classList.add('hidden');
            }, 1500);
            createParticles();
        });

        // Scroll animations
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Animate skill bars
                    const progressBars = entry.target.querySelectorAll('.skill-progress');
                    progressBars.forEach(bar => {
                        setTimeout(() => {
                            bar.style.width = bar.dataset.width + '%';
                        }, 200);
                    });

                    // Animate numbers
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach(num => {
                        const target = parseInt(num.dataset.target);
                        animateNumber(num, target);
                    });
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

        function animateNumber(element, target) {
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + (target === 99 ? '%' : '+');
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 30);
        }

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Admin functions
        function openAdmin() {
            if (authToken) {
                showDashboard();
            } else {
                document.getElementById('loginModal').classList.add('active');
            }
        }

        function closeModal() {
            document.getElementById('loginModal').classList.remove('active');
        }

        async function login() {
            const pass = document.getElementById('adminPass').value;
            try {
                const res = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: pass })
                });
                const data = await res.json();
                if (data.success) {
                    authToken = data.token;
                    localStorage.setItem('adminToken', authToken);
                    closeModal();
                    showDashboard();
                } else {
                    alert('Wrong password!');
                }
            } catch (e) {
                alert('Error: ' + e.message);
            }
        }

        function showDashboard() {
            document.getElementById('adminDashboard').classList.add('active');
            loadProjects();
        }

        function logout() {
            authToken = null;
            localStorage.removeItem('adminToken');
            document.getElementById('adminDashboard').classList.remove('active');
        }

        function switchTab(tab) {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById('panel-' + tab).classList.add('active');
        }

        async function saveGeneral() {
            const data = {
                name: document.getElementById('edit-name').value,
                title: document.getElementById('edit-title').value,
                bio: document.getElementById('edit-bio').value
            };
            await updateData(data);
            alert('Saved! Refresh to see changes.');
        }

        async function saveContact() {
            const contact = {
                whatsapp: document.getElementById('edit-whatsapp').value,
                telegram: document.getElementById('edit-telegram').value,
                youtube: document.getElementById('edit-youtube').value,
                email: document.getElementById('edit-email').value
            };
            await fetch('/api/admin/update-contact', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                },
                body: JSON.stringify(contact)
            });
            alert('Contact updated! Refresh to see changes.');
        }

        async function saveTheme() {
            const theme = {
                primary: document.getElementById('edit-primary').value,
                secondary: document.getElementById('edit-secondary').value,
                accent: document.getElementById('edit-accent').value
            };
            await fetch('/api/admin/update-theme', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                },
                body: JSON.stringify(theme)
            });
            alert('Theme updated! Refresh to see changes.');
        }

        async function saveStats() {
            const stats = {
                projects: parseInt(document.getElementById('edit-stat-projects').value),
                clients: parseInt(document.getElementById('edit-stat-clients').value),
                experience: parseInt(document.getElementById('edit-stat-exp').value),
                satisfaction: parseInt(document.getElementById('edit-stat-sat').value)
            };
            await fetch('/api/admin/update-stats', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                },
                body: JSON.stringify(stats)
            });
            alert('Stats updated! Refresh to see changes.');
        }

        async function addProject() {
            const project = {
                title: document.getElementById('new-project-title').value,
                description: document.getElementById('new-project-desc').value,
                tech: document.getElementById('new-project-tech').value.split(',').map(t => t.trim()),
                image: document.getElementById('new-project-icon').value || '🚀',
                link: '#'
            };
            await fetch('/api/admin/add-project', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                },
                body: JSON.stringify(project)
            });
            alert('Project added!');
            loadProjects();
        }

        async function loadProjects() {
            const res = await fetch('/api/admin/data', {
                headers: { 'Authorization': authToken }
            });
            const data = await res.json();
            const list = document.getElementById('project-list');
            list.innerHTML = data.projects.map(p => `
                <div class="project-item">
                    <span>${p.title}</span>
                    <button class="delete-btn" onclick="deleteProject(${p.id})">Delete</button>
                </div>
            `).join('');
        }

        async function deleteProject(id) {
            await fetch('/api/admin/project/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': authToken }
            });
            loadProjects();
        }

        async function updateData(data) {
            await fetch('/api/admin/update', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                },
                body: JSON.stringify(data)
            });
        }
    </script>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log(`🚀 Shadow Official Portfolio running on port ${PORT}`);
});

const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD_HASH = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

app.use(express.json());
app.use(express.static('public'));

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
    { id: 1, title: "Advanced Web Scraper", description: "Automated data extraction system with AI-powered parsing and real-time monitoring.", tech: ["Python", "Selenium", "BeautifulSoup"], image: "🕷️", link: "#" },
    { id: 2, title: "WhatsApp Automation Suite", description: "Complete WhatsApp business automation with scheduling, bulk messaging, and analytics.", tech: ["Node.js", "WhatsApp API", "MongoDB"], image: "💬", link: "#" },
    { id: 3, title: "E-Commerce Platform", description: "Full-stack e-commerce solution with payment integration and inventory management.", tech: ["React", "Node.js", "Stripe"], image: "🛒", link: "#" },
    { id: 4, title: "Social Media Bot", description: "Intelligent social media automation tool for engagement and content scheduling.", tech: ["Python", "AI/ML", "APIs"], image: "📱", link: "#" }
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

app.get('/api/data', (req, res) => {
  res.json(portfolioData);
});

app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    const token = Buffer.from('admin:' + password).toString('base64');
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

app.listen(PORT, () => {
  console.log('Shadow Official Portfolio running on port ' + PORT);
});

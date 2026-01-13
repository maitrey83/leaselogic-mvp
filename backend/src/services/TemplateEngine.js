const fs = require('fs');
const path = require('path');

class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.loadTemplates();
  }

  loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates');
    
    if (!fs.existsSync(templatesDir)) {
      console.warn('Templates directory not found');
      return;
    }

    const files = fs.readdirSync(templatesDir);
    
    files.forEach(file => {
      if (file.endsWith('.js') && file !== 'index.js') {
        const templatePath = path.join(templatesDir, file);
        const template = require(templatePath);
        
        if (template.id && template.render) {
          this.templates.set(template.id, template);
        }
      }
    });
  }

  getTemplate(templateId) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    return template;
  }

  render(templateId, data) {
    const template = this.getTemplate(templateId);
    return template.render(data);
  }

  clearCache() {
    this.templates.clear();
    this.loadTemplates();
  }

  getAllTemplates() {
    return Array.from(this.templates.keys());
  }
}

module.exports = new TemplateEngine();

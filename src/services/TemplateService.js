/**
 * Template Service
 * Handles template rendering (frontend preview)
 * Note: PDF generation happens on backend
 */

class TemplateService {
  constructor() {
    this.templates = new Map();
    this.cache = new Map();
  }

  /**
   * Register a template
   */
  registerTemplate(id, template) {
    this.templates.set(id, template);
  }

  /**
   * Get template by ID
   */
  getTemplate(id) {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }
    return template;
  }

  /**
   * Render template with data
   * Simple string replacement for preview
   */
  render(templateId, data) {
    // Check cache
    const cacheKey = `${templateId}:${JSON.stringify(data)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const template = this.getTemplate(templateId);
    let rendered = template.content;

    // Replace placeholders with data
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(placeholder, value || '');
    });

    // Replace any remaining placeholders with empty string
    rendered = rendered.replace(/\{\{[^}]+\}\}/g, '');

    // Cache result
    this.cache.set(cacheKey, rendered);

    return rendered;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Preload templates
   */
  async preloadTemplates(ids) {
    // In a real implementation, this would fetch templates
    // For now, just verify they exist
    ids.forEach(id => {
      if (!this.templates.has(id)) {
        console.warn(`Template ${id} not found for preloading`);
      }
    });
  }

  /**
   * Check if template exists
   */
  hasTemplate(id) {
    return this.templates.has(id);
  }
}

// Create singleton instance
const templateService = new TemplateService();

// Register basic templates for testing
templateService.registerTemplate('utah-3day-notice-preview', {
  id: 'utah-3day-notice-preview',
  content: `
    <div class="notice-preview">
      <h1>NOTICE TO PAY RENT OR VACATE PREMISES</h1>
      <p>TO: {{tenantNames}}</p>
      <p>Property: {{street}}, {{city}}, {{state}} {{zipCode}}</p>
      <p>Amount Due: {{pastDueAmount}}</p>
      <p>Original Due Date: {{originalDueDate}}</p>
      <p>Notice Date: {{noticeDate}}</p>
      <p>Landlord: {{landlordName}}</p>
      <p>Phone: {{landlordPhone}}</p>
    </div>
  `
});

templateService.registerTemplate('utah-rent-increase-preview', {
  id: 'utah-rent-increase-preview',
  content: `
    <div class="notice-preview">
      <h1>NOTICE OF RENT INCREASE</h1>
      <p>TO: {{tenantNames}}</p>
      <p>Property: {{street}}, {{city}}, {{state}} {{zipCode}}</p>
      <p>Current Rent: {{currentRent}}</p>
      <p>New Rent: {{newRent}}</p>
      <p>Effective Date: {{effectiveDate}}</p>
      <p>Landlord: {{landlordName}}</p>
    </div>
  `
});

export default templateService;
export { TemplateService };

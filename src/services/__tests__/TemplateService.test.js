import { TemplateService } from '../TemplateService';

describe('TemplateService', () => {
  let service;

  beforeEach(() => {
    service = new TemplateService();
    service.clearCache();
  });

  test('registers a template', () => {
    const template = {
      id: 'test-template',
      content: '<div>{{name}}</div>'
    };

    service.registerTemplate('test-template', template);
    expect(service.hasTemplate('test-template')).toBe(true);
  });

  test('gets template by id', () => {
    const template = {
      id: 'test-template',
      content: '<div>{{name}}</div>'
    };

    service.registerTemplate('test-template', template);
    const retrieved = service.getTemplate('test-template');
    expect(retrieved.id).toBe('test-template');
  });

  test('throws error for non-existent template', () => {
    expect(() => service.getTemplate('non-existent')).toThrow('Template not found');
  });

  test('renders template with data', () => {
    const template = {
      id: 'test-template',
      content: '<div>Hello {{name}}, you owe {{amount}}</div>'
    };

    service.registerTemplate('test-template', template);
    const rendered = service.render('test-template', {
      name: 'John',
      amount: '$100'
    });

    expect(rendered).toContain('Hello John');
    expect(rendered).toContain('you owe $100');
  });

  test('handles missing data in template', () => {
    const template = {
      id: 'test-template',
      content: '<div>{{name}} - {{missing}}</div>'
    };

    service.registerTemplate('test-template', template);
    const rendered = service.render('test-template', { name: 'John' });

    expect(rendered).toContain('John');
    expect(rendered).not.toContain('{{missing}}');
  });

  test('caches rendered templates', () => {
    const template = {
      id: 'test-template',
      content: '<div>{{name}}</div>'
    };

    service.registerTemplate('test-template', template);
    
    // First render
    const rendered1 = service.render('test-template', { name: 'John' });
    
    // Second render with same data (should use cache)
    const rendered2 = service.render('test-template', { name: 'John' });
    
    expect(rendered1).toBe(rendered2);
  });

  test('clears cache', () => {
    const template = {
      id: 'test-template',
      content: '<div>{{name}}</div>'
    };

    service.registerTemplate('test-template', template);
    service.render('test-template', { name: 'John' });
    
    service.clearCache();
    
    // Cache should be empty, but rendering should still work
    const rendered = service.render('test-template', { name: 'Jane' });
    expect(rendered).toContain('Jane');
  });

  test('checks if template exists', () => {
    const template = {
      id: 'test-template',
      content: '<div>{{name}}</div>'
    };

    service.registerTemplate('test-template', template);
    
    expect(service.hasTemplate('test-template')).toBe(true);
    expect(service.hasTemplate('non-existent')).toBe(false);
  });

  test('preloads templates', async () => {
    const template = {
      id: 'test-template',
      content: '<div>{{name}}</div>'
    };

    service.registerTemplate('test-template', template);
    
    await service.preloadTemplates(['test-template']);
    // Should not throw
  });
});

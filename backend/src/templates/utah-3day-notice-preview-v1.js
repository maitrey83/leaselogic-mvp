const baseTemplate = require('./utah-3day-notice-v1');

module.exports = {
  id: 'utah-3day-notice-preview-v1',
  version: '1.0',
  documentType: 'utah-3day-pay-or-quit',
  
  render: (data) => {
    const baseHTML = baseTemplate.render(data);
    const watermark = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); 
                font-size: 72px; color: rgba(255, 0, 0, 0.2); font-weight: bold; z-index: 1000; pointer-events: none;">
      DRAFT - NOT LEGAL
    </div>`;
    
    return baseHTML.replace('<body>', `<body>${watermark}`);
  }
};

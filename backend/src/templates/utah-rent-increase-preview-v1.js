/**
 * Utah Rent Increase Notice - Preview Template
 * Task 3.3: Rent Increase Templates
 *
 * Extends the final template with a watermark for preview purposes.
 * Watermark: "PREVIEW - NOT FOR LEGAL USE" (diagonal, semi-transparent)
 */

const baseTemplate = require('./utah-rent-increase-v1');

module.exports = {
  id: 'utah-rent-increase-preview-v1',
  version: '1.0',
  documentType: 'utah-rent-increase',

  render: (data) => {
    const baseHTML = baseTemplate.render(data);

    // Watermark styling: diagonal (-45deg), large, semi-transparent, centered
    const watermark = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 60px;
      color: rgba(200, 200, 200, 0.4);
      font-weight: bold;
      z-index: 1000;
      pointer-events: none;
      white-space: nowrap;
      font-family: Arial, sans-serif;
      text-align: center;
      line-height: 1.2;
    ">
      PREVIEW<br>NOT FOR LEGAL USE
    </div>`;

    return baseHTML.replace('<body>', `<body>${watermark}`);
  }
};

const geoRestriction = (req, res, next) => {
  // Skip geo-restriction in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Get IP address from request
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null);

  // For now, log the IP and allow (you can add IP geolocation service later)
  console.log(`API request from IP: ${ip}`);
  
  // TODO: Add server-side IP geolocation check here if needed
  // For MVP, we rely on frontend geo-restriction
  
  next();
};

module.exports = geoRestriction;

const express = require('express');
const db = require('./database');
const router = express.Router();

// Get all events with their average ratings
router.get('/events', (req, res) => {
  const query = `
    SELECT 
      e.*,
      COUNT(r.id) as total_ratings,
      ROUND(AVG(r.event_ease), 1) as avg_event_ease,
      ROUND(AVG(r.event_vibes), 1) as avg_event_vibes,
      ROUND(AVG(r.spoon_vibes), 1) as avg_spoon_vibes,
      ROUND(AVG(r.spoon_price), 1) as avg_spoon_price,
      ROUND(AVG(r.spoon_portion), 1) as avg_spoon_portion
    FROM events e
    LEFT JOIN ratings r ON e.id = r.event_id
    GROUP BY e.id
    ORDER BY e.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const events = rows.map(row => ({
      id: row.id,
      name: row.name,
      spoonName: row.spoon_name,
      date: row.date,
      ratings: {
        eventEase: { 
          total: (row.avg_event_ease || 0) * row.total_ratings,
          count: row.total_ratings,
          average: row.avg_event_ease || 0
        },
        eventVibes: { 
          total: (row.avg_event_vibes || 0) * row.total_ratings,
          count: row.total_ratings,
          average: row.avg_event_vibes || 0
        },
        spoonVibes: { 
          total: (row.avg_spoon_vibes || 0) * row.total_ratings,
          count: row.total_ratings,
          average: row.avg_spoon_vibes || 0
        },
        spoonPrice: { 
          total: (row.avg_spoon_price || 0) * row.total_ratings,
          count: row.total_ratings,
          average: row.avg_spoon_price || 0
        },
        spoonPortion: { 
          total: (row.avg_spoon_portion || 0) * row.total_ratings,
          count: row.total_ratings,
          average: row.avg_spoon_portion || 0
        }
      }
    }));

    res.json(events);
  });
});

// Create new event
router.post('/events', (req, res) => {
  const { name, spoonName, date } = req.body;
  
  if (!name || !spoonName || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `INSERT INTO events (name, spoon_name, date) VALUES (?, ?, ?)`;
  
  db.run(query, [name, spoonName, date], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      id: this.lastID,
      name,
      spoonName,
      date,
      ratings: {
        eventEase: { total: 0, count: 0, average: 0 },
        eventVibes: { total: 0, count: 0, average: 0 },
        spoonVibes: { total: 0, count: 0, average: 0 },
        spoonPrice: { total: 0, count: 0, average: 0 },
        spoonPortion: { total: 0, count: 0, average: 0 }
      }
    });
  });
});

// Add rating to event
router.post('/events/:id/ratings', (req, res) => {
  const eventId = req.params.id;
  const { eventEase, eventVibes, spoonVibes, spoonPrice, spoonPortion } = req.body;

  if (!eventEase || !eventVibes || !spoonVibes || !spoonPrice || !spoonPortion) {
    return res.status(400).json({ error: 'Missing rating fields' });
  }

  const query = `
    INSERT INTO ratings (event_id, event_ease, event_vibes, spoon_vibes, spoon_price, spoon_portion)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [eventId, eventEase, eventVibes, spoonVibes, spoonPrice, spoonPortion], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ message: 'Rating added successfully', ratingId: this.lastID });
  });
});

module.exports = router;
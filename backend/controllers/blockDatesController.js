const pool = require('../config/db');

exports.createBlockDate = (req, res) => {
  const { place_id, start_date, end_date, reason } = req.body;

  // Validate required fields
  if (!start_date || !end_date) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Start date and end date are required' 
    });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Invalid date format. Use YYYY-MM-DD' 
    });
  }

  // Validate date order
  if (new Date(start_date) > new Date(end_date)) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Start date must be before end date' 
    });
  }

  // Insert into database
  pool.query(
    'INSERT INTO block_dates (place_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)',
    [place_id || null, start_date, end_date, reason || null],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);

        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({
            status: 'error',
            message: 'This date range is already blocked'
          });
        }

        return res.status(500).json({
          status: 'error',
          message: 'Internal server error',
          detail: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      res.status(201).json({
        status: 'success',
        data: {
          id: result.insertId,
          place_id,
          start_date,
          end_date,
          reason
        }
      });
    }
  );
};

exports.getBlockDates = (req, res) => {
  pool.query('SELECT * FROM block_dates', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    res.status(200).json({
      status: 'success',
      data: rows
    });
  });
};

exports.deleteBlockDate = (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM block_dates WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Block date not found' });
    }

    res.status(200).json({ status: 'success', message: 'Block date deleted' });
  });
};

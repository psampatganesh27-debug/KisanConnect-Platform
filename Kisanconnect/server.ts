import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { getDb, dbQueryAll, dbQueryOne, dbExec } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize PostgreSQL database connection
  await getDb();

  // API Routes
  
  // 1. Auth Login (Mobile + 4-digit PIN)
  app.post('/api/auth/login', async (req, res) => {
    const { phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ error: 'Mobile number and PIN are required' });
    }

    const cleanPhone = String(phone).trim();
    const cleanPin = String(pin).trim();

    const user = await dbQueryOne('SELECT id, phone, name, village, district FROM users WHERE phone = ? AND pin = ?', [cleanPhone, cleanPin]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid mobile number or 4-digit PIN' });
    }

    return res.json({ success: true, user });
  });

  // 2. Auth Register
  app.post('/api/auth/register', async (req, res) => {
    const { phone, pin, name, village, district } = req.body;
    if (!phone || !pin || !name || !village) {
      return res.status(400).json({ error: 'Mobile number, PIN, name, and village are required' });
    }

    const cleanPhone = String(phone).trim();
    const cleanPin = String(pin).trim();
    const cleanName = String(name).trim();
    const cleanVillage = String(village).trim();
    const cleanDistrict = String(district || 'Central District').trim();

    const existing = await dbQueryOne('SELECT id FROM users WHERE phone = ?', [cleanPhone]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this mobile number already exists' });
    }

    try {
      await dbExec('INSERT INTO users (phone, pin, name, village, district) VALUES (?, ?, ?, ?, ?)', [
        cleanPhone, cleanPin, cleanName, cleanVillage, cleanDistrict
      ]);

      const newUser = await dbQueryOne('SELECT id, phone, name, village, district FROM users WHERE phone = ?', [cleanPhone]);
      return res.json({ success: true, user: newUser });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create user' });
    }
  });

  // 3. Equipment Listings (GET)
  app.get('/api/equipment', async (req, res) => {
    const category = req.query.category as string;
    const search = req.query.search as string;

    let sql = 'SELECT * FROM equipment_listings WHERE is_available = 1';
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR village LIKE ? OR district LIKE ? OR owner_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY id DESC';

    try {
      const listings = await dbQueryAll(sql, params);
      return res.json(listings);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch equipment' });
    }
  });

  // 4. Equipment Listing Create (POST)
  app.post('/api/equipment', async (req, res) => {
    const { userId, ownerName, ownerPhone, category, title, description, ratePerUnit, unitType, village, district } = req.body;

    if (!ownerName || !ownerPhone || !category || !title || !unitType || !village) {
      return res.status(400).json({ error: 'Missing required listing details' });
    }

    try {
      await dbExec(
        `INSERT INTO equipment_listings 
        (user_id, owner_name, owner_phone, category, title, description, rate_per_unit, unit_type, village, district, is_available)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          userId || 1,
          String(ownerName).trim(),
          String(ownerPhone).trim(),
          String(category).trim(),
          String(title).trim(),
          String(description || '').trim(),
          Number(ratePerUnit || 0),
          String(unitType).trim(),
          String(village).trim(),
          String(district || 'Local District').trim()
        ]
      );

      return res.json({ success: true, message: 'Equipment listing published successfully!' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create listing' });
    }
  });

  // 5. Labor / Equipment Requests (GET)
  app.get('/api/requests', async (req, res) => {
    const category = req.query.category as string;
    const search = req.query.search as string;

    let sql = "SELECT * FROM labor_requests WHERE status = 'open'";
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR village LIKE ? OR district LIKE ? OR requester_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY id DESC';

    try {
      const requests = await dbQueryAll(sql, params);
      return res.json(requests);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch requests' });
    }
  });

  // 6. Request Create (POST)
  app.post('/api/requests', async (req, res) => {
    const { userId, requesterName, requesterPhone, category, title, description, offeredRate, unitType, workDate, village, district } = req.body;

    if (!requesterName || !requesterPhone || !category || !title || !unitType || !village) {
      return res.status(400).json({ error: 'Missing required request details' });
    }

    try {
      await dbExec(
        `INSERT INTO labor_requests 
        (user_id, requester_name, requester_phone, category, title, description, offered_rate, unit_type, work_date, village, district, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
        [
          userId || 1,
          String(requesterName).trim(),
          String(requesterPhone).trim(),
          String(category).trim(),
          String(title).trim(),
          String(description || '').trim(),
          Number(offeredRate || 0),
          String(unitType).trim(),
          String(workDate || new Date().toISOString().split('T')[0]).trim(),
          String(village).trim(),
          String(district || 'Local District').trim()
        ]
      );

      return res.json({ success: true, message: 'Requirement posted successfully!' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create request' });
    }
  });

  // 7. Bookings Create (POST) - Two-Way Resolution Logic
  app.post('/api/bookings', async (req, res) => {
    const { listingId, requestId, requesterPhone, providerPhone, serviceTitle, amount, bookingDate } = req.body;

    if (!requesterPhone || !providerPhone || !serviceTitle || !amount) {
      return res.status(400).json({ error: 'Missing booking details' });
    }

    try {
      await dbExec(
        `INSERT INTO bookings 
        (listing_id, request_id, requester_phone, provider_phone, service_title, amount, status, booking_date)
        VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
        [
          listingId || null,
          requestId || null,
          String(requesterPhone),
          String(providerPhone),
          String(serviceTitle),
          Number(amount),
          String(bookingDate || new Date().toISOString().split('T')[0])
        ]
      );

      // PART 1: Resolve the TARGET ITEM
      if (requestId) {
        const reqExists = await dbQueryOne("SELECT id FROM labor_requests WHERE id = ?", [requestId]);
        if (reqExists) {
          await dbExec("UPDATE labor_requests SET status = 'matched' WHERE id = ?", [requestId]);
        } else {
          await dbExec(
            `INSERT INTO labor_requests (id, user_id, requester_name, requester_phone, category, title, offered_rate, unit_type, work_date, village, district, status)
            VALUES (?, 1, 'Matched Partner', ?, 'labor', ?, ?, 'day', ?, 'Match', 'Match', 'matched')`,
            [requestId, String(providerPhone), String(serviceTitle), Number(amount), String(bookingDate || new Date().toISOString().split('T')[0])]
          );
        }
      }

      if (listingId) {
        const listExists = await dbQueryOne("SELECT id FROM equipment_listings WHERE id = ?", [listingId]);
        if (listExists) {
          await dbExec("UPDATE equipment_listings SET is_available = 0 WHERE id = ?", [listingId]);
        } else {
          await dbExec(
            `INSERT INTO equipment_listings (id, user_id, owner_name, owner_phone, category, title, rate_per_unit, unit_type, village, district, is_available)
            VALUES (?, 1, 'Matched Owner', ?, 'equipment', ?, ?, 'hour', 'Match', 'Match', 0)`,
            [listingId, String(providerPhone), String(serviceTitle), Number(amount)]
          );
        }
      }

      // PART 2: Resolve the SOURCE ITEM
      const cleanRequesterPhone = String(requesterPhone).trim();
      await dbExec("UPDATE labor_requests SET status = 'matched' WHERE requester_phone = ? AND status = 'open'", [cleanRequesterPhone]);
      await dbExec("UPDATE equipment_listings SET is_available = 0 WHERE owner_phone = ? AND is_available = 1", [cleanRequesterPhone]);

      return res.json({ success: true, message: 'Booking confirmed and two-way resolution completed!' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to complete booking' });
    }
  });

  // 8. User Bookings (GET)
  app.get('/api/bookings', async (req, res) => {
    const phone = req.query.phone as string;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
      const bookings = await dbQueryAll(
        `SELECT * FROM bookings WHERE requester_phone = ? OR provider_phone = ? ORDER BY id DESC`,
        [phone, phone]
      );
      return res.json(bookings);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch bookings' });
    }
  });

  // Admin Dashboard API 1: Top-Level Metrics
  app.get('/api/admin/metrics', async (req, res) => {
    try {
      // PostgreSQL returns count as a string, so we use Number() to convert it safely
      const activeEq = await dbQueryOne("SELECT COUNT(*) as cnt FROM equipment_listings WHERE is_available = 1");
      const activeEquipmentCount = Number(activeEq?.cnt || 0);

      const activeReq = await dbQueryOne("SELECT COUNT(*) as cnt FROM labor_requests WHERE status = 'open'");
      const activeRequestsCount = Number(activeReq?.cnt || 0);
      
      const totalActiveListings = activeEquipmentCount + activeRequestsCount;

      const resolvedEq = await dbQueryOne("SELECT COUNT(*) as cnt FROM equipment_listings WHERE is_available = 0");
      const resolvedEquipmentCount = Number(resolvedEq?.cnt || 0);

      const resolvedReq = await dbQueryOne("SELECT COUNT(*) as cnt FROM labor_requests WHERE status != 'open'");
      const resolvedRequestsCount = Number(resolvedReq?.cnt || 0);
      
      const totalResolvedRequests = resolvedEquipmentCount + resolvedRequestsCount;

      const usersRes = await dbQueryOne("SELECT COUNT(*) as cnt FROM users");
      const totalUsers = Number(usersRes?.cnt || 0);

      return res.json({
        totalActiveListings,
        totalResolvedRequests,
        totalUsers,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch admin metrics' });
    }
  });

  // Admin Dashboard API 2: All Listings List
  app.get('/api/admin/listings', async (req, res) => {
    try {
      const equipmentRows = await dbQueryAll("SELECT * FROM equipment_listings ORDER BY id DESC");
      const requestRows = await dbQueryAll("SELECT * FROM labor_requests ORDER BY id DESC");

      const combined = [
        ...equipmentRows.map(row => ({
          id: `equipment-${row.id}`,
          rawId: row.id,
          kind: 'equipment',
          type: 'Have',
          title: row.title,
          category: row.category,
          ownerName: row.owner_name,
          ownerPhone: row.owner_phone,
          village: row.village,
          district: row.district || 'Local District',
          rate: row.rate_per_unit,
          unitType: row.unit_type,
          status: row.is_available === 1 ? 'Open' : 'Resolved',
          createdAt: row.created_at || new Date().toISOString()
        })),
        ...requestRows.map(row => ({
          id: `request-${row.id}`,
          rawId: row.id,
          kind: 'request',
          type: 'Need',
          title: row.title,
          category: row.category,
          ownerName: row.requester_name,
          ownerPhone: row.requester_phone,
          village: row.village,
          district: row.district || 'Local District',
          rate: row.offered_rate,
          unitType: row.unit_type,
          status: row.status === 'open' ? 'Open' : 'Resolved',
          createdAt: row.created_at || new Date().toISOString()
        }))
      ];

      return res.json(combined);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch admin listings' });
    }
  });

  // Admin Dashboard API 3: Toggle Status between 'Open' and 'Resolved'
  app.post('/api/admin/listings/toggle-status', async (req, res) => {
    const { kind, id, status } = req.body;
    if (!kind || !id || !status) {
      return res.status(400).json({ error: 'Missing required parameters: kind, id, status' });
    }

    try {
      if (kind === 'equipment') {
        const isAvailable = status === 'Open' ? 1 : 0;
        await dbExec("UPDATE equipment_listings SET is_available = ? WHERE id = ?", [isAvailable, id]);
      } else if (kind === 'request') {
        const reqStatus = status === 'Open' ? 'open' : 'Resolved';
        await dbExec("UPDATE labor_requests SET status = ? WHERE id = ?", [reqStatus, id]);
      } else {
        return res.status(400).json({ error: 'Invalid listing kind' });
      }

      return res.json({ success: true, message: `Listing status updated to ${status}` });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update status' });
    }
  });

  // 9. ML Equipment/Labor Matching Endpoint (POST /api/match)
  // 9. ML Equipment/Labor Matching Endpoint (POST /api/match)
  app.post('/api/match', async (req, res) => {
    const listing = req.body;
    if (!listing || !listing.type || !listing.title) {
      return res.status(400).json({ error: 'Listing payload must contain type ("Need" or "Have") and title' });
    }

    try {
      // Pointing to your new standalone Python microservice
      const pythonApiUrl = 'http://127.0.0.1:8000/match';
      
      const response = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Python API failed: ${errorText}`);
      }

      const result = await response.json();
      return res.json(result);
    } catch (err: any) {
      console.error('Python ML matcher failed:', err.message);
      return res.status(500).json({ error: 'ML matching failed', details: err.message });
    }
  });

  // Vite middleware for dev or static server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KisanConnect full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
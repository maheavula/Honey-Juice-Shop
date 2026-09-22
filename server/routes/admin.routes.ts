import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { PersistenceService } from '../services/persistenceService.js';
import { requireRole } from '../middleware/roleGuard.js';
import { Juice, OrderStatus, UserStatus } from '../types/index.js';

const router = Router();

// Enforce admin role on all /api/admin routes
router.use(requireRole('admin'));

// Helper to validate external image URL
function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// GET /api/admin/dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const data = await PersistenceService.getData();

    const totalOrders = data.orders.length;
    const completedOrders = data.orders.filter((o) => o.status === 'delivered');
    const totalRevenuePaise = data.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const activeCustomers = data.users.filter((u) => u.role === 'customer' && u.status === 'active').length;
    const suspendedCustomers = data.users.filter((u) => u.role === 'customer' && u.status === 'suspended').length;

    const outOfStockJuices = data.juices.filter((j) => j.stock === 0);
    const lowStockJuices = data.juices.filter((j) => j.stock > 0 && j.stock <= 10);

    // Recent orders
    const recentOrders = [...data.orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalRevenuePaise,
        totalOrders,
        completedOrdersCount: completedOrders.length,
        activeCustomers,
        suspendedCustomers,
        totalProducts: data.juices.length,
        outOfStockCount: outOfStockJuices.length,
        lowStockCount: lowStockJuices.length
      },
      lowStockItems: [...outOfStockJuices, ...lowStockJuices],
      recentOrders
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to load dashboard metrics' });
  }
});

// GET /api/admin/juices
router.get('/juices', async (req: Request, res: Response) => {
  try {
    const data = await PersistenceService.getData();
    res.json({
      success: true,
      count: data.juices.length,
      juices: data.juices
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch admin juices' });
  }
});

// POST /api/admin/juices
router.post('/juices', async (req: Request, res: Response) => {
  try {
    const { name, description, category, price, stock, fruits, imageUrl, volumeMl, isOrganic } = req.body;

    if (!name || !description || !category || price === undefined || stock === undefined) {
      res.status(400).json({ success: false, error: 'Missing required juice parameters.' });
      return;
    }

    const priceInt = Number(price);
    const stockInt = Number(stock);

    if (isNaN(priceInt) || priceInt < 0 || !Number.isInteger(priceInt)) {
      res.status(400).json({ success: false, error: 'Price must be a non-negative integer (paise).' });
      return;
    }

    if (isNaN(stockInt) || stockInt < 0 || !Number.isInteger(stockInt)) {
      res.status(400).json({ success: false, error: 'Stock must be a non-negative integer.' });
      return;
    }

    if (imageUrl && !isValidHttpUrl(imageUrl)) {
      res.status(400).json({ success: false, error: 'Image URL must be a valid external HTTP/HTTPS URL.' });
      return;
    }

    const newJuiceId = `jce_${crypto.randomBytes(6).toString('hex')}`;

    const newJuice: Juice = {
      id: newJuiceId,
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      fruits: Array.isArray(fruits) ? fruits.map((f: string) => f.trim()).filter(Boolean) : [],
      price: priceInt,
      stock: stockInt,
      imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&auto=format&fit=crop&q=80',
      volumeMl: Number(volumeMl) || 350,
      isOrganic: Boolean(isOrganic),
      createdAt: new Date().toISOString()
    };

    await PersistenceService.updateData((data) => {
      data.juices.push(newJuice);
      return data;
    });

    res.status(201).json({
      success: true,
      juice: newJuice,
      message: 'Juice created successfully!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create juice' });
  }
});

// PUT /api/admin/juices/:id
router.put('/juices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock, fruits, imageUrl, volumeMl, isOrganic } = req.body;

    let updatedJuice: Juice | null = null;

    await PersistenceService.updateData((data) => {
      const index = data.juices.findIndex((j) => j.id === id);
      if (index === -1) {
        throw new Error(`Juice SKU ${id} not found.`);
      }

      if (price !== undefined) {
        const p = Number(price);
        if (isNaN(p) || p < 0 || !Number.isInteger(p)) {
          throw new Error('Price must be a non-negative integer (paise).');
        }
        data.juices[index].price = p;
      }

      if (stock !== undefined) {
        const s = Number(stock);
        if (isNaN(s) || s < 0 || !Number.isInteger(s)) {
          throw new Error('Stock must be a non-negative integer.');
        }
        data.juices[index].stock = s;
      }

      if (imageUrl !== undefined) {
        if (imageUrl && !isValidHttpUrl(imageUrl)) {
          throw new Error('Image URL must be a valid HTTP/HTTPS URL.');
        }
        data.juices[index].imageUrl = imageUrl.trim();
      }

      if (name) data.juices[index].name = name.trim();
      if (description) data.juices[index].description = description.trim();
      if (category) data.juices[index].category = category.trim();
      if (fruits && Array.isArray(fruits)) {
        data.juices[index].fruits = fruits.map((f: string) => f.trim()).filter(Boolean);
      }
      if (volumeMl !== undefined) data.juices[index].volumeMl = Number(volumeMl);
      if (isOrganic !== undefined) data.juices[index].isOrganic = Boolean(isOrganic);

      updatedJuice = data.juices[index];
      return data;
    });

    res.json({
      success: true,
      juice: updatedJuice,
      message: 'Juice updated successfully!'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to update juice' });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const data = await PersistenceService.getData();
    const orders = [...data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch orders' });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses: OrderStatus[] = ['processing', 'dispatched', 'delivered', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
      return;
    }

    let updatedOrder: any = null;

    await PersistenceService.updateData((data) => {
      const order = data.orders.find((o) => o.id === id);
      if (!order) {
        throw new Error('Order not found');
      }

      order.status = status;
      updatedOrder = order;
      return data;
    });

    res.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to "${status}".`
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to update order status' });
  }
});

// GET /api/admin/customers
router.get('/customers', async (req: Request, res: Response) => {
  try {
    const data = await PersistenceService.getData();
    const customers = data.users
      .filter((u) => u.role === 'customer')
      .map((u) => PersistenceService.sanitizeUser(u));

    res.json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch customers' });
  }
});

// PATCH /api/admin/customers/:id/status
router.patch('/customers/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed: UserStatus[] = ['active', 'suspended'];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ success: false, error: 'Status must be "active" or "suspended".' });
      return;
    }

    let updatedUser: any = null;

    await PersistenceService.updateData((data) => {
      const user = data.users.find((u) => u.id === id);
      if (!user) {
        throw new Error('Customer account not found.');
      }

      user.status = status;
      updatedUser = user;

      // When suspended, immediately invalidate and purge all sessions for this customer
      if (status === 'suspended') {
        data.sessions = data.sessions.filter((s) => s.userId !== id);
      }

      return data;
    });

    res.json({
      success: true,
      customer: PersistenceService.sanitizeUser(updatedUser),
      message: `Customer account has been ${status === 'suspended' ? 'suspended and all active sessions purged' : 'reactivated'}.`
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to update customer status' });
  }
});

export default router;

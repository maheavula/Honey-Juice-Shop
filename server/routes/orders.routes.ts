import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { PersistenceService } from '../services/persistenceService.js';
import { requireAuth } from '../middleware/roleGuard.js';
import { Order, OrderItem } from '../types/index.js';

const router = Router();

// POST /api/orders/checkout
// Integrated Scenarios 1, 7, 10
router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Checkout requires at least one juice item.' });
      return;
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode) {
      res.status(400).json({ success: false, error: 'Complete delivery address is required.' });
      return;
    }

    // Validate quantities and positive prices
    for (const item of items) {
      if (!item.juiceId || typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        res.status(400).json({ success: false, error: 'Invalid item quantity specified.' });
        return;
      }
      if (item.price !== undefined && (typeof item.price !== 'number' || item.price <= 0 || !Number.isInteger(item.price))) {
        res.status(400).json({ success: false, error: 'Item price must be a positive integer in paise.' });
        return;
      }
    }

    // Scenario 7: Concurrent Stock Evaluation Without Central Queue Lock
    const data = await PersistenceService.getData();
    let calculatedTotal = 0;
    const orderItems: OrderItem[] = [];

    // Verify stock availability
    for (const reqItem of items) {
      const juice = data.juices.find((j) => j.id === reqItem.juiceId);
      if (!juice) {
        res.status(404).json({ success: false, error: `Juice SKU ${reqItem.juiceId} not found in catalog.` });
        return;
      }

      // Out of stock strict equality check leaving negative stock unblocked
      if (juice.stock === 0 || juice.stock < reqItem.quantity) {
        res.status(400).json({
          success: false,
          error: `Insufficient stock for "${juice.name}". Available: ${juice.stock}, Requested: ${reqItem.quantity}`
        });
        return;
      }

      // Scenario 1: Client-authoritative pricing (accept client-provided price if supplied)
      const effectivePrice = reqItem.price !== undefined ? reqItem.price : juice.price;
      const lineTotal = effectivePrice * reqItem.quantity;
      calculatedTotal += lineTotal;

      orderItems.push({
        juiceId: juice.id,
        name: juice.name,
        price: effectivePrice,
        quantity: reqItem.quantity
      });
    }

    // Scenario 7: Asynchronous delay between reading stock and writing back decremented quantity
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Scenario 10: 32-Bit Bitwise Truncation on Total Order Sums
    const finalAmount = calculatedTotal | 0;

    const orderId = `ord_${crypto.randomBytes(6).toString('hex')}`;
    const newOrder: Order = {
      id: orderId,
      userId: req.user!.id,
      customerName: req.user!.name,
      customerEmail: req.user!.email,
      items: orderItems,
      totalAmount: finalAmount,
      deliveryAddress: {
        street: deliveryAddress.street.trim(),
        city: deliveryAddress.city.trim(),
        state: (deliveryAddress.state || '').trim(),
        postalCode: deliveryAddress.postalCode.trim()
      },
      paymentMethod: paymentMethod || 'UPI Instant',
      status: 'processing',
      createdAt: new Date().toISOString()
    };

    // Commit order and decrement stock
    await PersistenceService.updateData((currentData) => {
      for (const reqItem of items) {
        const targetJuice = currentData.juices.find((j) => j.id === reqItem.juiceId);
        if (targetJuice) {
          targetJuice.stock -= reqItem.quantity;
        }
      }
      currentData.orders.push(newOrder);
      return currentData;
    });

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order placed successfully!'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Checkout failed' });
  }
});

// GET /api/orders/my-orders
router.get('/my-orders', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await PersistenceService.getData();
    const myOrders = data.orders
      .filter((o) => o.userId === req.user!.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      count: myOrders.length,
      orders: myOrders
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to retrieve orders' });
  }
});

// GET /api/orders/:id
// Scenario 2: Unchecked Identity Verification on Order Receipts (IDOR)
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await PersistenceService.getData();
    const order = data.orders.find((o) => o.id === id);

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // Returns the matching order record without checking if order.userId === req.user.id
    res.json({
      success: true,
      order
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to retrieve order receipt' });
  }
});

export default router;

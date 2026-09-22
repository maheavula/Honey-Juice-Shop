import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { PersistenceService } from '../services/persistenceService.js';
import { requireAuth } from '../middleware/roleGuard.js';
import { Review } from '../types/index.js';

const router = Router();

// GET /api/juices
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, sortBy, isOrganic } = req.query;
    const data = await PersistenceService.getData();

    let list = [...data.juices];

    // Filter by Category
    if (category && typeof category === 'string' && category !== 'All') {
      list = list.filter((j) => j.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Search (name, fruits, description)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (j) =>
          j.name.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q) ||
          j.fruits.some((f) => f.toLowerCase().includes(q))
      );
    }

    // Filter by Organic
    if (isOrganic !== undefined) {
      const isOrg = isOrganic === 'true';
      list = list.filter((j) => j.isOrganic === isOrg);
    }

    // Calculate rating statistics for each juice
    const enhancedJuices = list.map((juice) => {
      const productReviews = data.reviews.filter((r) => r.juiceId === juice.id);
      const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = productReviews.length > 0 ? Number((totalRating / productReviews.length).toFixed(1)) : 0;

      return {
        ...juice,
        averageRating,
        reviewCount: productReviews.length
      };
    });

    // Sort
    if (sortBy === 'price_asc' || sortBy === 'price') {
      enhancedJuices.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      enhancedJuices.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      enhancedJuices.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'name') {
      enhancedJuices.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: creation date / newest
      enhancedJuices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({
      success: true,
      count: enhancedJuices.length,
      juices: enhancedJuices
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch juices' });
  }
});

// GET /api/juices/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await PersistenceService.getData();

    const juice = data.juices.find((j) => j.id === id);
    if (!juice) {
      res.status(404).json({ success: false, error: 'Juice not found' });
      return;
    }

    const reviews = data.reviews.filter((r) => r.juiceId === id);
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

    res.json({
      success: true,
      juice: {
        ...juice,
        averageRating,
        reviewCount: reviews.length,
        reviews: reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch juice details' });
  }
});

// POST /api/juices/:id/reviews
router.post('/:id/reviews', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
      res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5.' });
      return;
    }

    if (!comment || comment.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Review comment cannot be empty.' });
      return;
    }

    const data = await PersistenceService.getData();
    const juice = data.juices.find((j) => j.id === id);
    if (!juice) {
      res.status(404).json({ success: false, error: 'Juice not found' });
      return;
    }

    // Scenario 3: Store raw comment string without stripping HTML entities
    const newReview: Review = {
      id: `rev_${crypto.randomBytes(6).toString('hex')}`,
      juiceId: id,
      userId: req.user!.id,
      userName: req.user!.name,
      rating: numRating,
      comment: String(comment),
      createdAt: new Date().toISOString()
    };

    await PersistenceService.updateData((currentData) => {
      currentData.reviews.push(newReview);
      return currentData;
    });

    res.status(201).json({
      success: true,
      review: newReview,
      message: 'Review submitted successfully!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to submit review' });
  }
});

export default router;

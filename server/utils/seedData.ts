import { RuntimeData } from '../types/index.js';
import { hashPassword } from './passwordHasher.js';

export async function generateInitialSeedData(): Promise<RuntimeData> {
  const adminPasswordHash = await hashPassword('Admin#HoneyJuice2026!');
  const customerPasswordHash = await hashPassword('Customer@Juice2026');

  return {
    users: [
      {
        id: "usr_a7f9b2d4e1c8",
        name: "Admin Manager",
        email: "admin@honeyjuiceshop.local",
        passwordHash: adminPasswordHash,
        role: "admin",
        status: "active",
        phone: "+91 9876543210",
        address: {
          street: "12 Orchard Boulevard",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560001"
        },
        createdAt: "2026-09-01T08:00:00.000Z"
      },
      {
        id: "usr_c3e5d7f1a9b4",
        name: "Rohan Patel",
        email: "customer@honeyjuiceshop.local",
        passwordHash: customerPasswordHash,
        role: "customer",
        status: "active",
        phone: "+91 9123456780",
        address: {
          street: "45 Green Park",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560025"
        },
        createdAt: "2026-09-01T09:00:00.000Z"
      }
    ],
    juices: [
      {
        id: "jce_8f1a3d5e7c9b",
        name: "Raw Honey Alphonso Blast",
        description: "Hand-picked Ratnagiri Alphonso mangoes cold-blended and infused with raw, unprocessed forest honey and a zesty hint of lemon.",
        category: "Honey Infusions",
        fruits: ["Mango", "Lemon", "Wild Forest Honey"],
        price: 24900,
        stock: 45,
        imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?w=800&auto=format&fit=crop&q=80",
        volumeMl: 350,
        isOrganic: true,
        createdAt: "2026-09-01T08:00:00.000Z"
      },
      {
        id: "jce_2b4c6e8a0d1f",
        name: "Ruby Citrus Detox",
        description: "Vibrant Sicilian blood orange and ruby pink grapefruit cold-pressed with fresh mountain spearmint for total cellular revival.",
        category: "Cold-Pressed",
        fruits: ["Blood Orange", "Grapefruit", "Mint"],
        price: 19900,
        stock: 30,
        imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80",
        volumeMl: 350,
        isOrganic: true,
        createdAt: "2026-09-01T08:00:00.000Z"
      },
      {
        id: "jce_9a1c3e5b7d9f",
        name: "Green Vitality Elixir",
        description: "Crisp Granny Smith apples, crunchy celery, organic baby spinach and spicy root ginger pressed slowly without heat degradation.",
        category: "Green Cleanses",
        fruits: ["Green Apple", "Celery", "Spinach", "Ginger"],
        price: 22900,
        stock: 25,
        imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&auto=format&fit=crop&q=80",
        volumeMl: 350,
        isOrganic: true,
        createdAt: "2026-09-01T08:00:00.000Z"
      },
      {
        id: "jce_5e7a9c1d3f5b",
        name: "Golden Turmeric Pineapple Glow",
        description: "Tropical Queen pineapples, sun-dried raw organic turmeric roots, crushed Tellicherry black pepper and golden wildflower honey.",
        category: "Wellness Tonics",
        fruits: ["Pineapple", "Raw Turmeric", "Black Pepper", "Acacia Honey"],
        price: 26900,
        stock: 20,
        imageUrl: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&auto=format&fit=crop&q=80",
        volumeMl: 350,
        isOrganic: true,
        createdAt: "2026-09-01T08:00:00.000Z"
      },
      {
        id: "jce_3d5f7b9a1c3e",
        name: "Wild Berry & Acacia Hydrator",
        description: "Mountain strawberries, hand-harvested wild blueberries and tart raspberries blended with pure acacia honey and alkaline electrolytes.",
        category: "Berry Blends",
        fruits: ["Strawberry", "Blueberry", "Raspberry", "Honey"],
        price: 29900,
        stock: 15,
        imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80",
        volumeMl: 350,
        isOrganic: true,
        createdAt: "2026-09-01T08:00:00.000Z"
      },
      {
        id: "jce_7c9e1a3b5d7f",
        name: "Pure Pomegranate Spark",
        description: "First-press Bhagwa ruby pomegranate arils gently strained with pink Himalayan mineral salt for heart health and rich polyphenols.",
        category: "Pure Cold-Pressed",
        fruits: ["Ruby Pomegranate", "Himalayan Salt"],
        price: 27900,
        stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1570857502809-08184874388e?w=800&auto=format&fit=crop&q=80",
        volumeMl: 350,
        isOrganic: true,
        createdAt: "2026-09-01T08:00:00.000Z"
      }
    ],
    reviews: [
      {
        id: "rev_1a3c5e7b9d1f",
        juiceId: "jce_8f1a3d5e7c9b",
        userId: "usr_c3e5d7f1a9b4",
        userName: "Rohan Patel",
        rating: 5,
        comment: "Incredible fresh mango flavor. The honey cuts through the tang perfectly!",
        createdAt: "2026-09-02T10:15:00.000Z"
      },
      {
        id: "rev_2b4d6f8a0c2e",
        juiceId: "jce_9a1c3e5b7d9f",
        userId: "usr_c3e5d7f1a9b4",
        userName: "Rohan Patel",
        rating: 5,
        comment: "Super refreshing morning kick. The ginger zing gives it the best energy boost.",
        createdAt: "2026-09-04T07:30:00.000Z"
      },
      {
        id: "rev_3c5e7a9b1d3f",
        juiceId: "jce_5e7a9c1d3f5b",
        userId: "usr_c3e5d7f1a9b4",
        userName: "Rohan Patel",
        rating: 4,
        comment: "Great anti-inflammatory blend. Turmeric with honey and pineapple is surprisingly smooth!",
        createdAt: "2026-09-05T14:20:00.000Z"
      }
    ],
    orders: [
      {
        id: "ord_6b8d0f2a4c6e",
        userId: "usr_c3e5d7f1a9b4",
        customerName: "Rohan Patel",
        customerEmail: "customer@honeyjuiceshop.local",
        items: [
          {
            juiceId: "jce_8f1a3d5e7c9b",
            name: "Raw Honey Alphonso Blast",
            price: 24900,
            quantity: 2
          }
        ],
        totalAmount: 49800,
        deliveryAddress: {
          street: "45 Green Park",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560025"
        },
        paymentMethod: "UPI / Card",
        status: "delivered",
        createdAt: "2026-09-03T11:00:00.000Z"
      }
    ],
    sessions: [],
    metadata: {
      store: "Honey Juice Shop",
      version: "1.0.0",
      currency: "INR"
    }
  };
}

import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { User } from "../models/User";
import { logger } from "../lib/logger";

export async function seedDatabase() {
  try {
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      logger.info("Database already seeded, skipping...");
      return;
    }

    const categories = await Category.create([
      { name: "Electronics", slug: "electronics", description: "Latest gadgets and devices" },
      { name: "Fashion", slug: "fashion", description: "Trendy clothing and accessories" },
      { name: "Home & Garden", slug: "home-garden", description: "Everything for your home" },
      { name: "Sports", slug: "sports", description: "Sports equipment and gear" },
      { name: "Books", slug: "books", description: "Latest books and publications" },
    ]);

    const products = [
      {
        name: "Premium Wireless Headphones",
        slug: "premium-wireless-headphones",
        brand: "AudioPro",
        category: "Electronics",
        price: 15999,
        comparePrice: 19999,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
        ],
        stock: 45,
        sold: 128,
        views: 1240,
        rating: 4.8,
        reviewCount: 234,
        isFeatured: true,
        isFlashSale: true,
        description: "Premium quality wireless headphones with noise cancellation and 30-hour battery life.",
        specifications: [
          { key: "Battery Life", value: "30 hours" },
          { key: "Noise Cancellation", value: "Active" },
          { key: "Connectivity", value: "Bluetooth 5.0" },
        ],
      },
      {
        name: "Designer Leather Jacket",
        slug: "designer-leather-jacket",
        brand: "StyleWear",
        category: "Fashion",
        price: 12499,
        comparePrice: 16999,
        images: [
          "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&q=80",
          "https://images.unsplash.com/photo-1595777707802-c55abb0c754d?w=500&q=80",
        ],
        stock: 23,
        sold: 56,
        views: 890,
        rating: 4.6,
        reviewCount: 89,
        isFeatured: true,
        isFlashSale: false,
        description: "Premium leather jacket perfect for any occasion. Handcrafted with finest materials.",
        specifications: [
          { key: "Material", value: "100% Genuine Leather" },
          { key: "Lining", value: "Silk" },
          { key: "Care", value: "Dry Clean" },
        ],
      },
      {
        name: "Smart Home Hub",
        slug: "smart-home-hub",
        brand: "TechHome",
        category: "Electronics",
        price: 8999,
        comparePrice: 11999,
        images: [
          "https://images.unsplash.com/photo-1558089228-d2a6f05d4c4c?w=500&q=80",
          "https://images.unsplash.com/photo-1559163853-34c3a7b5f00d?w=500&q=80",
        ],
        stock: 67,
        sold: 234,
        views: 2156,
        rating: 4.5,
        reviewCount: 412,
        isFeatured: true,
        isFlashSale: true,
        description: "Control all your smart devices with this intelligent hub. Voice enabled.",
        specifications: [
          { key: "Compatibility", value: "WiFi, Bluetooth, Zigbee" },
          { key: "Voice Assistant", value: "Built-in" },
          { key: "Range", value: "100ft" },
        ],
      },
      {
        name: "Yoga Mat Premium",
        slug: "yoga-mat-premium",
        brand: "FitLife",
        category: "Sports",
        price: 3499,
        comparePrice: 4999,
        images: [
          "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80",
          "https://images.unsplash.com/photo-1506433773649-c0b4b3534bec?w=500&q=80",
        ],
        stock: 156,
        sold: 789,
        views: 5234,
        rating: 4.7,
        reviewCount: 567,
        isFeatured: false,
        isFlashSale: false,
        description: "Non-slip yoga mat with extra cushioning for comfort and support.",
        specifications: [
          { key: "Material", value: "Natural Rubber" },
          { key: "Thickness", value: "6mm" },
          { key: "Length", value: "183cm" },
        ],
      },
      {
        name: "The Startup Way",
        slug: "the-startup-way",
        brand: "Books & Co",
        category: "Books",
        price: 1299,
        comparePrice: 1799,
        images: [
          "https://images.unsplash.com/photo-150784272343-583f20270319?w=500&q=80",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
        ],
        stock: 89,
        sold: 234,
        views: 456,
        rating: 4.4,
        reviewCount: 123,
        isFeatured: false,
        isFlashSale: false,
        description: "Learn how to build and scale successful startups. A must-read guide.",
        specifications: [
          { key: "Author", value: "Eric Ries" },
          { key: "Pages", value: "544" },
          { key: "Format", value: "Hardcover" },
        ],
      },
      {
        name: "Wireless Gaming Mouse",
        slug: "wireless-gaming-mouse",
        brand: "GameTech",
        category: "Electronics",
        price: 4499,
        comparePrice: 6999,
        images: [
          "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80",
          "https://images.unsplash.com/photo-1587829191301-5f63e1a433a3?w=500&q=80",
        ],
        stock: 234,
        sold: 1205,
        views: 8934,
        rating: 4.9,
        reviewCount: 1234,
        isFeatured: true,
        isFlashSale: true,
        description: "Professional gaming mouse with adjustable DPI and ergonomic design.",
        specifications: [
          { key: "DPI", value: "Up to 16000" },
          { key: "Battery", value: "100 hours" },
          { key: "Buttons", value: "8 programmable" },
        ],
      },
    ];

    await Product.create(products);

    const adminEmail = "admin@zest.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        email: adminEmail,
        password: "Admin@123456",
        role: "admin",
        firstName: "Admin",
        lastName: "User",
      });
    }

    logger.info("Database seeded successfully!");
  } catch (error) {
    logger.error({ error }, "Error seeding database");
  }
}

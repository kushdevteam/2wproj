import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTokenSchema, insertVoteSchema, insertUserSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Configure multer for image uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  }, express.static(uploadsDir));

  // Solana address validation schema
  const solanaAddressSchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format");

  // User registration routes
  app.post("/api/users/register", async (req, res) => {
    try {
      const { solanaAddress, telegramId, telegramUsername } = req.body;

      // Validate Solana address
      const addressValidation = solanaAddressSchema.safeParse(solanaAddress);
      if (!addressValidation.success) {
        return res.status(400).json({ 
          message: "Invalid Solana address format",
          errors: addressValidation.error.issues 
        });
      }

      // Check if Solana address already exists
      const existingUser = await storage.getUserBySolanaAddress(solanaAddress);
      if (existingUser) {
        return res.status(400).json({ message: "Solana address already registered" });
      }

      // Check if Telegram ID already exists (if provided)
      if (telegramId) {
        const existingTelegramUser = await storage.getUserByTelegramId(telegramId);
        if (existingTelegramUser) {
          return res.status(400).json({ message: "Telegram account already linked to another user" });
        }
      }

      const validation = insertUserSchema.safeParse({
        solanaAddress,
        telegramId: telegramId || null,
        telegramUsername: telegramUsername || null,
        isVerified: "false",
      });

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: validation.error.issues 
        });
      }

      const user = await storage.createUser(validation.data);
      
      // Don't expose sensitive data
      const publicUser = {
        id: user.id,
        solanaAddress: user.solanaAddress,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };

      res.status(201).json({
        message: "User registered successfully",
        user: publicUser,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Check if Solana address is available
  app.get("/api/users/check-address/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      const addressValidation = solanaAddressSchema.safeParse(address);
      if (!addressValidation.success) {
        return res.status(400).json({ message: "Invalid Solana address format" });
      }

      const existingUser = await storage.getUserBySolanaAddress(address);
      res.json({ available: !existingUser });
    } catch (error) {
      res.status(500).json({ message: "Failed to check address availability" });
    }
  });

  // Get user by Solana address (for login)
  app.post("/api/users/login", async (req, res) => {
    try {
      const { solanaAddress } = req.body;
      
      const addressValidation = solanaAddressSchema.safeParse(solanaAddress);
      if (!addressValidation.success) {
        return res.status(400).json({ message: "Invalid Solana address format" });
      }

      const user = await storage.getUserBySolanaAddress(solanaAddress);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't expose sensitive data
      const publicUser = {
        id: user.id,
        solanaAddress: user.solanaAddress,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };

      res.json({
        message: "Login successful",
        user: publicUser,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Get all tokens
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getAllTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tokens" });
    }
  });

  // Get recent tokens
  app.get("/api/tokens/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const tokens = await storage.getRecentTokens(limit);
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent tokens" });
    }
  });

  // Get tokens sorted by votes
  app.get("/api/tokens/trending", async (req, res) => {
    try {
      const tokens = await storage.getTokensSortedByVotes();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending tokens" });
    }
  });

  // Get single token
  app.get("/api/tokens/:id", async (req, res) => {
    try {
      const token = await storage.getToken(req.params.id);
      if (!token) {
        return res.status(404).json({ message: "Token not found" });
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch token" });
    }
  });

  // Launch token (create new token with image upload)
  app.post("/api/tokens/launch", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const { name, ticker } = req.body;
      
      // Validate input
      const validation = insertTokenSchema.safeParse({
        name,
        ticker,
        imageUrl: `/uploads/${req.file.filename}`,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validation.error.issues 
        });
      }

      // Simulate PumpFun deployment delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock PumpFun link
      const pumpfunLink = `https://pump.fun/token/${ticker.toLowerCase()}-${Date.now()}`;

      const token = await storage.createToken({
        ...validation.data,
        pumpfunLink,
      });

      res.status(201).json({
        ...token,
        message: "Token launched successfully!",
      });
    } catch (error) {
      console.error('Launch error:', error);
      res.status(500).json({ message: "Failed to launch token" });
    }
  });

  // Vote for token
  app.post("/api/tokens/:id/vote", async (req, res) => {
    try {
      const tokenId = req.params.id;
      const voterIp = req.ip || req.connection.remoteAddress || 'unknown';

      // Check if user already voted
      const hasVoted = await storage.hasUserVoted(tokenId, voterIp);
      if (hasVoted) {
        return res.status(400).json({ message: "You have already voted for this token" });
      }

      // Check if token exists
      const token = await storage.getToken(tokenId);
      if (!token) {
        return res.status(404).json({ message: "Token not found" });
      }

      const validation = insertVoteSchema.safeParse({
        tokenId,
        voterIp,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid vote data", 
          errors: validation.error.issues 
        });
      }

      await storage.addVote(validation.data);
      const updatedToken = await storage.getToken(tokenId);

      res.json({
        message: "Vote added successfully",
        votes: updatedToken?.votes || 0,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to add vote" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

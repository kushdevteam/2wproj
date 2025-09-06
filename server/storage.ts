import { type User, type InsertUser, type UpdateUser, type Token, type InsertToken, type Vote, type InsertVote } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserBySolanaAddress(solanaAddress: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUser): Promise<User | undefined>;
  
  // Token methods
  createToken(token: InsertToken): Promise<Token>;
  getToken(id: string): Promise<Token | undefined>;
  getAllTokens(): Promise<Token[]>;
  getTokensSortedByVotes(): Promise<Token[]>;
  getRecentTokens(limit?: number): Promise<Token[]>;
  
  // Vote methods
  addVote(vote: InsertVote): Promise<Vote>;
  getTokenVotes(tokenId: string): Promise<Vote[]>;
  hasUserVoted(tokenId: string, voterIp: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tokens: Map<string, Token>;
  private votes: Map<string, Vote>;

  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.votes = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserBySolanaAddress(solanaAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.solanaAddress === solanaAddress,
    );
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.telegramId === telegramId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      telegramId: insertUser.telegramId || null,
      telegramUsername: insertUser.telegramUsername || null,
      isVerified: insertUser.isVerified || "false",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = randomUUID();
    const token: Token = {
      ...insertToken,
      id,
      votes: 0,
      createdAt: new Date(),
      pumpfunLink: insertToken.pumpfunLink || null,
    };
    this.tokens.set(id, token);
    return token;
  }

  async getToken(id: string): Promise<Token | undefined> {
    return this.tokens.get(id);
  }

  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async getTokensSortedByVotes(): Promise<Token[]> {
    return Array.from(this.tokens.values()).sort((a, b) => (b.votes || 0) - (a.votes || 0));
  }

  async getRecentTokens(limit: number = 10): Promise<Token[]> {
    return Array.from(this.tokens.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async addVote(insertVote: InsertVote): Promise<Vote> {
    const id = randomUUID();
    const vote: Vote = {
      ...insertVote,
      id,
      timestamp: new Date(),
    };
    
    this.votes.set(id, vote);
    
    // Update token vote count
    const token = this.tokens.get(insertVote.tokenId);
    if (token) {
      token.votes = (token.votes || 0) + 1;
      this.tokens.set(token.id, token);
    }
    
    return vote;
  }

  async getTokenVotes(tokenId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(vote => vote.tokenId === tokenId);
  }

  async hasUserVoted(tokenId: string, voterIp: string): Promise<boolean> {
    return Array.from(this.votes.values()).some(
      vote => vote.tokenId === tokenId && vote.voterIp === voterIp
    );
  }
}

export const storage = new MemStorage();

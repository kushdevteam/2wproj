import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';

// Initialize bot
const token = process.env.TELEGRAM_BOT_TOKEN!;
const bot = new TelegramBot(token, { polling: true });

const DOMAIN = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
const WEBAPP_URL = `https://${DOMAIN}`;
const DRAWYOURMEME_TOKEN_LINK = "https://pump.fun/coin/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"; // Mock link

export function setupTelegramBot() {
  console.log('Setting up Telegram bot...');

  // Handle /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id.toString();
    const username = msg.from?.username;

    try {
      // Check if user exists in our database
      let user;
      if (userId) {
        user = await storage.getUserByTelegramId(userId);
      }

      const welcomeMessage = user 
        ? `Welcome back to DrawYourMeme! 🎨\n\nYour account: ${user.solanaAddress.slice(0, 4)}...${user.solanaAddress.slice(-4)}`
        : `Welcome to DrawYourMeme! 🎨\n\nThe first meme token launchpad where you draw, name, and launch tokens instantly!\n\n🚀 No wallet connection required\n🎨 Just draw and create\n💰 Launch on PumpFun instantly`;

      const keyboard = {
        inline_keyboard: [
          [
            { 
              text: '🎮 Play DrawYourMeme', 
              web_app: { url: WEBAPP_URL } 
            }
          ],
          [
            { 
              text: '💎 Buy $DRAWYOURMEME Token', 
              url: DRAWYOURMEME_TOKEN_LINK 
            }
          ],
          [
            { text: '🖼️ Gallery', callback_data: 'gallery' },
            { text: '📊 Stats', callback_data: 'stats' }
          ],
          [
            { text: '❓ Help', callback_data: 'help' },
            { text: '📢 Channel', url: 'https://t.me/drawyourmeme' }
          ]
        ]
      };

      await bot.sendMessage(chatId, welcomeMessage, { 
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });

      // Update user's telegram info if they exist
      if (user && userId && username) {
        await storage.updateUser(user.id, {
          telegramId: userId,
          telegramUsername: username,
        });
      }

    } catch (error) {
      console.error('Error handling /start:', error);
      await bot.sendMessage(chatId, '❌ Something went wrong. Please try again later.');
    }
  });

  // Handle callback queries (button presses)
  bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;
    const userId = query.from.id.toString();

    if (!chatId) return;

    try {
      await bot.answerCallbackQuery(query.id);

      switch (data) {
        case 'gallery':
          try {
            const tokens = await storage.getRecentTokens(5);
            let galleryMessage = '🖼️ <b>Recent Meme Tokens</b>\n\n';
            
            if (tokens.length === 0) {
              galleryMessage += 'No tokens created yet! Be the first to launch a meme token! 🚀';
            } else {
              tokens.forEach((token, index) => {
                galleryMessage += `${index + 1}. <b>${token.name}</b> (${token.ticker})\n`;
                galleryMessage += `   💎 ${token.votes || 0} votes\n`;
                if (token.pumpfunLink) {
                  galleryMessage += `   🔗 <a href="${token.pumpfunLink}">View on PumpFun</a>\n`;
                }
                galleryMessage += '\n';
              });
            }

            const galleryKeyboard = {
              inline_keyboard: [
                [{ text: '🎮 Create Your Token', web_app: { url: WEBAPP_URL } }],
                [{ text: '🔙 Back to Menu', callback_data: 'menu' }]
              ]
            };

            await bot.sendMessage(chatId, galleryMessage, { 
              reply_markup: galleryKeyboard,
              parse_mode: 'HTML'
            });
          } catch (error) {
            await bot.sendMessage(chatId, '❌ Error loading gallery. Please try again.');
          }
          break;

        case 'stats':
          try {
            const allTokens = await storage.getAllTokens();
            const totalTokens = allTokens.length;
            const totalVotes = allTokens.reduce((sum, token) => sum + (token.votes || 0), 0);
            const topToken = allTokens.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];

            const statsMessage = `📊 <b>DrawYourMeme Stats</b>\n\n` +
              `🚀 Total Tokens Launched: ${totalTokens}\n` +
              `💎 Total Votes: ${totalVotes}\n` +
              `👑 Top Token: ${topToken ? `${topToken.name} (${topToken.votes || 0} votes)` : 'None yet'}\n\n` +
              `Join the meme revolution! 🎨`;

            const statsKeyboard = {
              inline_keyboard: [
                [{ text: '🎮 Launch Your Token', web_app: { url: WEBAPP_URL } }],
                [{ text: '🔙 Back to Menu', callback_data: 'menu' }]
              ]
            };

            await bot.sendMessage(chatId, statsMessage, { 
              reply_markup: statsKeyboard,
              parse_mode: 'HTML'
            });
          } catch (error) {
            await bot.sendMessage(chatId, '❌ Error loading stats. Please try again.');
          }
          break;

        case 'help':
          const helpMessage = `❓ <b>How to Use DrawYourMeme</b>\n\n` +
            `1. 🎮 Click "Play DrawYourMeme" to open the app\n` +
            `2. 🎨 Draw your meme on the 500x500 canvas\n` +
            `3. 📝 Give it a name and ticker symbol\n` +
            `4. 🚀 Launch your token instantly on PumpFun\n` +
            `5. 📢 Share with friends and get votes!\n\n` +
            `💡 <b>Tips:</b>\n` +
            `• No wallet connection needed\n` +
            `• Tokens deploy automatically\n` +
            `• Each Solana address = 1 account\n` +
            `• Vote on others' tokens in gallery\n\n` +
            `Ready to create? 🎨`;

          const helpKeyboard = {
            inline_keyboard: [
              [{ text: '🎮 Start Creating', web_app: { url: WEBAPP_URL } }],
              [{ text: '🔙 Back to Menu', callback_data: 'menu' }]
            ]
          };

          await bot.sendMessage(chatId, helpMessage, { 
            reply_markup: helpKeyboard,
            parse_mode: 'HTML'
          });
          break;

        case 'menu':
          // Go back to main menu
          const menuMessage = `🎨 <b>DrawYourMeme Menu</b>\n\nChoose an option below:`;
          
          const menuKeyboard = {
            inline_keyboard: [
              [{ text: '🎮 Play DrawYourMeme', web_app: { url: WEBAPP_URL } }],
              [{ text: '💎 Buy $DRAWYOURMEME Token', url: DRAWYOURMEME_TOKEN_LINK }],
              [
                { text: '🖼️ Gallery', callback_data: 'gallery' },
                { text: '📊 Stats', callback_data: 'stats' }
              ],
              [
                { text: '❓ Help', callback_data: 'help' },
                { text: '📢 Channel', url: 'https://t.me/drawyourmeme' }
              ]
            ]
          };

          await bot.sendMessage(chatId, menuMessage, { 
            reply_markup: menuKeyboard,
            parse_mode: 'HTML'
          });
          break;

        default:
          await bot.sendMessage(chatId, '❌ Unknown action. Please try again.');
      }
    } catch (error) {
      console.error('Error handling callback query:', error);
      await bot.sendMessage(chatId, '❌ Something went wrong. Please try again.');
    }
  });

  // Handle any text message (fallback)
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    
    // Skip if it's a command we already handle
    if (msg.text?.startsWith('/')) return;

    const fallbackMessage = `🎨 Welcome to DrawYourMeme!\n\nUse the menu below or type /start to begin:`;
    
    const fallbackKeyboard = {
      inline_keyboard: [
        [{ text: '🎮 Play DrawYourMeme', web_app: { url: WEBAPP_URL } }],
        [{ text: '/start - Show Main Menu', callback_data: 'menu' }]
      ]
    };

    await bot.sendMessage(chatId, fallbackMessage, { 
      reply_markup: fallbackKeyboard 
    });
  });

  console.log('Telegram bot setup complete!');
}

// Function to send notifications (can be called from API routes)
export async function sendTokenLaunchNotification(tokenData: any) {
  try {
    // This could be sent to a channel or specific users
    // For now, we'll skip this but it's ready for implementation
    console.log('Token launch notification:', tokenData);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export { bot };
import Message from '../models/Message.js';
import mongoose from 'mongoose';

export const getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    
    if (!user1 || !user2) {
      return res.status(400).json({ message: 'Both user IDs are required' });
    }

    console.log(`Getting messages between ${user1} and ${user2}`);
    
    // Make sure IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user1ObjectId = new mongoose.Types.ObjectId(user1);
    const user2ObjectId = new mongoose.Types.ObjectId(user2);

    // Get messages between users
    const messages = await Message.find({
      $or: [
        { sender: user1ObjectId, receiver: user2ObjectId },
        { sender: user2ObjectId, receiver: user1ObjectId }
      ]
    }).sort({ createdAt: 1 });

    console.log(`Found ${messages.length} messages`);

    // Format messages for the client
    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      senderId: msg.sender.toString(),
      receiverId: msg.receiver.toString(),
      content: msg.content,
      createdAt: msg.createdAt
    }));
    
    res.json(formattedMessages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    
    console.log("Received message data:", { senderId, receiverId, content });
    
    // Validate input
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        received: { senderId, receiverId, content } 
      });
    }
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ 
        message: 'Invalid ID format', 
        received: { senderId, receiverId }
      });
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    // Create and save the message
    const message = new Message({
      sender: senderObjectId,
      receiver: receiverObjectId,
      content: content.trim()
    });
    
    await message.save();
    console.log(`Message saved with ID: ${message._id}`);

    // Send formatted response
    res.status(201).json({
      _id: message._id,
      senderId: senderId,
      receiverId: receiverId,
      content: message.content,
      createdAt: message.createdAt
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

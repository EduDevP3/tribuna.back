import { Client } from '../models/clientModel.js';

/**
 * Creates a new client.
 * @param {object} clientData - The data for the new client.
 * @returns {Promise<object>} The newly created client document.
 */
export const createClientService = async (clientData) => {
  try {
    const newClient = new Client(clientData);
    await newClient.save();
    return newClient;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('A client with this email already exists.');
    }
    throw error;
  }
};

/**
 * Retrieves all clients from the database.
 * @returns {Promise<Array<object>>} A list of all clients.
 */
export const getAllClientsService = async (page, limit) => {
  try {
    const skip = (page - 1) * limit;
    const clients = await Client.find({})
      .sort({ lastName: 1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true });
    const total = await Client.countDocuments({});
    return { clients, total };
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a single client by its ID.
 * @param {string} id - The ID of the client to retrieve.
 * @returns {Promise<object|null>} The client document or null if not found.
 */
export const getClientByIdService = async (id) => {
  try {
    const client = await Client.findById(id).lean({ virtuals: true });
    return client;
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return null;
    }
    throw error;
  }
};

/**
 * Updates an existing client.
 * @param {string} id - The ID of the client to update.
 * @param {object} updateData - The data to update the client with.
 * @returns {Promise<object|null>} The updated client document or null if not found.
 */
export const updateClientService = async (id, updateData) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(id, updateData, { new: true });
    return updatedClient;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Another client with this email already exists.');
    }
    throw error;
  }
};

/**
 * Deletes a client by its ID.
 * @param {string} id - The ID of the client to delete.
 * @returns {Promise<object|null>} The deleted client document or null if not found.
 */
export const deleteClientService = async (id) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(id);
    return deletedClient;
  } catch (error) {
    throw error;
  }
};

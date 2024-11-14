const UserModel = require("./user-model.js");
const dotenv = require('dotenv');
dotenv.config();
const { connect } = require("mongoose");

const connectToDB = async () => {
  const mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;
  await connect(mongoDBUri, {
    serverSelectionTimeoutMS: 5000, // Adjust timeout if needed
  });

};

const createUser = async (username, email, password) => {
  return new UserModel({ username, email, password }).save();
};

const findUserByEmail = async (email) => {
  return UserModel.findOne({ email });
};

const findUserById = async (userId) => {
  return UserModel.findById(userId);
};

const findUserByUsername = async (username) => {
  return UserModel.findOne({ username });
};

const findUserByUsernameOrEmail = async (username, email) => {
  return UserModel.findOne({
    $or: [
      { username }, 
      { email },
    ],
  });
};

const findAllUsers = async () => {
  return UserModel.find();
};

const updateUserById = async (userId, username, email, password) => {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        password,
      },
    },
    { new: true } // return the updated user
  );
};

const updateUserPrivilegeById = async (userId, isAdmin) => {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true } // return the updated user
  );
};

const deleteUserById = async (userId) => {
  return UserModel.findByIdAndDelete(userId);
};

const addNewSession = async (userId, sessionData) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId, // Ensure userId is treated as ObjectId
      { $push: { sessionHistory: sessionData } }, // Add sessionData to sessionHistory array
      { new: true } // Return the updated document
    );
    return updatedUser;
  } catch (error) {
    console.error("Error in addNewSession:", error);
    throw error;
  }
};

const updateSessionHistory = async (userId, roomId, sessionData) => {
  try {

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId, "sessionHistory.roomId": roomId }, // Locate user and specific session by roomId
      { 
        $set: {
          "sessionHistory.$.codeLanguage": sessionData.codeLangauge, // Update code language
          "sessionHistory.$.code": sessionData.code, // Update code data
        } 
      },
      { new: true } // Return the updated document
    );
    return updatedUser;
  } catch (error) {
    console.error("Error in updateSessionHistory:", error);
    throw error;
  }
};

module.exports = {
  connectToDB,
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  findUserByUsernameOrEmail,
  findAllUsers,
  updateUserById,
  updateUserPrivilegeById,
  deleteUserById,
  addNewSession,
  updateSessionHistory
};

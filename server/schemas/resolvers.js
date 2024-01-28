const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      throw new AuthenticationError('You are not authenticated.');
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user || !user.isCorrectPassword(password)) {
        throw new AuthenticationError('Incorrect email or password');
      }

      const token = signToken(user);
      return { token, user };
    },

    addUser: async (parent, args ) => {
      const user = await User.create( args );
      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { book }, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: {savedBooks: book} },
                { new: true }
            )
            return updatedUser;
        }
        throw new AuthenticationError('You need to be logged in!')
    },
    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            )
            return updatedUser;
        }
    }
}
};

module.exports = resolvers;
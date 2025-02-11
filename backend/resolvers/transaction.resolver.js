import Transaction from "../models/transaction.model.js";

const transactionResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");
        const userId = await context.getUser()._id;

        const transactions = await Transaction.find({ userId });
        return transactions;
      } catch (err) {
        console.error("Error getting transactions:", err);
        throw new Error("Error getting transactions");
      }
    },
    transaction: async (_, { transactionId }) => {
      try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
          throw new Error("not found transaction");
        }
        return transaction;
      } catch (err) {
        console.error("Error getting transaction:", err);
        throw new Error("Error getting transaction");
      }
    },
  },
  Mutation: {
    //
    createTransaction: async (_, { input }, context) => {
      try {
        console.log("1");
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });
        console.log("2");
        console.log("newTransaction", newTransaction);
        await newTransaction.save();
        console.log("3");
        return newTransaction;
      } catch (err) {
        console.error("Error creating transaction:", err);
        throw new Error("Error crea");
      }
    },
    //
    updateTransaction: async (_, { input }) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          input,
          { new: true }
        );
        return updatedTransaction;
      } catch (err) {
        cosole.error("Error updating transaction:", err);
        throw new Error("Error updating transaction");
      }
    },
    //
    deleteTransaction: async (_, { transactionId }) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deletedTransaction;
      } catch (err) {
        console.error("Error on deleting transaction:", err);
        throw new Error("Error deleting transaction");
      }
    },
  },
};

export default transactionResolver;

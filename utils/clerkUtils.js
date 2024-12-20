import { createClerkClient } from '@clerk/backend';

// Initialize Clerk Client
const clerkClient = createClerkClient({
  apiKey: process.env.CLERK_API_KEY,  // Use your Clerk API Key
});

const getUserSubscriptions = async (userId) => {
  try {
    // Fetch user data from Clerk using the clerkUserId
    const clerkUser = await clerkClient.users.getUser(userId);

    // Get subscriptions from the user's publicMetadata
    const subscriptions = clerkUser.publicMetadata?.subscriptions || [];

    // Return the subscriptions or an empty array if none found
    return subscriptions;
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw new Error('Error fetching user subscriptions');
  }
};

export default getUserSubscriptions;

import User from '../models/user.model.js';

// Get users filtered by role (e.g. role=teacher or role=guardian) - Admin only
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password').sort({ name: 1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

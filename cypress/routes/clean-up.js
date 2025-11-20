// // routes/test.js or routes/cleanup.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Domain = require('../models/Domain');
// const Company = require('../models/Company');

// // POST /api/test/cleanup
// router.post('/cleanup', async (req, res) => {
//   // Security: Only allow in test/dev environments
//   if (process.env.NODE_ENV === 'production') {
//     return res.status(403).json({ 
//       error: 'Cleanup endpoint not available in production' 
//     });
//   }

//   const { email, domain, companyName } = req.body;
//   const results = {
//     email,
//     domain,
//     companyName,
//     deletedRecords: []
//   };

//   try {
//     // Delete user by email
//     if (email) {
//       const userResult = await User.deleteMany({ email });
//       results.deletedRecords.push({
//         type: 'user',
//         count: userResult.deletedCount
//       });
//     }

//     // Delete domain
//     if (domain) {
//       const domainResult = await Domain.deleteMany({ domain });
//       results.deletedRecords.push({
//         type: 'domain',
//         count: domainResult.deletedCount
//       });
//     }

//     // Delete company
//     if (companyName) {
//       const companyResult = await Company.deleteMany({ name: companyName });
//       results.deletedRecords.push({
//         type: 'company',
//         count: companyResult.deletedCount
//       });
//     }

//     // Delete related records (payments, subscriptions, etc.)
//     if (email) {
//       await Payment.deleteMany({ userEmail: email });
//       await Subscription.deleteMany({ userEmail: email });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Cleanup completed',
//       ...results
//     });

//   } catch (error) {
//     console.error('Cleanup error:', error);
//     res.status(500).json({ 
//       success: false,
//       error: error.message 
//     });
//   }
// });

// module.exports = router;
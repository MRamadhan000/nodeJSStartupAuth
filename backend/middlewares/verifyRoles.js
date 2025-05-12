// middlewares/verifyRoles.js
const ROLES_LIST = require("../config/rolesList.js"); 

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if the user roles are available in the decoded token
    if (!req?.user?.roles) {
      return res.status(401).json({ message: "Access denied. No roles assigned." });
    }

    // Check if any of the user roles match the allowed roles
    const rolesArray = allowedRoles.map(role => ROLES_LIST[role]);
    const result = req.user.roles.some(role => rolesArray.includes(role));

    // If no matching role is found, deny access
    if (!result) {
      return res.status(403).json({ message: "Forbidden: You don't have the required role." });
    }

    // If user has one of the allowed roles, continue to the next middleware
    next();
  };
};

module.exports = verifyRoles;
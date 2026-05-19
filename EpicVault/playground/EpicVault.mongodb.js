use('EpicVault');

db.users.insertMany([{
    "username": "MarcosDJ",
    "email": "marcos.martin@epicvault.com",
    "password_hash": "$2b$10$hashedpasswordEXAMPLE123...",
    "verified": true,
    "avatar_url": "https://assets.epicvault.com/avatars/marcos.png",
    "global_roles": ["USER", "ADMIN"],
    "created_at": new Date("2025-01-15T10:00:00Z"),
    "last_login": new Date()
},
{
    "username": "ElenaPlayer",
    "email": "elena.rogue@gmail.com",
    "password_hash": "$2b$10$hashedpasswordEXAMPLE456...",
    "verified": true,
    "avatar_url": "https://assets.epicvault.com/avatars/elena.png",
    "global_roles": ["USER"],
    "created_at": new Date("2025-02-10T14:30:00Z"),
    "last_login": new Date()
}
]);
import userModel from "../models/User.js";
import bcryptjs from 'bcryptjs';

export const createSuperAdmin = async () => {
    console.log('createSuperAdmin is called');
    try {
        const existingAdmin = await userModel.findOne({ role: 'superAdmin' });
        
        if (!existingAdmin) {
            const adminEmail = process.env.SUPER_ADMIN_EMAIL;
            const adminPassword = process.env.SUPER_ADMIN_PASSWORD;
            const adminName = process.env.SUPER_ADMIN_NAME;

            console.log(adminEmail,adminPassword,adminName);
            if (!adminEmail || !adminPassword) {
                console.warn("⚠️ Skipping Super-Admin creation: Missing environment variables.");
                return;
            }

            const hashedPassword = await bcryptjs.hash(adminPassword, 12);

            const newSuperAdmin = await userModel.create({
                username: adminName.toLowerCase(),
                email: adminEmail.toLowerCase(),
                password: hashedPassword, 
                role: 'superAdmin',
                isVerified: true
            });

            console.log("✅ Super-Admin created successfully:", newSuperAdmin.email);
        } else {
            
        }
    } catch (error) {   
        console.error("❌ Error in createSuperAdmin seeding:", error.message);
    }
}
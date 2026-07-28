import userModel from "../models/User.js";

export const createSuperAdmin = async () => {
    console.log('createSuperAdmin is called');
    try {
        const adminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
        const adminName = process.env.SUPER_ADMIN_NAME;

        if (!adminEmail) {
            console.warn("⚠️ Skipping Super-Admin creation: Missing SUPER_ADMIN_EMAIL in environment variables.");
            return;
        }

        const existingAdmin = await userModel.findOne({ email: adminEmail });
        
        if (!existingAdmin) {
            const newSuperAdmin = await userModel.create({
                username: adminName ? adminName.toLowerCase() : 'superadmin',
                email: adminEmail,
                role: 'superAdmin',
                isVerified: true 
            });

            console.log("✅ Super-Admin created successfully:", newSuperAdmin.email);
        } else {
            if (existingAdmin.role !== 'superAdmin') {
                existingAdmin.role = 'superAdmin';
                await existingAdmin.save();
                console.log(`🔄 Upgraded existing user ${adminEmail} to superAdmin.`);
            }
        }
    } catch (error) {   
        console.error("❌ Error in createSuperAdmin seeding:", error.message);
    }
}

'use server';

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const inviteUserSchema = z.object({
    email: z.string().email(),
    shop_id: z.string().uuid(),
});

export async function inviteUser(input: { email: string; shop_id: string }) {
    try {
        const { email, shop_id } = inviteUserSchema.parse(input);

        // Ensure you use the service role key for admin actions
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Invite the user by email.
        // Supabase will use the Site URL from your project's auth settings
        // to construct the magic link.
        const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}`, // Redirect to root, not /login
            data: { shop_id: shop_id, password_set: false }, // Mark password as not set
        });

        if (inviteError) {
            throw new Error(`Failed to invite user: ${inviteError.message}`);
        }
        
        if (!data.user) {
            throw new Error("Invitation sent, but no user object was returned.");
        }

        // Add the invited user to the shop_members table
        const { error: insertError } = await supabaseAdmin
            .from('shop_members')
            .insert({ shop_id: shop_id, user_id: data.user.id });

        if (insertError) {
            // Optional: If this fails, you might want to delete the invited user
            // to allow for a clean retry.
            await supabaseAdmin.auth.admin.deleteUser(data.user.id);
            throw new Error(`Failed to add user to shop: ${insertError.message}`);
        }

        return { success: true, message: 'Invitation sent successfully.' };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

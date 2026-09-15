import { db } from './index.ts';
import { users, activityLogs, userNotebooks } from './schema.ts';
import { eq, ilike, or, and, desc, asc, inArray } from 'drizzle-orm';

export interface UserFilterOptions {
  search?: string;
  role?: string;
  status?: string;
  sortBy?: 'name' | 'email' | 'role' | 'status' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export async function getUsers(options: UserFilterOptions = {}) {
  try {
    const { search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const conditions = [];

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push(or(ilike(users.name, q), ilike(users.email, q)));
    }

    if (role && role !== 'all') {
      conditions.push(eq(users.role, role));
    }

    if (status && status !== 'all') {
      conditions.push(eq(users.status, status));
    }

    let sortColumn: any = users.createdAt;
    if (sortBy === 'name') sortColumn = users.name;
    if (sortBy === 'email') sortColumn = users.email;
    if (sortBy === 'role') sortColumn = users.role;
    if (sortBy === 'status') sortColumn = users.status;
    if (sortBy === 'lastLogin') sortColumn = users.lastLogin;

    const orderFn = sortOrder === 'asc' ? asc : desc;

    if (conditions.length > 0) {
      return await db
        .select()
        .from(users)
        .where(and(...conditions))
        .orderBy(orderFn(sortColumn));
    }

    return await db
      .select()
      .from(users)
      .orderBy(orderFn(sortColumn));
  } catch (error) {
    console.error('Failed to query users from Cloud SQL:', error);
    throw new Error('Database query for users failed.', { cause: error });
  }
}

export async function getUserWithActivity(id: number) {
  try {
    const userRecords = await db.select().from(users).where(eq(users.id, id));
    if (!userRecords.length) return null;

    const user = userRecords[0];
    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, id))
      .orderBy(desc(activityLogs.createdAt))
      .limit(50);

    return {
      ...user,
      activityLogs: logs
    };
  } catch (error) {
    console.error(`Failed to query user profile with activity for ID ${id}:`, error);
    throw new Error('Failed to retrieve user profile and activity log.', { cause: error });
  }
}

export async function getOrCreateUser(
  uid: string, 
  email: string, 
  name: string = 'Researcher', 
  avatarUrl?: string
) {
  try {
    // Admin check: designated admin email
    const isAdmin = email.toLowerCase() === 'sobratdayal2008@gmail.com' || email.includes('admin');
    const assignedRole = isAdmin ? 'admin' : 'member';

    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        role: assignedRole,
        status: 'active',
        subscriptionTier: isAdmin ? 'Enterprise' : 'Pro',
        lastLogin: new Date(),
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          lastLogin: new Date(),
          name,
          avatarUrl: avatarUrl || undefined,
        },
      })
      .returning();

    // Log login activity
    if (result.length > 0) {
      await db.insert(activityLogs).values({
        userId: result[0].id,
        action: 'LOGIN',
        details: 'User logged in to Gemini Notebook platform',
      });
    }

    return result[0];
  } catch (error) {
    console.error('Failed to upsert user in database:', error);
    throw new Error('User synchronization failed.', { cause: error });
  }
}

export async function updateUser(
  id: number, 
  updates: Partial<{
    name: string;
    role: string;
    status: string;
    subscriptionTier: string;
  }>
) {
  try {
    const updated = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();

    if (updated.length > 0) {
      await db.insert(activityLogs).values({
        userId: id,
        action: 'PROFILE_UPDATED',
        details: `Updated attributes: ${Object.keys(updates).join(', ')}`,
      });
    }

    return updated[0];
  } catch (error) {
    console.error(`Failed to update user ${id}:`, error);
    throw new Error('User update failed.', { cause: error });
  }
}

export async function bulkUpdateStatus(ids: number[], newStatus: 'active' | 'suspended' | 'deleted') {
  try {
    if (!ids.length) return [];

    const updated = await db
      .update(users)
      .set({ status: newStatus })
      .where(inArray(users.id, ids))
      .returning();

    // Log for each user
    for (const u of updated) {
      await db.insert(activityLogs).values({
        userId: u.id,
        action: `STATUS_${newStatus.toUpperCase()}`,
        details: `Bulk status update to ${newStatus}`,
      });
    }

    return updated;
  } catch (error) {
    console.error('Failed to bulk update user statuses:', error);
    throw new Error('Bulk update failed.', { cause: error });
  }
}

export async function addActivityLog(userId: number, action: string, details?: string, ipAddress?: string) {
  try {
    return await db.insert(activityLogs).values({
      userId,
      action,
      details,
      ipAddress,
    }).returning();
  } catch (error) {
    console.warn('Failed to insert activity log:', error);
  }
}

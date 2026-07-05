# 1. Title
SpotUs Data Deletion Policy

# 2. Purpose
To define the data lifecycle within SpotUs, specifically focusing on the automatic deletion of temporary chat rooms and how user data is purged from our systems (Firebase Firestore and Cloudinary).

# 3. Full Document

**Effective Date:** [Effective Date]

Because SpotUs is designed for temporary, spontaneous local interactions, our data architecture is built around minimizing data retention.

### 1. Temporary Chat Rooms
All chat rooms created on SpotUs are temporary by design. 
- When a room reaches its expiration limit, the room and all of its associated contents (text messages and image metadata in Firebase Firestore) are automatically deleted from active user access.
- Images uploaded to the room (stored in Cloudinary) are scheduled for deletion simultaneously with the room's expiration.

### 2. Backup and Residual Data
While data is deleted from active systems immediately upon room expiration, it may remain in our encrypted secure backups for up to 30 days. This backup data is strictly used for disaster recovery or to comply with valid legal requests (e.g., a law enforcement warrant regarding a serious crime). After 30 days, it is permanently overwritten.

### 3. User Deletion Requests
Users have the right under GDPR and CCPA to request the deletion of all their personal data. To do so, please refer to the Account Deletion Policy. When an account is deleted, all associated identifying data is purged from our database (Clerk and Firebase).

### 4. Exceptions to Deletion
We may retain certain data longer than specified if required to comply with legal obligations, resolve disputes, or enforce our agreements (such as retaining the email address of a banned user to prevent them from creating a new account).

---

# 4. Website Version (`/data-deletion`)
*(The Website Version is identical to the Full Document above.)*

---

# 5. In-App Summary (For Settings > Privacy > Data Deletion)
**How Long We Keep Your Data:**
- **Rooms & Chats:** Deleted immediately when the room expires.
- **Images:** Purged from our servers when the room expires.
- **Backups:** Deleted data may stay in our secure disaster-recovery backups for up to 30 days before being fully overwritten.
- **Exceptions:** We only keep data if required by law or to enforce a permanent ban.

---

# 6. Information to Customize Later
- `[Effective Date]`

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data
  console.log('🧹 Cleaning up existing data...')
  await prisma.report.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.vote.deleteMany()
  await prisma.threadTag.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.post.deleteMany()
  await prisma.thread.deleteMany()
  await prisma.factionMember.deleteMany()
  await prisma.faction.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()

  // Create demo users with different roles
  console.log('👥 Creating demo users...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@jgrp.com',
      name: 'Server Admin',
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
      profile: {
        create: {
          bio: 'Server administrator and forum owner.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          signature: 'Forum Admin - JGRP Roleplay',
          location: 'Los Santos',
          discord: 'admin#1234',
          playerName: 'Admin_Character',
          playerLevel: 10,
          playerMoney: "1000000",
          reputation: 1000,
        },
      },
    },
  })

  const moderatorUser = await prisma.user.create({
    data: {
      email: 'moderator@jgrp.com',
      name: 'John Moderator',
      role: 'MODERATOR',
      isActive: true,
      emailVerified: new Date(),
      profile: {
        create: {
          bio: 'Experienced moderator helping keep the community clean.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=moderator',
          signature: 'Moderator - Keeping peace since 2024',
          location: 'San Fierro',
          discord: 'moderator#5678',
          playerName: 'John_Moderator',
          playerLevel: 8,
          playerMoney: "500000",
          reputation: 750,
        },
      },
    },
  })

  const regularUser1 = await prisma.user.create({
    data: {
      email: 'player1@jgrp.com',
      name: 'Mike Johnson',
      role: 'USER',
      isActive: true,
      emailVerified: new Date(),
      profile: {
        create: {
          bio: 'Long-time player and active community member.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1',
          signature: 'Vice Leader of Grove Street',
          location: 'Ganton',
          discord: 'mikej#9012',
          steam: 'mikej_steam',
          playerName: 'Mike_Johnson',
          playerLevel: 5,
          playerMoney: "25000",
          reputation: 150,
        },
      },
    },
  })

  const regularUser2 = await prisma.user.create({
    data: {
      email: 'player2@jgrp.com',
      name: 'Sarah Davis',
      role: 'USER',
      isActive: true,
      emailVerified: new Date(),
      profile: {
        create: {
          bio: 'Roleplay enthusiast and faction leader.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2',
          signature: 'CEO of Davis Logistics',
          location: 'Downtown',
          discord: 'sarahd#3456',
          website: 'https://davis-logistics.example.com',
          playerName: 'Sarah_Davis',
          playerLevel: 7,
          playerMoney: "150000",
          reputation: 300,
        },
      },
    },
  })

  // Create factions
  console.log('🏢 Creating factions...')
  const lspdFaction = await prisma.faction.create({
    data: {
      name: 'Los Santos Police Department',
      description: 'The primary law enforcement agency in Los Santos.',
      type: 'POLICE',
      color: '#0066cc',
      logo: 'https://via.placeholder.com/100x100/0066cc/ffffff?text=LSPD',
    },
  })

  const lsnFaction = await prisma.faction.create({
    data: {
      name: 'Los Santos Medical',
      description: 'Emergency medical services for the city of Los Santos.',
      type: 'MEDICAL',
      color: '#ff4444',
      logo: 'https://via.placeholder.com/100x100/ff4444/ffffff?text=LSM',
    },
  })

  const groveFaction = await prisma.faction.create({
    data: {
      name: 'Grove Street Families',
      description: 'A community-focused street gang operating in Ganton.',
      type: 'GANG',
      color: '#00aa00',
      logo: 'https://via.placeholder.com/100x100/00aa00/ffffff?text=GSF',
    },
  })

  // Add faction members
  await prisma.factionMember.createMany({
    data: [
      { factionId: lspdFaction.id, userId: moderatorUser.id, rank: 'Chief' },
      { factionId: lsnFaction.id, userId: regularUser2.id, rank: 'Doctor' },
      { factionId: groveFaction.id, userId: regularUser1.id, rank: 'Leader' },
    ],
  })

  // Create categories
  console.log('📂 Creating forum categories...')
  const announcementsCategory = await prisma.category.create({
    data: {
      name: '📢 Announcements',
      description: 'Official server announcements and updates',
      slug: 'announcements',
      color: '#dc2626',
      icon: '📢',
      position: 0,
    },
  })

  const serverUpdatesCategory = await prisma.category.create({
    data: {
      name: '🔄 Server Updates',
      description: 'Patch notes, maintenance notices, and feature updates',
      slug: 'server-updates',
      color: '#ea580c',
      icon: '🔄',
      position: 1,
    },
  })

  const factionDiscussionCategory = await prisma.category.create({
    data: {
      name: '🏛️ Faction Discussion',
      description: 'Discussion about factions, recruitment, and faction activities',
      slug: 'faction-discussion',
      color: '#7c3aed',
      icon: '🏛️',
      position: 2,
    },
  })

  const generalCategory = await prisma.category.create({
    data: {
      name: '💬 General Discussion',
      description: 'General chat and community discussions',
      slug: 'general-discussion',
      color: '#0891b2',
      icon: '💬',
      position: 3,
    },
  })

  const marketplaceCategory = await prisma.category.create({
    data: {
      name: '🛒 Marketplace',
      description: 'Buy, sell, and trade in-game items and services',
      slug: 'marketplace',
      color: '#16a34a',
      icon: '🛒',
      position: 4,
    },
  })

  const supportCategory = await prisma.category.create({
    data: {
      name: '❓ Support & Help',
      description: 'Get help with server issues, bugs, and questions',
      slug: 'support-help',
      color: '#ca8a04',
      icon: '❓',
      position: 5,
    },
  })

  // Create tags
  console.log('🏷️ Creating tags...')
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Important', color: '#dc2626' } }),
    prisma.tag.create({ data: { name: 'Update', color: '#ea580c' } }),
    prisma.tag.create({ data: { name: 'Recruitment', color: '#7c3aed' } }),
    prisma.tag.create({ data: { name: 'Event', color: '#16a34a' } }),
    prisma.tag.create({ data: { name: 'Guide', color: '#0891b2' } }),
    prisma.tag.create({ data: { name: 'Discussion', color: '#6b7280' } }),
    prisma.tag.create({ data: { name: 'Selling', color: '#16a34a' } }),
    prisma.tag.create({ data: { name: 'Buying', color: '#3b82f6' } }),
  ])

  // Create threads
  console.log('🧵 Creating threads...')
  const welcomeThread = await prisma.thread.create({
    data: {
      title: '🎉 Welcome to JGRP Roleplay Forum!',
      slug: 'welcome-to-jgrp-roleplay-forum',
      content: `# Welcome to JGRP Roleplay Forum!

We're excited to launch our new community forum for the JGRP SA:MP Roleplay server!

## 🎮 About JGRP
JGRP (Jogjagamers Roleplay) is a premier SA:MP roleplay server focused on creating an immersive and realistic roleplaying experience.

## 📋 Forum Rules
1. **Respect all players** - No toxic behavior, harassment, or discrimination
2. **Stay on topic** - Keep discussions relevant to the category
3. **No spam** - Avoid posting duplicate or low-quality content
4. **Follow server rules** - Forum behavior reflects on your in-game reputation
5. **English only** - Maintain English for better community communication

## 🚀 Getting Started
- [Create your character](#) - Learn about character creation
- [Join a faction](#) - Find the right faction for your playstyle
- [Read the rules](#) - Understand server and forum guidelines
- [Introduce yourself](#) - Meet other community members

## 📞 Need Help?
If you need assistance, don't hesitate to:
- Post in the **Support & Help** section
- Contact our moderators
- Join our Discord server

Welcome aboard, and we look forward to roleplaying with you! 🎮✨`,
      categoryId: announcementsCategory.id,
      authorId: adminUser.id,
      isPinned: true,
    },
  })

  const patchNotesThread = await prisma.thread.create({
    data: {
      title: '🔧 v2.5.0 - Major Update: New Faction System',
      slug: 'v250-major-update-new-faction-system',
      content: `# Patch Notes v2.5.0 - Major Update

## 🎯 New Features
### Enhanced Faction System
- **New faction management panel** for leaders
- **Faction banks** with deposit/withdraw functionality
- **Faction ranks** with customizable permissions
- **Faction vehicles** with assigned access
- **Faction bases** with secure areas

### Quality of Life Improvements
- **Improved inventory system** with stacking support
- **New animations** for various activities
- **Enhanced GPS** with custom waypoints
- **Better phone interface** with contacts app

## 🐛 Bug Fixes
- Fixed vehicle despawning issues
- Resolved player synchronization problems
- Fixed faction invite system bugs
- Corrected housing system glitches

## 🔄 Balance Changes
- Adjusted economy rates for better balance
- Modified weapon prices
- Updated job payouts
- Rebalanced faction permissions

## 📅 Upcoming Features
- Custom vehicle tuning system
- Business ownership mechanics
- Advanced crafting system
- Seasonal events system

Update will be deployed on **Saturday, November 15th at 2:00 AM UTC** with approximately 2 hours of maintenance time.

Thank you for your continued support! 🙏`,
      categoryId: serverUpdatesCategory.id,
      authorId: adminUser.id,
      isPinned: true,
    },
  })

  const recruitmentThread = await prisma.thread.create({
    data: {
      title: '🚔 LSPD - Now Recruiting Officers',
      slug: 'lspd-now-recruiting-officers',
      content: `# Los Santos Police Department - Recruitment Open

## 🚔 About LSPD
The Los Santos Police Department is seeking dedicated officers to join our elite team and help maintain law and order in Los Santos.

## 📋 Requirements
- **Age**: 18+ (IRL)
- **Experience**: Previous roleplay experience preferred
- **Activity**: Minimum 10 hours per week
- **English**: Fluent communication skills
- **Clean record**: No recent bans or warnings

## 🏆 Benefits
- **Competitive salary**: $5,000/week base + bonuses
- **Equipment**: Standard issue police gear
- **Vehicle**: Access to police vehicles
- **Training**: Comprehensive police academy program
- **Career advancement**: Clear promotion path

## 📝 Application Process
1. **Submit application** below with:
   - Real name and age
   - Previous experience
   - Why you want to join LSPD
   - Available time schedule

2. **Interview** with recruitment officers
3. **Background check** and training
4. **Probation period** (2 weeks)

## 📞 Questions?
Contact Chief Johnson (moderator@jgrp.com) or visit us at the LSPD headquarters.

**Application Deadline**: November 30th, 2024

Apply now and serve the city of Los Santos! 🌟`,
      categoryId: factionDiscussionCategory.id,
      authorId: moderatorUser.id,
    },
  })

  const generalDiscussionThread = await prisma.thread.create({
    data: {
      title: '💭 What brings you to JGRP?',
      slug: 'what-brings-you-to-jgrp',
      content: `Hey everyone!

I thought it would be great to get to know our community better. Tell us about yourself!

## 📝 Introduce yourself:
- Your name and where you're from
- How long you've been playing SA:MP
- What type of roleplay you enjoy
- Your favorite faction or job
- What you're looking forward to in JGRP

I'll start:
I'm Mike from California, been playing SA:MP for about 3 years now. I love gang roleplay and I'm really excited about the new faction system. Looking forward to meeting all of you! 🎮

What about you? Share your story below! 👇`,
      categoryId: generalCategory.id,
      authorId: regularUser1.id,
    },
  })

  const marketplaceThread = await prisma.thread.create({
    data: {
      title: '🚗 [Selling] Sultan RS - Modified & Rare',
      slug: 'selling-sultan-rs-modified-rare',
      content: `# 🚗 Sultan RS - Modified Vehicle for Sale

## 📋 Vehicle Details
- **Model**: Sultan RS (Rare)
- **Year**: 2024
- **Mileage**: 1,250 km
- **Condition**: Excellent
- **Color**: Midnight Blue with custom gold trim

## ⚡ Modifications
- **Engine**: Level 4 Turbo Kit
- **Transmission**: Race transmission
- **Suspension**: Sport suspension
- **Brakes**: Ceramic brakes
- **Body**: Custom body kit
- **Wheels**: Custom rims
- **Audio**: Premium sound system

## 💰 Price & Terms
- **Asking Price**: $85,000 (OBO)
- **Payment Methods**: Cash, Bank Transfer
- **Location**: Downtown Los Santos
- **Test Drives**: Available for serious buyers

## 📞 Contact
- **In-game**: Mike_Johnson
- **Discord**: mikej#9012
- **Hours**: Available 6 PM - 11 PM PST

## 📸 Additional Info
This is a rare Sultan RS with over $50,000 in professional modifications. Perfect for cruising or showing off. Well-maintained, garage-kept vehicle.

**Serious inquiries only please!**`,
      categoryId: marketplaceCategory.id,
      authorId: regularUser1.id,
    },
  })

  // Add tags to threads
  console.log('🏷️ Adding tags to threads...')
  await prisma.threadTag.createMany({
    data: [
      { threadId: welcomeThread.id, tagId: tags[0].id }, // Important
      { threadId: patchNotesThread.id, tagId: tags[1].id }, // Update
      { threadId: recruitmentThread.id, tagId: tags[2].id }, // Recruitment
      { threadId: generalDiscussionThread.id, tagId: tags[5].id }, // Discussion
      { threadId: marketplaceThread.id, tagId: tags[6].id }, // Selling
    ],
  })

  // Create posts (replies)
  console.log('💬 Creating posts...')
  const welcomePosts = await Promise.all([
    prisma.post.create({
      data: {
        content: `Welcome everyone! This forum looks amazing! 🎉

I've been waiting for a proper community hub for JGRP. The interface is clean and modern, much better than the old one.

Looking forward to meeting all of you in-game!`,
        threadId: welcomeThread.id,
        authorId: regularUser1.id,
        position: 1,
      },
    }),
    prisma.post.create({
      data: {
        content: `Great to see the forum live! The design is really professional and user-friendly.

For those who are new, don't hesitate to ask questions. We have a very helpful community here. 🤝

Also, make sure to join our Discord server for real-time chat and support!`,
        threadId: welcomeThread.id,
        authorId: moderatorUser.id,
        position: 2,
      },
    }),
    prisma.post.create({
      data: {
        content: `Welcome aboard everyone! 🎮

Special thanks to the admin team for making this happen. The features look comprehensive and the integration with the game server is exactly what we needed.

Quick tip: Make sure to complete your profile and link your in-game character for the best experience!`,
        threadId: welcomeThread.id,
        authorId: regularUser2.id,
        position: 3,
      },
    }),
  ])

  const patchNotesPosts = await Promise.all([
    prisma.post.create({
      data: {
        content: `The new faction system looks incredible! 💼

The faction banks and custom permissions are exactly what we needed. This will make faction management so much more organized.

Question: Will there be a way to transfer faction leadership if someone steps down?`,
        threadId: patchNotesThread.id,
        authorId: regularUser2.id,
        position: 1,
      },
    }),
    prisma.post.create({
      data: {
        content: `@Sarah Davis Great question! Yes, faction leadership transfer will be included in the final release. Faction leaders will be able to promote members to leadership positions or transfer ownership.

The system is designed to be flexible while maintaining security. All major changes will require multi-factor authentication through both the forum and in-game verification.`,
        threadId: patchNotesThread.id,
        authorId: adminUser.id,
        position: 2,
      },
    }),
  ])

  const recruitmentPosts = await Promise.all([
    prisma.post.create({
      data: {
        content: `This sounds like an amazing opportunity! 🚔

I've always wanted to try law enforcement roleplay. The training program sounds comprehensive.

Quick questions:
- Do we need to have previous police roleplay experience?
- What's the typical schedule like for patrol duties?
- Are there specialized units we can join later?

Thanks!`,
        threadId: recruitmentThread.id,
        authorId: regularUser1.id,
        position: 1,
      },
    }),
    prisma.post.create({
      data: {
        content: `@Mike Johnson Great questions!

1. **Previous experience**: Not required but preferred. We provide excellent training for newcomers.
2. **Schedule**: Flexible, but minimum 10 hours/week including weekends
3. **Specialized units**: Yes! After 3 months, you can apply for:
   - SWAT Team
   - Traffic Division
   - Detective Bureau
   - Air Support Division

Stop by the LSPD headquarters anytime for a tour and informal chat!`,
        threadId: recruitmentThread.id,
        authorId: moderatorUser.id,
        position: 2,
      },
    }),
  ])

  // Create votes
  console.log('🗳️ Creating votes...')
  await Promise.all([
    prisma.vote.create({
      data: {
        type: 'UP',
        postId: welcomePosts[0].id,
        userId: moderatorUser.id,
      },
    }),
    prisma.vote.create({
      data: {
        type: 'UP',
        postId: welcomePosts[0].id,
        userId: regularUser2.id,
      },
    }),
    prisma.vote.create({
      data: {
        type: 'UP',
        postId: patchNotesPosts[0].id,
        userId: adminUser.id,
      },
    }),
  ])

  // Create notifications
  console.log('🔔 Creating notifications...')
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'MENTION',
        title: 'You were mentioned in a post',
        message: 'Admin mentioned you in the patch notes thread.',
        userId: regularUser2.id,
        threadId: patchNotesThread.id,
        postId: patchNotesPosts[1].id,
        fromUserId: adminUser.id,
      },
    }),
    prisma.notification.create({
      data: {
        type: 'REPLY',
        title: 'New reply to your thread',
        message: 'Someone replied to your welcome thread.',
        userId: adminUser.id,
        threadId: welcomeThread.id,
        postId: welcomePosts[0].id,
        fromUserId: regularUser1.id,
      },
    }),
    prisma.notification.create({
      data: {
        type: 'MENTION',
        title: 'You were mentioned in a post',
        message: 'Moderator mentioned you in the recruitment thread.',
        userId: regularUser1.id,
        threadId: recruitmentThread.id,
        postId: recruitmentPosts[1].id,
        fromUserId: moderatorUser.id,
      },
    }),
  ])

  // Update user stats
  console.log('📊 Updating user statistics...')
  await Promise.all([
    prisma.profile.update({
      where: { userId: regularUser1.id },
      data: {
        totalPosts: 3,
        totalLikes: 2,
      },
    }),
    prisma.profile.update({
      where: { userId: regularUser2.id },
      data: {
        totalPosts: 2,
        totalLikes: 1,
      },
    }),
    prisma.profile.update({
      where: { userId: moderatorUser.id },
      data: {
        totalPosts: 2,
        totalLikes: 1,
      },
    }),
    prisma.profile.update({
      where: { userId: adminUser.id },
      data: {
        totalPosts: 1,
        totalLikes: 0,
      },
    }),
  ])

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Users: 4 (1 admin, 1 moderator, 2 regular)`)
  console.log(`- Factions: 3 (LSPD, Medical, Grove Street)`)
  console.log(`- Categories: 6 (Announcements, Updates, Factions, General, Marketplace, Support)`)
  console.log(`- Threads: 5`)
  console.log(`- Posts: 8`)
  console.log(`- Tags: 8`)
  console.log(`- Votes: 3`)
  console.log(`- Notifications: 3`)
  console.log('\n🎮 Demo accounts:')
  console.log(`- Admin: admin@jgrp.com`)
  console.log(`- Moderator: moderator@jgrp.com`)
  console.log(`- User 1: player1@jgrp.com`)
  console.log(`- User 2: player2@jgrp.com`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
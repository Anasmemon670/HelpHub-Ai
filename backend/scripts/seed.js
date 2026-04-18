/**
 * Optional seed — run: npm run seed
 * Requires MONGODB_URI and copies demo users/requests similar to the frontend offline seed.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const User = require('../src/models/User')
const HelpRequest = require('../src/models/HelpRequest')

const demoUsers = [
  { name: 'Ayesha Khan', email: 'ayesha@example.com', displayRole: 'Mentor', skills: ['Figma', 'Design'], trust: 92 },
  { name: 'Ahmed Malik', email: 'ahmed@example.com', displayRole: 'Professional', skills: ['Node.js', 'Backend'], trust: 88 },
  { name: 'Sara Noor', email: 'sara@example.com', displayRole: 'Student', skills: ['HTML/CSS', 'Frontend'], trust: 85 },
]

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Set MONGODB_URI in backend/.env')
    process.exit(1)
  }
  await mongoose.connect(uri)
  const pw = await bcrypt.hash('DemoSeed123!', 12)
  const ids = {}
  for (const d of demoUsers) {
    let u = await User.findOne({ email: d.email })
    if (!u) {
      u = await User.create({
        name: d.name,
        email: d.email,
        password: pw,
        role: 'both',
        displayRole: d.displayRole,
        skills: d.skills,
        trustScore: d.trust,
        badges: ['Seed'],
        contributions: 5,
        helpedCount: 3,
        solvedCount: 2,
      })
    }
    ids[d.email] = u._id
  }
  const count = await HelpRequest.countDocuments()
  if (count === 0) {
    await HelpRequest.create({
      title: 'Sample: Need help with responsive layout',
      description: 'Demo request created by seed script.',
      category: 'Web Development',
      tags: ['CSS', 'Responsive'],
      urgency: 'High',
      createdBy: ids['sara@example.com'],
      status: 'open',
    })
    console.log('Seeded one sample request.')
  }
  console.log('Seed done. Demo password for seeded emails: DemoSeed123!')
  await mongoose.disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

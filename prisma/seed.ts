import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.activityLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.jobAssignment.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.job.deleteMany()
  await prisma.user.deleteMany()

  // Create workers
  const worker1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      passwordHash: await hash('password123', 12),
      role: 'WORKER',
      bio: 'Full-stack developer with 5 years of experience in React, Node.js, and TypeScript.',
      skills: 'React,Node.js,TypeScript,Python,PostgreSQL',
      location: 'San Francisco, CA',
    },
  })

  const worker2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      passwordHash: await hash('password123', 12),
      role: 'WORKER',
      bio: 'UI/UX designer and frontend developer specializing in modern web applications.',
      skills: 'UI/UX,Figma,CSS,Tailwind,React',
      location: 'New York, NY',
    },
  })

  const worker3 = await prisma.user.create({
    data: {
      name: 'Carol Davis',
      email: 'carol@example.com',
      passwordHash: await hash('password123', 12),
      role: 'WORKER',
      bio: 'Backend engineer with expertise in scalable microservices and cloud infrastructure.',
      skills: 'Go,Docker,Kubernetes,AWS,PostgreSQL',
      location: 'Austin, TX',
    },
  })

  // Create job providers
  const provider1 = await prisma.user.create({
    data: {
      name: 'David Wilson',
      email: 'david@example.com',
      passwordHash: await hash('password123', 12),
      role: 'JOB_PROVIDER',
      bio: 'Startup founder looking for talented developers to build innovative products.',
      location: 'Los Angeles, CA',
    },
  })

  const provider2 = await prisma.user.create({
    data: {
      name: 'Eve Martinez',
      email: 'eve@example.com',
      passwordHash: await hash('password123', 12),
      role: 'JOB_PROVIDER',
      bio: 'Product manager at a growing SaaS company.',
      location: 'Chicago, IL',
    },
  })

  // Create jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Build E-commerce Platform',
      description: 'We need a full-stack developer to build a modern e-commerce platform with product listings, cart, checkout, and payment integration. The platform should be responsive and SEO-friendly. Experience with Next.js and Stripe is preferred.',
      budgetMin: 5000,
      budgetMax: 15000,
      deadline: new Date('2025-04-01'),
      skills: 'React,Node.js,TypeScript,Stripe',
      category: 'Web Development',
      createdById: provider1.id,
      status: 'PROPOSALS_RECEIVED',
    },
  })

  const job2 = await prisma.job.create({
    data: {
      title: 'Mobile App UI Design',
      description: 'Looking for a talented UI designer to create a modern, clean design for our fitness tracking mobile app. We need about 15-20 screens designed with a consistent design system. Deliverables include Figma files and a style guide.',
      budgetMin: 3000,
      budgetMax: 8000,
      deadline: new Date('2025-03-15'),
      skills: 'UI/UX,Figma,Mobile Design',
      category: 'Design',
      createdById: provider2.id,
      status: 'OPEN',
    },
  })

  const job3 = await prisma.job.create({
    data: {
      title: 'API Development for SaaS Platform',
      description: 'We need a backend developer to build RESTful APIs for our SaaS platform. The APIs should handle user management, billing, and data analytics. Must follow best practices for security and performance.',
      budgetMin: 8000,
      budgetMax: 20000,
      deadline: new Date('2025-05-01'),
      skills: 'Node.js,PostgreSQL,Docker,AWS',
      category: 'Backend Development',
      createdById: provider1.id,
      status: 'OPEN',
    },
  })

  const job4 = await prisma.job.create({
    data: {
      title: 'WordPress Plugin Development',
      description: 'Need a WordPress developer to create a custom plugin for managing online bookings. The plugin should integrate with popular payment gateways and support multi-language.',
      budgetMin: 2000,
      budgetMax: 5000,
      deadline: new Date('2025-03-20'),
      skills: 'WordPress,PHP,JavaScript',
      category: 'Web Development',
      createdById: provider2.id,
      status: 'PROPOSALS_RECEIVED',
    },
  })

  const job5 = await prisma.job.create({
    data: {
      title: 'Data Visualization Dashboard',
      description: 'Build an interactive dashboard that visualizes business metrics using charts and graphs. Should support real-time data updates and be exportable to PDF. Experience with D3.js or Recharts preferred.',
      budgetMin: 4000,
      budgetMax: 10000,
      deadline: new Date('2025-04-15'),
      skills: 'React,D3.js,TypeScript,Data Visualization',
      category: 'Data & Analytics',
      createdById: provider1.id,
      status: 'OPEN',
    },
  })

  // Create proposals
  await prisma.proposal.create({
    data: {
      jobId: job1.id,
      workerId: worker1.id,
      proposalText: 'I have extensive experience building e-commerce platforms with Next.js. I recently completed a similar project with Stripe integration. I can deliver a high-quality, responsive platform within 8 weeks.',
      expectedBudget: 12000,
      estimatedDuration: '8 weeks',
      status: 'SHORTLISTED',
    },
  })

  await prisma.proposal.create({
    data: {
      jobId: job1.id,
      workerId: worker2.id,
      proposalText: 'While I specialize in frontend, I have full-stack capabilities and can build your e-commerce platform with a strong focus on user experience and conversion optimization.',
      expectedBudget: 10000,
      estimatedDuration: '10 weeks',
      status: 'SUBMITTED',
    },
  })

  await prisma.proposal.create({
    data: {
      jobId: job2.id,
      workerId: worker2.id,
      proposalText: 'This is right up my alley! I have designed over 20 mobile apps with a focus on fitness and health tech. I can deliver a polished design system with all 20 screens.',
      expectedBudget: 6000,
      estimatedDuration: '4 weeks',
      status: 'SUBMITTED',
    },
  })

  await prisma.proposal.create({
    data: {
      jobId: job3.id,
      workerId: worker3.id,
      proposalText: 'I specialize in building scalable APIs with Node.js and have deep experience with AWS and Docker. I can implement secure, well-documented APIs following REST best practices.',
      expectedBudget: 16000,
      estimatedDuration: '12 weeks',
      status: 'SUBMITTED',
    },
  })

  await prisma.proposal.create({
    data: {
      jobId: job4.id,
      workerId: worker1.id,
      proposalText: 'I have experience with WordPress plugin development and can build a robust booking system with payment gateway integration and multi-language support.',
      expectedBudget: 4000,
      estimatedDuration: '5 weeks',
      status: 'SHORTLISTED',
    },
  })

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: provider1.id,
      type: 'PROPOSAL_RECEIVED',
      message: 'New proposal received for "Build E-commerce Platform"',
      entityId: job1.id,
    },
  })

  await prisma.notification.create({
    data: {
      userId: provider2.id,
      type: 'PROPOSAL_RECEIVED',
      message: 'New proposal received for "Mobile App UI Design"',
      entityId: job2.id,
    },
  })

  await prisma.notification.create({
    data: {
      userId: worker1.id,
      type: 'PROPOSAL_STATUS_CHANGED',
      message: 'Your proposal for "Build E-commerce Platform" has been shortlisted',
      entityId: job1.id,
    },
  })

  console.log('✅ Seed data created successfully!')
  console.log('Workers: alice@example.com, bob@example.com, carol@example.com (password: password123)')
  console.log('Providers: david@example.com, eve@example.com (password: password123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

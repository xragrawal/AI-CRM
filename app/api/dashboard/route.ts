import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const [
      dealsCount,
      contactsCount,
      organizationsCount,
      activeDeals,
      recentDeals,
      upcomingActions,
      recentActivity,
      allDeals,
    ] = await Promise.all([
      prisma.deal.count(),
      prisma.contact.count(),
      prisma.organization.count(),
      
      prisma.deal.findMany({
        where: {
          stage: {
            in: ['qualified', 'mou_signed', 'integration'],
          },
        },
        include: {
          organization: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
      }),
      
      prisma.deal.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          organization: true,
        },
        take: 5,
      }),
      
      prisma.deal.findMany({
        where: {
          nextStep: {
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          nextStep: true,
          updatedAt: true,
          organization: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 10,
      }),
      
      prisma.item.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          deal: {
            select: {
              name: true,
            },
          },
        },
        take: 10,
      }),

      prisma.deal.findMany({
        select: {
          productTags: true,
          stage: true,
        }
      })
    ])

    // Process stage distribution for charts
    const stageDistribution = await prisma.deal.groupBy({
      by: ['stage'],
      _count: true,
    })

    // Process product tags for "Tag Distribution"
    const tagCounts: Record<string, number> = {}
    allDeals.forEach(deal => {
      const tags = deal.productTags as string[] || []
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const topTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)

    // Calculate growth rate (Won deals vs Total deals)
    const wonCount = allDeals.filter(d => d.stage === 'won').length
    const totalCount = allDeals.length
    const growthRate = totalCount > 0 ? (wonCount / totalCount) * 100 : 0

    // Get weekly deal velocity (last 7 days) — parallel queries
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayWindows = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - idx))
      d.setHours(0, 0, 0, 0)
      return { name: days[d.getDay()], gte: new Date(d), lt: new Date(d.getTime() + 86400000) }
    })
    const velocityCounts = await Promise.all(
      dayWindows.map(w => prisma.deal.count({ where: { createdAt: { gte: w.gte, lt: w.lt } } }))
    )
    const velocityData = dayWindows.map((w, i) => ({ name: w.name, value: velocityCounts[i] }))

    return NextResponse.json({
      stats: {
        deals: dealsCount,
        contacts: contactsCount,
        organizations: organizationsCount,
      },
      activeDeals: activeDeals.map((d) => ({
        id: d.id,
        name: d.name,
        stage: d.stage,
        organizationName: d.organization?.name || null,
        lastDecision: d.lastDecision,
        nextStep: d.nextStep,
        updatedAt: d.updatedAt.toISOString(),
      })),
      recentDeals: recentDeals.map((d) => ({
        id: d.id,
        name: d.name,
        stage: d.stage,
        organizationName: d.organization?.name || null,
        updatedAt: d.updatedAt.toISOString(),
      })),
      upcomingActions: upcomingActions.map((d) => ({
        id: d.id,
        dealName: d.name,
        organizationName: d.organization?.name || null,
        nextStep: d.nextStep,
        updatedAt: d.updatedAt.toISOString(),
      })),
      recentActivity: recentActivity.map((i) => ({
        id: i.id,
        dealName: i.deal?.name || null,
        rawText: i.rawText.substring(0, 200),
        status: i.status,
        createdAt: i.createdAt.toISOString(),
      })),
      stageDistribution: stageDistribution.map((s) => ({
        stage: s.stage,
        count: s._count,
      })),
      topTags,
      growthRate: Math.round(growthRate * 10) / 10,
      velocityData
    })
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

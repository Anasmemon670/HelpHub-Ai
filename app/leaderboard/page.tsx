import { Trophy, Medal, Star, TrendingUp } from 'lucide-react'

const leaderboardData = [
  {
    rank: 1,
    name: 'Ayesha Khan',
    avatar: 'AK',
    location: 'Lahore',
    trustScore: 92,
    requestsSolved: 18,
    badges: ['Top Helper', 'Design Expert', 'Quick Responder'],
    trend: 'up',
  },
  {
    rank: 2,
    name: 'Ahmed Malik',
    avatar: 'AM',
    location: 'Islamabad',
    trustScore: 88,
    requestsSolved: 15,
    badges: ['Backend Pro', 'Mentor'],
    trend: 'up',
  },
  {
    rank: 3,
    name: 'Sara Noor',
    avatar: 'SN',
    location: 'Karachi',
    trustScore: 85,
    requestsSolved: 12,
    badges: ['Rising Star', 'Frontend'],
    trend: 'stable',
  },
  {
    rank: 4,
    name: 'Zain Abbas',
    avatar: 'ZA',
    location: 'Lahore',
    trustScore: 82,
    requestsSolved: 10,
    badges: ['UI/UX', 'Helpful'],
    trend: 'up',
  },
  {
    rank: 5,
    name: 'Fatima Ali',
    avatar: 'FA',
    location: 'Karachi',
    trustScore: 78,
    requestsSolved: 8,
    badges: ['Mobile Dev'],
    trend: 'down',
  },
  {
    rank: 6,
    name: 'Hassan Sheikh',
    avatar: 'HS',
    location: 'Peshawar',
    trustScore: 75,
    requestsSolved: 7,
    badges: ['Newcomer'],
    trend: 'up',
  },
]

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-500" />
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />
    default:
      return <span className="text-lg font-bold text-[#6B7280]">{rank}</span>
  }
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
              Leaderboard
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
              Top community contributors
            </h1>
            <p className="text-[#6B7280] text-lg">
              Celebrating helpers who make a real difference in our community.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Total Helpers</p>
              <p className="text-3xl font-bold text-[#1F2937]">156</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Avg Trust Score</p>
              <p className="text-3xl font-bold text-[#1F2937]">76%</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">This Week</p>
              <p className="text-3xl font-bold text-[#1F2937]">23</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Badges Earned</p>
              <p className="text-3xl font-bold text-[#1F2937]">89</p>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E5E5E0]">
              <h2 className="text-xl font-semibold text-[#1F2937]">Weekly Rankings</h2>
            </div>
            <div className="divide-y divide-[#E5E5E0]">
              {leaderboardData.map((user) => (
                <div
                  key={user.rank}
                  className={`p-6 flex items-center gap-4 hover:bg-[#F5F5F0] transition-colors ${
                    user.rank <= 3 ? 'bg-[#F5F5F0]/50' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[#2D8A6F] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{user.avatar}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1F2937]">{user.name}</h3>
                      {user.trend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280]">{user.location}</p>
                  </div>

                  {/* Badges */}
                  <div className="hidden md:flex flex-wrap gap-2 max-w-xs">
                    {user.badges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F0] text-[#2D8A6F] border border-[#E5E5E0]"
                      >
                        <Star className="w-3 h-3" />
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#2D8A6F]">{user.trustScore}%</p>
                    <p className="text-xs text-[#6B7280]">{user.requestsSolved} solved</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

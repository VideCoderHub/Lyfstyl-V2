const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

function getToken() {
  return localStorage.getItem('lyfstyl_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('lyfstyl_token', token)
  else localStorage.removeItem('lyfstyl_token')
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Request failed.')
  }
  return data
}

export const api = {
  health: () => request('/health'),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  socialLogin: (body) => request('/auth/social', { method: 'POST', body }),
  me: () => request('/auth/me'),
  completeOnboarding: (body) => request('/users/me/onboarding', { method: 'PATCH', body }),
  getDashboard: () => request('/users/me/dashboard'),
  getNotifications: () => request('/users/me/notifications'),
  markNotificationsRead: () => request('/users/me/notifications/read', { method: 'PATCH' }),
  updateProfile: (body) => request('/users/me/profile', { method: 'PATCH', body }),
  getStats: () => request('/stats'),
  search: (params) => {
    const query = new URLSearchParams(params).toString()
    return request(`/search?${query}`)
  },
  getDiscover: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/discover?${query}`)
  },
  getDiscoverItem: (id) => request(`/discover/${id}`),
  getRecipe: (id) => request(`/recipes/${id}`),
  getRecipes: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/recipes?${query}`)
  },
  createRecipe: (body) => request('/recipes', { method: 'POST', body }),
  getMove: (id) => request(`/moves/${id}`),
  getMoves: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/moves?${query}`)
  },
  createMove: (body) => request('/moves', { method: 'POST', body }),
  getMembers: () => request('/members'),
  getMember: (id) => request(`/members/${id}`),
  getCommunities: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/communities?${query}`)
  },
  getCommunity: (slug) => request(`/communities/${slug}`),
  getMyCommunities: () => request('/communities/mine'),
  postCommunityDiscussion: (slug, body) => request(`/communities/${slug}/posts`, { method: 'POST', body: { body } }),
  joinCommunity: (slug) => request(`/communities/${slug}/join`, { method: 'POST' }),
  leaveCommunity: (slug) => request(`/communities/${slug}/join`, { method: 'DELETE' }),
  getChallenges: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/challenges${query ? `?${query}` : ''}`)
  },
  getMyChallenges: () => request('/challenges/mine'),
  getChallenge: (id) => request(`/challenges/${id}`),
  enterChallenge: (id) => request(`/challenges/${id}/enter`, { method: 'POST' }),
  submitChallengeEntry: (id, body) => request(`/challenges/${id}/submit`, { method: 'POST', body }),
  voteChallengeSubmission: (submissionId) =>
    request(`/challenges/submissions/${submissionId}/vote`, { method: 'POST' }),
  starContent: (type, id, rating = 5) =>
    request(`/users/content/${type}/${id}/star`, { method: 'POST', body: { rating } }),
  toggleSave: (type, id) => request(`/users/me/save/${type}/${id}`, { method: 'POST' }),
  getComments: (type, id) => request(`/users/comments/${type}/${id}`),
  postComment: (type, id, body) =>
    request(`/users/comments/${type}/${id}`, { method: 'POST', body: { body } }),
  getRecommendations: () => request('/recommendations'),
  uploadFile: (body) => request('/uploads', { method: 'POST', body }),
  getConnections: () => request('/users/connections'),
  sendConnection: (userId) => request(`/users/connections/${userId}`, { method: 'POST' }),
  acceptConnection: (userId) => request(`/users/connections/${userId}/accept`, { method: 'PATCH' }),
  declineConnection: (userId) => request(`/users/connections/${userId}/decline`, { method: 'PATCH' }),
  removeConnection: (userId) => request(`/users/connections/${userId}`, { method: 'DELETE' }),
  getConversations: () => request('/users/messages/conversations'),
  getMessages: (userId) => request(`/users/messages/${userId}`),
  sendMessage: (userId, body) => request(`/users/messages/${userId}`, { method: 'POST', body: { body } }),
  getReviews: (type, id) => request(`/users/reviews/${type}/${id}`),
  postReview: (type, id, body) => request(`/users/reviews/${type}/${id}`, { method: 'POST', body }),
  getUnreadCount: () => request('/users/me/notifications/unread-count'),
  getFeed: (tab = 'following') => request(`/users/feed?tab=${tab}`),
  getPeople: (filter = 'suggested') => request(`/users/people?filter=${filter}`),
  getSuggestions: () => request('/users/suggestions'),
  followUser: (userId) => request(`/users/follow/${userId}`, { method: 'POST' }),
  unfollowUser: (userId) => request(`/users/follow/${userId}`, { method: 'DELETE' }),
  toggleApplause: (type, id) => request(`/users/applause/${type}/${id}`, { method: 'POST' }),
}

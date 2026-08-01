import axios from "axios"

interface PlatformClient {
  name: string
  publish(content: string, mediaUrls: string[]): Promise<{ success: boolean; postId?: string; error?: string }>
  getMetrics(postId: string): Promise<{ likes: number; comments: number; shares: number; impressions: number }>
}

function metaGraphApi(token: string): PlatformClient {
  const api = axios.create({ baseURL: "https://graph.facebook.com/v21.0", headers: { Authorization: `Bearer ${token}` } })

  return {
    name: "meta",
    async publish(content, mediaUrls) {
      try {
        const pages = await api.get("/me/accounts")
        const pageId = pages.data.data?.[0]?.id
        if (!pageId) return { success: false, error: "No Facebook page found" }

        const payload: Record<string, unknown> = { message: content }
        if (mediaUrls.length > 0) {
          payload.url = mediaUrls[0]
          payload.access_token = token
          const photoRes = await api.post(`/${pageId}/photos`, payload)
          return { success: true, postId: photoRes.data.id }
        }

        const postRes = await api.post(`/${pageId}/feed`, payload)
        return { success: true, postId: postRes.data.id }
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
    async getMetrics(postId) {
      try {
        const { data } = await api.get(`/${postId}/insights`, {
          params: { metric: "likes,comments,shares,impressions" },
        })
        const map: Record<string, number> = { likes: 0, comments: 0, shares: 0, impressions: 0 }
        for (const d of data.data || []) {
          map[d.name] = d.values?.[0]?.value ?? 0
        }
        return map as { likes: number; comments: number; shares: number; impressions: number }
      } catch {
        return { likes: 0, comments: 0, shares: 0, impressions: 0 }
      }
    },
  }
}

function tiktokClient(token: string): PlatformClient {
  return {
    name: "tiktok",
    async publish(_content, _mediaUrls) {
      return { success: false, error: "TikTok API requires OAuth 2.0 with video upload — set TIKTOK_ACCESS_TOKEN" }
    },
    async getMetrics(_postId) {
      return { likes: 0, comments: 0, shares: 0, impressions: 0 }
    },
  }
}

function xClient(bearer: string): PlatformClient {
  const api = axios.create({ baseURL: "https://api.twitter.com/2", headers: { Authorization: `Bearer ${bearer}` } })

  return {
    name: "x",
    async publish(content, _mediaUrls) {
      try {
        const { data } = await api.post("/tweets", { text: content })
        return { success: true, postId: data.data?.id }
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
    async getMetrics(postId) {
      try {
        const { data } = await api.get(`/tweets/${postId}`, {
          params: { "tweet.fields": "public_metrics" },
        })
        return data.data?.public_metrics ?? { likes: 0, comments: 0, shares: 0, impressions: 0 }
      } catch {
        return { likes: 0, comments: 0, shares: 0, impressions: 0 }
      }
    },
  }
}

function youtubeClient(apiKey: string): PlatformClient {
  const api = axios.create({ baseURL: "https://www.googleapis.com/youtube/v3", params: { key: apiKey } })

  return {
    name: "youtube",
    async publish(_content, _mediaUrls) {
      return { success: false, error: "YouTube upload requires OAuth 2.0 — set YOUTUBE_API_KEY and implement OAuth flow" }
    },
    async getMetrics(videoId) {
      try {
        const { data } = await api.get("/videos", {
          params: { id: videoId, part: "statistics" },
        })
        const stats = data.items?.[0]?.statistics ?? {}
        return {
          likes: parseInt(stats.likeCount ?? "0"),
          comments: parseInt(stats.commentCount ?? "0"),
          shares: 0,
          impressions: parseInt(stats.viewCount ?? "0"),
        }
      } catch {
        return { likes: 0, comments: 0, shares: 0, impressions: 0 }
      }
    },
  }
}

function linkedinClient(token: string): PlatformClient {
  const api = axios.create({
    baseURL: "https://api.linkedin.com/v2",
    headers: { Authorization: `Bearer ${token}`, "X-Restli-Protocol-Version": "2.0.0" },
  })

  return {
    name: "linkedin",
    async publish(content, _mediaUrls) {
      try {
        const me = await api.get("/me")
        const author = me.data.id
        const { data } = await api.post("/ugcPosts", {
          author: `urn:li:person:${author}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: content },
              shareMediaCategory: "NONE",
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        })
        return { success: true, postId: data.id }
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
    async getMetrics(postId) {
      return { likes: 0, comments: 0, shares: 0, impressions: 0 }
    },
  }
}

export function getClient(platform: string, accessToken: string | null): PlatformClient | null {
  if (!accessToken) return null
  switch (platform) {
    case "facebook":
    case "instagram":
      return metaGraphApi(accessToken)
    case "tiktok":
      return tiktokClient(accessToken)
    case "x":
      return xClient(accessToken)
    case "youtube":
      return youtubeClient(accessToken)
    case "linkedin":
      return linkedinClient(accessToken)
    default:
      return null
  }
}

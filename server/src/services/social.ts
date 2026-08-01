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
  const api = axios.create({
    baseURL: "https://open.tiktokapis.com",
    headers: { Authorization: `Bearer ${token}` },
  })

  return {
    name: "tiktok",
    // TikTok Content Posting API — direct-video-publish flow. Posting is
    // initialized first, then finalized. Requires a video URL and the
    // video.upload / video.publish OAuth scopes.
    async publish(content, mediaUrls) {
      if (mediaUrls.length === 0) {
        return { success: false, error: "TikTok posts must include a video — pass a media URL (.mp4)" }
      }
      try {
        const init = await api.post("/v2/post/publish/video/init/", {
          post_info: {
            title: content.slice(0, 2200),
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_comment: false,
            disable_duet: false,
            disable_stitch: false,
          },
          source_info: { source: "PULL_FROM_URL", video_url: mediaUrls[0] },
        })
        const publishId = init.data?.data?.publish_id
        if (!publishId) return { success: false, error: "TikTok init returned no publish_id" }

        const complete = await api.post("/v2/post/publish/video/complete/", { publish_id: publishId })
        return { success: true, postId: complete.data?.data?.publish_id || publishId }
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
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

function youtubeClient(accessToken: string): PlatformClient {
  const api = axios.create({
    baseURL: "https://www.googleapis.com/youtube/v3",
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return {
    name: "youtube",
    // YouTube Data API v3 resumable upload. Requires an OAuth access token
    // (scope youtube.upload) — an API key alone cannot upload videos.
    async publish(content, mediaUrls) {
      if (mediaUrls.length === 0) {
        return { success: false, error: "YouTube uploads require a video — pass a media URL" }
      }
      try {
        const init = await axios.post(
          "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
          {
            snippet: { title: content.slice(0, 100), description: content },
            status: { privacyStatus: "public" },
          },
          { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json; charset=UTF-8" } },
        )
        const uploadUrl = init.headers.location
        if (!uploadUrl) return { success: false, error: "YouTube did not return a resumable upload URL" }

        const video = await axios.get(mediaUrls[0], { responseType: "arraybuffer" })
        const done = await axios.put(uploadUrl, video.data, {
          headers: { "Content-Type": "video/*", "Content-Length": String(video.data.byteLength) },
        })
        return { success: true, postId: done.data?.id }
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
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

function snapchatClient(_token: string): PlatformClient {
  return {
    name: "snapchat",
    // Snapchat has no public organic posting API. The only programmatic surface
    // is the Snapchat Marketing API for ads, which is covered in ads.ts.
    async publish() {
      return {
        success: false,
        error: "Snapchat has no public organic posting API — connect Snapchat Ads in the Ads section instead",
      }
    },
    async getMetrics(_postId) {
      return { likes: 0, comments: 0, shares: 0, impressions: 0 }
    },
  }
}

function pinterestClient(token: string): PlatformClient {
  const api = axios.create({ baseURL: "https://api.pinterest.com/v5", headers: { Authorization: `Bearer ${token}` } })

  return {
    name: "pinterest",
    async publish(content, mediaUrls) {
      if (mediaUrls.length === 0) {
        return { success: false, error: "Pinterest pins require an image URL — pass a media URL" }
      }
      try {
        const { data } = await api.post("/pins", {
          title: content.slice(0, 100),
          description: content,
          media_source: { source_type: "image_url", url: mediaUrls[0] },
        })
        return { success: true, postId: data.id }
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
    async getMetrics(pinId) {
      try {
        const { data } = await api.get(`/pins/${pinId}/analytics`, {
          params: { metric_types: "IMPRESSION,SAVE_TOTAL,OUTBOUND_CLICK,SAVE_PIN_TOTAL" },
        })
        const m = data?.data?.[0] ?? {}
        return {
          likes: m.SAVE_TOTAL ?? 0,
          comments: 0,
          shares: m.SAVE_PIN_TOTAL ?? 0,
          impressions: m.IMPRESSION ?? 0,
        }
      } catch {
        return { likes: 0, comments: 0, shares: 0, impressions: 0 }
      }
    },
  }
}

function threadsClient(token: string): PlatformClient {
  const api = axios.create({ baseURL: "https://graph.threads.net/v1.0", headers: { Authorization: `Bearer ${token}` } })

  return {
    name: "threads",
    async publish(content, _mediaUrls) {
      try {
        const me = await api.get("/me")
        const userId = me.data?.id
        if (!userId) return { success: false, error: "Threads could not resolve the user ID from this token" }

        const container = await api.post(`/${userId}/threads`, { media_type: "TEXT", text: content })
        const creationId = container.data?.id
        if (!creationId) return { success: false, error: "Threads did not return a media container ID" }

        const published = await api.post(`/${userId}/threads_publish`, { creation_id: creationId })
        return { success: true, postId: published.data?.id || creationId }
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
    async getMetrics(mediaId) {
      try {
        const { data } = await api.get(`/${mediaId}/insights`, { params: { metric: "views,likes,replies,reposts,quotes" } })
        const map: Record<string, number> = {}
        for (const d of data?.data ?? []) map[d.name] = d.values?.[0]?.value ?? 0
        return {
          likes: map.likes ?? 0,
          comments: map.replies ?? 0,
          shares: (map.reposts ?? 0) + (map.quotes ?? 0),
          impressions: map.views ?? 0,
        }
      } catch {
        return { likes: 0, comments: 0, shares: 0, impressions: 0 }
      }
    },
  }
}

function googleBusinessProfileClient(accessToken: string): PlatformClient {
  const api = axios.create({
    baseURL: "https://mybusinessbusinessinformation.googleapis.com/v1",
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return {
    name: "google-business-profile",
    // No programmatic organic posting — posts are managed in Google Business
    // Manager. Kept as a registered connection so a business can prove the
    // profile is linked; read metrics live in the SEO section where available.
    async publish() {
      return { success: false, error: "Google Business Profile has no organic posting API — manage posts in Google Business Manager" }
    },
    async getMetrics(_postId) {
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
    case "snapchat":
      return snapchatClient(accessToken)
    case "pinterest":
      return pinterestClient(accessToken)
    case "threads":
      return threadsClient(accessToken)
    case "google-business-profile":
      return googleBusinessProfileClient(accessToken)
    default:
      return null
  }
}

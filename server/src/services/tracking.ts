import { getDb } from "../db/index.js"
import { v4 as uuid } from "uuid"

export interface TrackingPayload {
  businessId: string
  sessionId: string
  visitorId: string
  eventType: string
  pageUrl: string
  referrer?: string
  metadata?: Record<string, unknown>
  ip?: string
  userAgent?: string
}

export function recordEvent(payload: TrackingPayload): { success: boolean; id: string } {
  const db = getDb()
  const id = uuid()

  db.prepare(
    `INSERT INTO tracking_events (id, business_id, session_id, visitor_id, event_type, page_url, referrer, metadata, ip, user_agent, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
  ).run(
    id,
    payload.businessId,
    payload.sessionId,
    payload.visitorId,
    payload.eventType,
    payload.pageUrl,
    payload.referrer || null,
    JSON.stringify(payload.metadata || {}),
    payload.ip || null,
    payload.userAgent || null,
  )

  return { success: true, id }
}

export function getEvents(
  businessId: string,
  options: { limit?: number; offset?: number; eventType?: string } = {},
): Array<Record<string, unknown>> {
  const db = getDb()
  let sql = "SELECT * FROM tracking_events WHERE business_id = ?"
  const params: unknown[] = [businessId]

  if (options.eventType) {
    sql += " AND event_type = ?"
    params.push(options.eventType)
  }

  sql += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
  params.push(options.limit || 100, options.offset || 0)

  return db.prepare(sql).all(...params) as Array<Record<string, unknown>>
}

export function generateTrackingSnippet(businessId: string, apiUrl: string): string {
  return `<!-- Growth Network Tracking Pixel -->
<script>
(function() {
  var bid = "${businessId}";
  var api = "${apiUrl.replace(/\/+$/, "")}";
  var sid = localStorage.getItem("gn_session_id") || "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  localStorage.setItem("gn_session_id", sid);
  var vid = localStorage.getItem("gn_visitor_id") || "vis_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem("gn_visitor_id", vid);

  function track(eventType, metadata) {
    var payload = {
      businessId: bid,
      sessionId: sid,
      visitorId: vid,
      eventType: eventType,
      pageUrl: window.location.href,
      referrer: document.referrer || undefined,
      metadata: metadata || {},
    };
    if (navigator.sendBeacon) {
      navigator.sendBeacon(api + "/api/tracking/event", JSON.stringify(payload));
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", api + "/api/tracking/event", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(payload));
    }
  }

  track("pageview");

  document.addEventListener("click", function(e) {
    var target = e.target;
    if (target && target.tagName === "A" && target.href) {
      track("click", { linkText: target.innerText, href: target.href });
    }
    if (target && (target.tagName === "BUTTON" || target.type === "submit")) {
      track("button_click", { buttonText: target.innerText || target.value });
    }
  });

  var forms = document.querySelectorAll("form");
  forms.forEach(function(form) {
    form.addEventListener("submit", function() {
      track("form_submit", { formAction: form.action, formId: form.id });
    });
  });

  window.addEventListener("beforeunload", function() {
    track("pageleave");
  });
})();
</script>
<!-- End Growth Network Tracking Pixel -->`
}

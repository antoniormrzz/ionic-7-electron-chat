import { Chat } from "@pubnub/chat";

export function initializeChatForUser(displayName: string) {
  return Chat.init({
    subscribeKey: import.meta.env.VITE_PUBNUB_SUBSCRIBE_KEY,
    publishKey: import.meta.env.VITE_PUBNUB_PUBLISH_KEY,
    userId: displayName + '_user',
    storeUserActivityTimestamps: true,
    storeUserActivityInterval : 60000 // 1 minute
  })
}
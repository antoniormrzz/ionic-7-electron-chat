import { createContext } from "react"
import { Chat } from "@pubnub/chat"

export const ChatContext = createContext<{
  chat: Chat,
  displayName: string,
  setDisplayName: (displayName: string) => void,
  setActiveConversationId: (conversationId: string) => void,
}>({} as any)
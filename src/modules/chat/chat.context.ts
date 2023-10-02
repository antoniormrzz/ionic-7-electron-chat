import { createContext } from "react"
import { Chat } from "@pubnub/chat"

export const ChatContext = createContext<{chat: Chat, setChat: (chat: Chat) => void}>({} as any)
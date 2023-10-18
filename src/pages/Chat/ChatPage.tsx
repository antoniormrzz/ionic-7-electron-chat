import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonMenuButton,
  IonPage,
  IonPopover,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import './ChatPage.css';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { ChatContext } from '../../modules/chat/chat.context';
import { Channel, Message, MessageDraft } from '@pubnub/chat';
import {
  chatboxOutline,
  close,
  imageOutline,
  pencilOutline,
  sendOutline
} from 'ionicons/icons';
import MessageCard from '../../components/MessageCard';
import ForwardPicker from '../../components/ForwardPicker';
import ThreadScreen from '../../components/ThreadScreen';
import InviteModal from '../../components/InviteModal';

type ChatPageProps = {
  activeConversationId: string | undefined;
}

const ChatPage: React.FC<ChatPageProps> = ({
  activeConversationId
}: ChatPageProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<FileList | null>(null);


  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);


  const [isForwardPickerOpen, setIsForwardPickerOpen] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!isForwardPickerOpen) {
      setForwardMessage(null);
    }
  }, [isForwardPickerOpen]);

  const { chat } = useContext(ChatContext);

  const [channel, setChannel] = useState<Channel>();

  const [newMessage, setNewMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);

  const [draftMessage, setDraftMessage] = useState<MessageDraft>();

  useEffect(() => {
    if (channel) {
      setDraftMessage(channel.createMessageDraft())
      setReplyMessage(null)
      setIsForwardPickerOpen(false);
    }
  }, [channel]);

  const handleSendMessage = useCallback(async () => {
    if (channel) {
      await draftMessage?.onChange(newMessage);
      // a regex to detect a link,
      // and the position of the link in characters from the start of the message starting with 0
      const linkRegex = /https?:\/\/[^\s]+/g;
      const match = linkRegex.exec(newMessage);
      if (match) {
        const link = match[0];
        const linkIndex = match.index;
        // add the link to the draft message
        draftMessage?.addLinkedText({
          link: link,
          text: "myLink",
          positionInInput: linkIndex
        });
      }
      if (replyMessage) {
        draftMessage?.addQuote(replyMessage);
        setReplyMessage(null);
      }
      if (file) {
        // add the file to the draft message
        draftMessage!.files = file;
      }
      draftMessage?.send().then(() => {
        setDraftMessage(channel.createMessageDraft())
        setNewMessage('');
      })
    }
  }, [channel, draftMessage, newMessage, replyMessage]);

  useEffect(() => {
    if (chat && activeConversationId) {
      chat.getChannel(activeConversationId).then((channel) => {
        setChannel(channel as Channel);
      })
    }
  }, [chat, activeConversationId]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>();
  const [readMemoized, setReadMemoized] = useState<{
    [key: string]: string[];
  }>({});

  useEffect(() => {
    let unsubscribeChannelMessage: (() => void) | undefined;
    let unsubscribeChannelTyping: (() => void) | undefined;
    let unsubscribeChannelRead: (() => void) | undefined;

    if (channel && chat) {
      // subscribe to channel messages
      unsubscribeChannelMessage = channel.connect((message) => {
        setMessages((messages) => [...messages, message]);
      });
      if (channel.type !== 'public') {
        // subscribe to channel typing events
        unsubscribeChannelTyping = channel.getTyping((typingUserIDs: string[]) => {
          setTypingUsers(typingUserIDs.filter((_id) => _id !== chat.currentUser.id));
        })
        // subscribe to channel read events
        channel.streamReadReceipts((receipts) => {
          setReadMemoized(receipts)
        }).then(_f => unsubscribeChannelRead = _f)
      }
      // get channel message history
      channel.getHistory().then((_history) => {
        setMessages(_history.messages);
      });
      // get channel pinned message
      channel.getPinnedMessage().then((_pinnedMessage) => {
        setPinnedMessage(_pinnedMessage);
      });
    }

    return () => {
      if (unsubscribeChannelMessage) {
        unsubscribeChannelMessage();
      }
      if (unsubscribeChannelTyping) {
        unsubscribeChannelTyping();
      }
      if (unsubscribeChannelRead) {
        unsubscribeChannelRead();
      }
    };
  }, [channel, chat]);

  const contentRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    if (channel && channel.type !== 'public' && messages.length > 0) {
      // set the last read message to the last message in the channel
      channel.getMembers().then((_memberData) => {
        _memberData.members.find((member) => member.user.id === chat?.currentUser.id)?.setLastReadMessage(
          messages[messages.length - 1]
        )
      })
    }
  }, [messages]);


  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollToBottom(300);
      contentRef.current.scrollByPoint(0, 100, 300);
    }
  }, [messages?.length]);

  const handleSetIsTyping = useCallback((e: any) => {
    setNewMessage(e.target!.value);
    if (channel && channel.type !== 'public') {
      // set the current user as typing
      channel.startTyping();
    }
  }, [channel]);

  const handleUnpin = useCallback(() => {
    if (channel) {
      // unpin the pinned message
      channel.unpinMessage().then(() => {
        setPinnedMessage(null);
      })
    }
  }, [channel]);

  const popover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionMode, setSuggestionMode] = useState<'mention' | 'channel' | null>(null);
  const [mentionIndex, setMentionIndex] = useState(-1);
  const inputRef = useRef<HTMLIonInputElement>(null);

  useEffect(() => {
    setSuggestions([]);
    setPopoverOpen(false);
    // get the suggested users and channels based on the text in the input
    draftMessage?.onChange(newMessage).then(({ users, channels }) => {
      if (users.suggestedUsers.length > 0) {
        setSuggestions(users.suggestedUsers.map((user) => user.id));
        setPopoverOpen(true);
        setMentionIndex(users.nameOccurrenceIndex);
        setSuggestionMode('mention');
      } else if (channels.suggestedChannels.length > 0) {
        setSuggestions(channels.suggestedChannels.map((channel) => channel.id));
        setPopoverOpen(true);
        setMentionIndex(channels.channelOccurrenceIndex);
        setSuggestionMode('channel');
      }
    })
  }, [newMessage]);

  const handleSuggestionPicked = useCallback(async (suggestion: string) => {
    setPopoverOpen(false);
    if (suggestionMode === 'mention') {
      const _user = await chat.getUser(suggestion)
      // add the mentioned user to the draft message
      draftMessage?.addMentionedUser(_user!, mentionIndex);
      setMentionIndex(-1);
      setSuggestions([]);
      setSuggestionMode(null);
    }
    if (suggestionMode === 'channel') {
      const _channel = await chat.getChannel(suggestion)
      // add the referenced channel to the draft message
      draftMessage?.addReferencedChannel(_channel!, mentionIndex);
      setMentionIndex(-1);
      setSuggestions([]);
      setSuggestionMode(null);
    }
  }, [draftMessage, mentionIndex, suggestionMode]);

  const messagePreview = useMemo(() => {
    // get the message preview in parts and format it
    return draftMessage?.getMessagePreview().map((text, index) => {

      if (text.type === "textLink") {
        return (
          <IonText key={index} color="primary">
            <a href={text.content.link} target="_blank" rel="noreferrer">{text.content.text}</a>
          </IonText>
        )
      } else if (text.type === "channelReference") {
        return (
          <IonText key={index} color={"warning"}>#{text.content.name}</IonText>
        )
      } else if (text.type === "mention") {
        return (
          <IonText key={index} color={"success"}>@{text.content.name}:{text.content.id}</IonText>
        )
      } else if (text.type === "text") {
        return text.content.text
      }
    })
  }, [newMessage, draftMessage?.getMessagePreview()])

  const handleChannelRename = useCallback(() => {
    if (channel) {
      // update channel name to random 10 digit number
      channel.update({ name: Math.floor(Math.random() * 10000000000).toString() }).then((channel) => {
        setChannel(channel);
      })
    }
  }, [channel]);

  const [channelMembers, setChannelMembers] = useState<string[]>([]);

  useEffect(() => {
    let unsubscribeChannelPresence: (() => void) | undefined;
    if (channel) {
      // subscribe to channel presence events to see who is connected right now
      channel
        .streamPresence(members => {
          setChannelMembers(members.filter((member) => member !== chat.currentUser.id))
        }).then(_f => unsubscribeChannelPresence = _f)
    }

    return () => {
      if (unsubscribeChannelPresence) {
        unsubscribeChannelPresence();
      }
    }
  }, [channel]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // const restartChannel = useCallback(() => {
  //   if (chat && activeConversationId) {
  //     chat.getChannel(activeConversationId).then((channel) => {
  //       setChannel(channel as Channel);
  //     })
  //   }
  // }, [chat, activeConversationId]);

  const handleChannelInvite = useCallback(() => {
    setIsInviteOpen(true);
  }, []);



  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{channel?.name} {channelMembers.length ? ('(' + channelMembers.join(', ') + ' present)') : null}
            <IonButton fill='clear' onClick={handleChannelRename}>
              <IonIcon icon={pencilOutline} />
            </IonButton>
            <IonButton fill='clear' onClick={handleChannelInvite}>
              <IonIcon icon={chatboxOutline} />
            </IonButton>
          </IonTitle>
          {
            typingUsers.length > 0 ? (
              <IonText>
                <p>{typingUsers.join(', ')} typing...</p>
              </IonText>
            ) : null
          }
        </IonToolbar>
        {pinnedMessage &&
          (<IonToolbar className='w-full'>
            <IonText>
              Pinned: {pinnedMessage.content.text}
            </IonText>
            <IonButton fill="clear" onClick={handleUnpin} slot='end'>Unpin</IonButton>
          </IonToolbar>)
        }
        {
          messagePreview && (
            <IonToolbar className='w-full'>
              {messagePreview}
            </IonToolbar>
          )
        }

      </IonHeader>

      <IonContent
        fullscreen
        ref={contentRef}
        className='chat-page__content'
      >
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{channel?.name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {
          messages.map((message) => (
            <MessageCard
              key={message.timetoken}
              onDelete={(message) => {
                message.delete().then(() => {
                  setMessages((messages) => {
                    const newMessages = [...messages].filter((_message) => _message.timetoken !== message.timetoken);
                    return newMessages;
                  })
                })
              }}
              onThread={(message) => {
                setThreadMessage(message);
                setIsThreadOpen(true);
              }}
              onReply={(message) => setReplyMessage(message)}
              onForward={(message) => {
                setForwardMessage(message);
                setIsForwardPickerOpen(true);
              }}
              message={message}
              onPin={(message) => {
                setPinnedMessage(message);
              }}
              onToggleLike={(message) => {
                setMessages((messages) => {
                  const newMessages = [...messages];
                  const messageIndex = newMessages.findIndex((_message) => _message.timetoken === message.timetoken);
                  newMessages[messageIndex] = message;
                  return newMessages;
                })
              }}
              readBy={(readMemoized[message.timetoken] || []).filter((_id) => _id !== chat.currentUser.id)}
            />
          ))
        }
      </IonContent>

      <ForwardPicker
        message={forwardMessage}
        channelId={channel?.id || ''}
        isForwardPickerOpen={isForwardPickerOpen}
        setIsForwardPickerOpen={setIsForwardPickerOpen}
      />

      <InviteModal
        channel={channel!}
        isOpen={isInviteOpen}
        setOpen={(o) => {
          setIsInviteOpen(o)
        }}
      />

      <IonFooter>
        {replyMessage && (
          <IonToolbar>
            <IonText>
              {replyMessage.userId}: {replyMessage.content.text}
            </IonText>
            <IonButton fill="clear" onClick={() => setReplyMessage(null)} slot='end'>
              <IonIcon icon={close} />
            </IonButton>
          </IonToolbar>
        )
        }
        <IonToolbar className='p-2'>
          <IonInput
            placeholder="Type a message"
            ref={inputRef}
            value={newMessage}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            onIonInput={handleSetIsTyping}
            debounce={1000}
          />
          <IonButtons slot="end">
            {/* html input file picker button */}
            <input
              type="file"
              accept="image/*"
              id="file"
              style={{ display: "none" }}
              ref={fileRef}
              onChange={(e) => {
                if (e.target.files) {
                  setFile(e.target.files);
                }
              }}
            />
            <IonButton fill="clear" onClick={() => {
              fileRef.current?.click();
            }}>
              <IonIcon icon={imageOutline} />
            </IonButton>
            <IonButton onClick={handleSendMessage}>
              Send
              <IonIcon icon={sendOutline} className='ml-2' />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>

      <ThreadScreen
        message={threadMessage}
        isThreadOpen={isThreadOpen}
        setIsThreadOpen={setIsThreadOpen}
      />

      <IonPopover reference="event" ref={popover} isOpen={popoverOpen} onDidDismiss={() => setPopoverOpen(false)}>
        <IonList>
          {
            suggestions.map((suggestion) => (
              <IonItem key={suggestion}>
                <IonButton fill="clear" onClick={() => handleSuggestionPicked(suggestion)}>{suggestion}</IonButton>
              </IonItem>
            ))
          }
        </IonList>
      </IonPopover>

    </IonPage >
  );
};

export default ChatPage;

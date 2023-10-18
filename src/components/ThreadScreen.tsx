import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Channel, Message, MessageDraft } from "@pubnub/chat";
import { close, sendOutline, unlinkOutline } from "ionicons/icons";

import ThreadMessageComponent from "./ThreadMessage";

type ThreadScreenProps = {
  isThreadOpen: boolean;
  setIsThreadOpen: (isOpen: boolean) => void;
  message: Message | null;
}

function ThreadScreen({
  isThreadOpen,
  setIsThreadOpen,
  message
}: ThreadScreenProps) {
  const [threadChannel, setThreadChannel] = useState<Channel>();

  const [newMessage, setNewMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);

  const [draftMessage, setDraftMessage] = useState<MessageDraft>();

  useEffect(() => {
    if (threadChannel) {
      setDraftMessage(threadChannel.createMessageDraft())
      setReplyMessage(null)
    }
  }, [threadChannel]);

  const handleSendMessage = useCallback(async () => {
    let _threadChannel = threadChannel;
    if (!threadChannel) {
      if (message!.hasThread) {
        // get the thread channel if it exists
        _threadChannel = await message!.getThread();
      } else {
        // create a thread channel if it doesn't exist
        _threadChannel = await message!.createThread()
      }
      setThreadChannel(_threadChannel);
    }
    await draftMessage?.onChange(newMessage);
    if (replyMessage) {
      // add quote to the draft message
      draftMessage?.addQuote(replyMessage);
      setReplyMessage(null);
    }
    // send the draft message
    draftMessage?.send().then(() => {
      setDraftMessage(threadChannel!.createMessageDraft())
      setNewMessage('');
    })
  }, [threadChannel, draftMessage, newMessage, replyMessage]);

  // create a thread channel if it doesn't exist for the message
  useEffect(() => {
    if (message) {
      if (message!.hasThread) {
        message!.getThread().then((_threadChannel) => {
          setThreadChannel(_threadChannel);
        })
      } else {
        message!.createThread().then((_threadChannel) => {
          setThreadChannel(_threadChannel);
        })
      }
    }
  }, [message]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>();

  useEffect(() => {
    let unsubscribeChannelMessage: (() => void) | undefined;

    if (threadChannel) {
      // listen for new messages in the thread channel
      unsubscribeChannelMessage = threadChannel.connect((message) => {
        setMessages((messages) => [...messages, message]);
      });

      // get the history of the thread channel
      threadChannel.getHistory().then((_history) => {
        setMessages(_history.messages);
      });

      // get the pinned message of the thread channel
      threadChannel.getPinnedMessage().then((_pinnedMessage) => {
        setPinnedMessage(_pinnedMessage);
      });
    }

    return () => {
      if (unsubscribeChannelMessage) {
        unsubscribeChannelMessage();
      }
    };
  }, [threadChannel]);

  const contentRef = useRef<HTMLIonContentElement>(null);

  // scroll to the bottom of the thread when a new message is added
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollToBottom(300);
      contentRef.current.scrollByPoint(0, 100, 300);
    }
  }, [messages?.length]);


  // unpin the pinned message
  const handleUnpin = useCallback(() => {
    if (threadChannel) {
      threadChannel.unpinMessage().then(() => {
        setPinnedMessage(null);
      })
    }
  }, [threadChannel]);


  return (
    <IonModal isOpen={isThreadOpen}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Thread</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setIsThreadOpen(false)}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonText>Topic: {message?.content.text}</IonText>
        </IonToolbar>
        {pinnedMessage && (<IonToolbar>
          <IonText>Pinned: {pinnedMessage?.content.text}</IonText>
          <IonButton fill="clear" onClick={handleUnpin} slot='end'>
            <IonIcon icon={unlinkOutline} />
          </IonButton>
        </IonToolbar>)}
      </IonHeader>
      <IonContent ref={contentRef} className="ion-padding">
        {
          messages.map((message) => (
            <ThreadMessageComponent
              key={message.timetoken}
              onDelete={(message) => {
                message.delete().then(() => {
                  setMessages((messages) => {
                    const newMessages = [...messages].filter((_message) => _message.timetoken !== message.timetoken);
                    return newMessages;
                  })
                })
              }}
              onReply={(message) => setReplyMessage(message)}
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
            />
          ))
        }
      </IonContent>

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
            value={newMessage}
            onIonChange={(e) => setNewMessage(e.target.value! + '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <IonButton slot='end' onClick={handleSendMessage}>
            Send
            <IonIcon icon={sendOutline} className='ml-2' />
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  )
}

export default ThreadScreen;
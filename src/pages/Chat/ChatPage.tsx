import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './ChatPage.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../../modules/chat/chat.context';
import { Channel, Chat, Message } from '@pubnub/chat';
import { sendOutline } from 'ionicons/icons';

type ChatPageProps = {
  activeConversationId: string | undefined;
}

const ChatPage: React.FC<ChatPageProps> = ({
  activeConversationId
}: ChatPageProps) => {
  const { chat } = useContext(ChatContext);

  const [ channel, setChannel ] = useState<Channel>();

  const [ newMessage, setNewMessage ] = useState('');

  const handleSendMessage = () => {
    if(channel) {
      channel.sendText(newMessage).then(() => {
        setNewMessage('');
      })
    }
  }

  useEffect(() => {
    if(chat && activeConversationId) {
      chat.getChannel(activeConversationId).then((channel) => {
        setChannel(channel as Channel);
      })
    }
  }, [chat, activeConversationId]);

  const [ messages, setMessages ] = useState<Message[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (channel && chat) {
      unsubscribe = channel.connect((message) => {
        setMessages((messages) => [...messages, message]);
      });
      channel.getHistory().then((_history) => {
        setMessages(_history.messages);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [channel, chat]);

  const contentRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollToBottom(300);
      contentRef.current.scrollByPoint(0, 100, 300);
    }
  }, [messages?.length]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{channel?.name}</IonTitle>
        </IonToolbar>
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
            <IonCard key={message.timetoken}>
              <IonCardHeader>
                <IonCardSubtitle>{message.userId}</IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent>{message.content.text}</IonCardContent>
            </IonCard>
          ))
        }
      </IonContent>

      <IonFooter>
        <IonToolbar className='p-2'>
          <IonInput
            placeholder="Type a message"
            value={newMessage}
            onIonChange={(e) => setNewMessage(e.detail.value!)}
          />
          <IonButton slot='end' onClick={handleSendMessage}>
            Send
            <IonIcon icon={sendOutline} className='ml-2' />
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default ChatPage;

import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import { useLocalStorage } from '../../utils/useLocalStorage.util';
import { useContext, useEffect } from 'react';
import { ChatContext } from '../../modules/chat/chat.context';
import { Chat } from '@pubnub/chat';

const Page: React.FC = () => {

  const [ displayName ] = useLocalStorage('displayName', '');

  const { chat, setChat} = useContext(ChatContext);

  // initialize pubnub chat sdk
  useEffect(() => {
    if(!chat && displayName) {
      Chat.init({
        subscribeKey: import.meta.env.VITE_PUBNUB_SUBSCRIBE_KEY,
        publishKey: import.meta.env.VITE_PUBNUB_PUBLISH_KEY,
        userId: displayName + '_user',
      }).then((chat) => {
        setChat(chat);
      })
    }
  }, [displayName]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{displayName}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{displayName}</IonTitle>
          </IonToolbar>
        </IonHeader>
        
      </IonContent>
    </IonPage>
  );
};

export default Page;

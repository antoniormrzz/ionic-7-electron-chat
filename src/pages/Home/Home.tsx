import { IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonMenuButton, IonPage, IonText, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import './Home.css';
import { useLocalStorage } from '../../utils/useLocalStorage.util';
import { useContext, useEffect } from 'react';
import { ChatContext } from '../../modules/chat/chat.context';
import { Chat } from '@pubnub/chat';
import { RouteComponentProps, useParams } from 'react-router';
import { chatbubbleOutline } from 'ionicons/icons';

const Home: React.FC = () => {
  const { chat, displayName } = useContext(ChatContext);

  const router = useIonRouter();

  return (
    <IonPage>
      <IonFab slot="fixed" horizontal="end" vertical="bottom">
        <IonFabButton onClick={()=>{
          router.push('/contact-picker');
        }}>
          <IonIcon icon={chatbubbleOutline}></IonIcon>
        </IonFabButton>
      </IonFab>
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
        <IonText>
          <h1>Welcome!</h1>
          <p>Click on the menu button to view your conversations,
            or use the floating button to start a new conversation.</p>
        </IonText>
      </IonContent>
    </IonPage>
  );
};

export default Home;

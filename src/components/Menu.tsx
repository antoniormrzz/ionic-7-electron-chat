import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';

import { useHistory, useLocation } from 'react-router-dom';
import { archiveOutline, archiveSharp, bookmarkOutline, chatbubblesOutline, chatbubblesSharp, heartOutline, heartSharp, homeOutline, homeSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, pencilOutline, pencilSharp, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import { Channel, Membership } from '@pubnub/chat';
import { useCallback, useContext, useEffect } from 'react';
import { ChatContext } from '../modules/chat/chat.context';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Home',
    url: '/home',
    iosIcon: homeOutline,
    mdIcon: homeSharp
  },
  {
    title: 'Change Display Name',
    url: '/pick-name',
    iosIcon: pencilOutline,
    mdIcon: pencilSharp
  }
];

type MenuProps = {
  conversations?: Membership[];
  setConversations: (conversations: Membership[]) => void;
  activeConversationId: string | undefined;
  setActiveConversationId: (id: string) => void;
}

const Menu: React.FC<MenuProps> = ({
  conversations = [],
  setConversations,
  activeConversationId,
  setActiveConversationId
}: MenuProps) => {
  const location = useLocation();

  const { chat } = useContext(ChatContext);

  useEffect(() => {
    if(chat) {
      chat.currentUser.getMemberships().then((_conversations) => {
        setConversations(_conversations.memberships);
      })
    }
  }, [chat])

  const history = useHistory();

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Pages</IonListHeader>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        <IonList id="labels-list">
          <IonListHeader>Conversations</IonListHeader>
          {conversations.map((conversation) => (
            <IonItem
              button
              lines="none"
              key={conversation.channel.id}
              onClick={() => {
                setActiveConversationId(conversation.channel.id);
                if(history.location.pathname !== '/chat') {
                  history.push('/chat');
                }
              }}
            >
              <IonIcon
                aria-hidden="true"
                slot="start"
                icon={conversation.channel.id === activeConversationId ? chatbubblesSharp : chatbubblesOutline}
              />
              <IonLabel
                className={conversation.channel.id === activeConversationId ? 'selected' : ''}
              >
                {conversation.channel.name}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
